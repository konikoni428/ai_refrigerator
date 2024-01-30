#include <HttpGs2200.h>
#include <GS2200Hal.h>
#include <SDHCI.h>
// #include <RTC.h>
#include <TelitWiFi.h>
#include <stdio.h> /* for sprintf */
#include <Camera.h>
#include "config.h"

#define CONSOLE_BAUDRATE 115200
#define TOTAL_PICTURE_COUNT 10
#define PICTURE_INTERVAL 1

const uint16_t RECEIVE_PACKET_SIZE = 1500;
uint8_t Receive_Data[RECEIVE_PACKET_SIZE] = { 0 };

TelitWiFi gs2200;
TWIFI_Params gsparams;
HttpGs2200 theHttpGs2200(&gs2200);
HTTPGS2200_HostParams hostParams;
SDClass theSD;
int take_picture_count = 0;

void parse_httpresponse(char *message) {
  char *p;

  if ((p = strstr(message, "200 OK\r\n")) != NULL) {
    ConsolePrintf("Response : %s\r\n", p + 8);
  }
}


/* ---------------------------------------------------------------------
 * Function to print error message from the camera
* ----------------------------------------------------------------------
*/
void printError(enum CamErr err) {
  Serial.print("Error: ");
  switch (err) {
    case CAM_ERR_NO_DEVICE:
      Serial.println("No Device");
      break;
    case CAM_ERR_ILLEGAL_DEVERR:
      Serial.println("Illegal device error");
      break;
    case CAM_ERR_ALREADY_INITIALIZED:
      Serial.println("Already initialized");
      break;
    case CAM_ERR_NOT_INITIALIZED:
      Serial.println("Not initialized");
      break;
    case CAM_ERR_NOT_STILL_INITIALIZED:
      Serial.println("Still picture not initialized");
      break;
    case CAM_ERR_CANT_CREATE_THREAD:
      Serial.println("Failed to create thread");
      break;
    case CAM_ERR_INVALID_PARAM:
      Serial.println("Invalid parameter");
      break;
    case CAM_ERR_NO_MEMORY:
      Serial.println("No memory");
      break;
    case CAM_ERR_USR_INUSED:
      Serial.println("Buffer already in use");
      break;
    case CAM_ERR_NOT_PERMITTED:
      Serial.println("Operation not permitted");
      break;
    default:
      break;
  }
}


/* ---------------------------------------------------------------------
 * Callback from Camera library when video frame is captured.
* ----------------------------------------------------------------------
*/
void CamCB(CamImage img) {

  /* Check the img instance is available or not. */

  if (img.isAvailable()) {

    /* If you want RGB565 data, convert image data format to RGB565 */

    img.convertPixFormat(CAM_IMAGE_PIX_FMT_RGB565);

    /* You can use image data directly by using getImgSize() and getImgBuff().
       * for displaying image to a display, etc. */

    Serial.print("Image data size = ");
    Serial.print(img.getImgSize(), DEC);
    Serial.print(" , ");

    Serial.print("buff addr = ");
    Serial.print((unsigned long)img.getImgBuff(), HEX);
    Serial.println("");
  } else {
    Serial.println("Failed to get video stream image");
  }
}


/* ---------------------------------------------------------------------
* Function to send a file in the SD card to the HTTP server
* ----------------------------------------------------------------------
*/
void uploadImage(char *filename) {
  // Create body
  File file = theSD.open(filename, FILE_READ);
  // Calculate size in byte
  uint32_t file_size = file.size();

  // Define_a body pointer having the continuous memory space with size `file_size`
  char *body = (char *)malloc(file_size);  // +1 is null char
  if (body == NULL) {
    Serial.println("No free memory");
  }

  // Read byte of the file iteratively and put it in the address where each member of body pointer points out
  int index = 0;
  while (file.available()) {
    body[index++] = file.read();
  }
  file.close();

  // Send the body data to the server
  bool result = custom_post(HTTP_POST_PATH, body, file_size);
  if (false == result) {
    Serial.println("Post Failed");
  }
  free(body);
}


/* ---------------------------------------------------------------------
* Setup Function
* ----------------------------------------------------------------------
*/
void setup() {
  /* Open serial communications and wait for port to open */

  Serial.begin(CONSOLE_BAUDRATE);
  while (!Serial) {
    ; /* wait for serial port to connect. Needed for native USB port only */
  }

  /* Initialize SD */
  while (!theSD.begin()) {
    /* wait until SD card is mounted. */
    Serial.println("Insert SD card.");
  }

  /* -----------------------------------
   * GS2200-WiFi Setup
   * -----------------------------------
   */

  // RTC.begin();
  // RtcTime compiledDateTime(__DATE__, __TIME__);
  // RTC.setTime(compiledDateTime);

  /* initialize digital pin LED_BUILTIN as an output. */
  pinMode(LED0, OUTPUT);
  digitalWrite(LED0, LOW);         // turn the LED off (LOW is the voltage level)
  Serial.begin(CONSOLE_BAUDRATE);  // talk to PC

  /* Initialize SPI access of GS2200 */
  Init_GS2200_SPI_type(iS110B_TypeC);

  /* Initialize AT Command Library Buffer */
  gsparams.mode = ATCMD_MODE_STATION;
  gsparams.psave = ATCMD_PSAVE_DEFAULT;
  if (gs2200.begin(gsparams)) {
    Serial.println("GS2200 Initilization Fails");
    while (1)
      ;
  }

  /* GS2200 Association to AP */
  if (gs2200.activate_station(AP_SSID, PASSPHRASE)) {
    Serial.println("Association Fails");
    while (1)
      ;
  }

  hostParams.host = (char *)HTTP_SRVR_IP;
  hostParams.port = (char *)HTTP_PORT;
  theHttpGs2200.begin(&hostParams);

  Serial.println("Start HTTP Client");
  // Serial.println("Start HTTP Secure Client");

  /* Set HTTP Headers */
  theHttpGs2200.config(HTTP_HEADER_AUTHORIZATION, HTTP_AUTH_KEY);
  // theHttpGs2200.config(HTTP_HEADER_TRANSFER_ENCODING, "chunked");
  theHttpGs2200.config(HTTP_HEADER_HOST, HTTP_SRVR_IP);
  theHttpGs2200.config(HTTP_HEADER_CONTENT_TYPE, "application/octet-stream");

  // // Set certifications via a file on the SD card before connecting to the server
	// File rootCertsFile = theSD.open(ROOTCA_FILE, FILE_READ);
  // // Serial.println(rootCertsFile.available());
	// char time_string[128];
	// RtcTime rtc = RTC.getTime();
	// snprintf(time_string, sizeof(time_string), "%02d/%02d/%04d,%02d:%02d:%02d", rtc.day(), rtc.month(), rtc.year(), rtc.hour(), rtc.minute(), rtc.second());

	// theHttpGs2200.set_cert((char*)"TLS_CA", time_string, 0, 1, &rootCertsFile);
	// rootCertsFile.close();


  /* -----------------------------------
   * Camera Setup
   * -----------------------------------
   */

  CamErr err;

  /* begin() without parameters means that
   * number of buffers = 1, 30FPS, QVGA, YUV 4:2:2 format */

  Serial.println("Prepare camera");
  err = theCamera.begin();
  if (err != CAM_ERR_SUCCESS) {
    printError(err);
  }

  /* Start video stream.
   * If received video stream data from camera device,
   *  camera library call CamCB.
   */

  Serial.println("Start streaming");
  err = theCamera.startStreaming(true, CamCB);
  if (err != CAM_ERR_SUCCESS) {
    printError(err);
  }

  /* Auto white balance configuration */

  Serial.println("Set Auto white balance parameter");
  err = theCamera.setAutoWhiteBalanceMode(CAM_WHITE_BALANCE_DAYLIGHT);
  if (err != CAM_ERR_SUCCESS) {
    printError(err);
  }


  /* Set parameters about still picture.
   * In the following case, QUADVGA and JPEG.
   */

  Serial.println("Set still picture format");
  err = theCamera.setStillPictureImageFormat(
    // CAM_IMGSIZE_QUADVGA_H,
    // CAM_IMGSIZE_QUADVGA_V,
    CAM_IMGSIZE_VGA_H,
    CAM_IMGSIZE_VGA_V,
    CAM_IMAGE_PIX_FMT_JPG);
  if (err != CAM_ERR_SUCCESS) {
    printError(err);
  }

  digitalWrite(LED0, HIGH);  // turn on LED
}

/* ---------------------------------------------------------------------
* Function to send byte data to the HTTP server
* ----------------------------------------------------------------------
*/
bool custom_post(const char *url_path, const char *body, uint32_t size) {
  char size_string[10];
  snprintf(size_string, sizeof(size_string), "%d", size);
  theHttpGs2200.config(HTTP_HEADER_CONTENT_LENGTH, size_string);
  Serial.println("Size");
  Serial.println(size_string);

  bool result = false;
  result = theHttpGs2200.connect();
  WiFi_InitESCBuffer();
  result = theHttpGs2200.send(HTTP_METHOD_POST, 10, url_path, body, size);
  return result;
}


bool first = false;
// the loop function runs over and over again forever
void loop() {

  sleep(PICTURE_INTERVAL); /* wait for predefined seconds to take still picture. */

  if (!first) {
    // first = true;

    if (take_picture_count < TOTAL_PICTURE_COUNT) {

      /* Take still picture.
        * Unlike video stream(startStreaming) , this API wait to receive image data
        *  from camera device.
        */

      Serial.println("call takePicture()");
      CamImage img = theCamera.takePicture();

      /* Check availability of the img instance. */
      /* If any errors occur, the img is not available. */

      if (img.isAvailable()) {
        /* Create file name */

        char filename[16] = { 0 };
        sprintf(filename, "PICT%03d.JPG", take_picture_count);

        Serial.print("Save taken picture as ");
        Serial.print(filename);
        Serial.println("");


        /* FOR DEBUG
            * Remove the old file with the same file name as new created file,
            * and create new file.
            */
        theSD.remove(filename);
        File myFile = theSD.open(filename, FILE_WRITE);
        myFile.write(img.getImgBuff(), img.getImgSize());
        myFile.close();


        uploadImage(filename);

        bool result = false;
        do {
          result = theHttpGs2200.receive(5000);
          if (result) {
            theHttpGs2200.read_data(Receive_Data, RECEIVE_PACKET_SIZE);
            ConsolePrintf("%s", (char *)(Receive_Data));
          } else {
            // AT+HTTPSEND command is done
            Serial.println("\r\n");
          }
        } while (result);

        result = theHttpGs2200.end();
      } else {
        /* The size of a picture may exceed the allocated memory size.
            * Then, allocate the larger memory size and/or decrease the size of a picture.
            * [How to allocate the larger memory]
            * - Decrease jpgbufsize_divisor specified by setStillPictureImageFormat()
            * - Increase the Memory size from Arduino IDE tools Menu
            * [How to decrease the size of a picture]
            * - Decrease the JPEG quality by setJPEGQuality()
            */

        Serial.println("Failed to take picture");
      }
    } else if (take_picture_count == TOTAL_PICTURE_COUNT) {
      Serial.println("End.");
      theCamera.end();
    }

    take_picture_count++;
  }
}