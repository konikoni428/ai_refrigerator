/*
 *  HTTPClient.ino - GainSpan WiFi Module Control Program
 *  Copyright 2019 Norikazu Goto
 *
 *  This work is free software; you can redistribute it and/or modify it under the terms 
 *  of the GNU Lesser General Public License as published by the Free Software Foundation; 
 *  either version 2.1 of the License, or (at your option) any later version.
 *
 *  This work is distributed in the hope that it will be useful, but without any warranty; 
 *  without even the implied warranty of merchantability or fitness for a particular 
 *  purpose. See the GNU Lesser General Public License for more details.
 *
 *  You should have received a copy of the GNU Lesser General Public License along with 
 *  this work; if not, write to the Free Software Foundation, 
 *  Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
*/

#include <HttpGs2200.h>
#include <GS2200Hal.h>
#include <SDHCI.h>
#include <TelitWiFi.h>
#include "config.h"

#define  CONSOLE_BAUDRATE  115200


const uint16_t RECEIVE_PACKET_SIZE = 1500;
uint8_t Receive_Data[RECEIVE_PACKET_SIZE] = {0};

TelitWiFi gs2200;
TWIFI_Params gsparams;
HttpGs2200 theHttpGs2200(&gs2200);
HTTPGS2200_HostParams hostParams;
SDClass  theSD;

void parse_httpresponse(char *message)
{
	char *p;
	
	if ((p=strstr(message, "200 OK\r\n")) != NULL) {
		ConsolePrintf("Response : %s\r\n", p+8);
	}
}

void setup() {

	/* initialize digital pin LED_BUILTIN as an output. */
	pinMode(LED0, OUTPUT);
	digitalWrite(LED0, LOW);   // turn the LED off (LOW is the voltage level)
	Serial.begin(CONSOLE_BAUDRATE); // talk to PC

	/* Initialize SPI access of GS2200 */
	Init_GS2200_SPI_type(iS110B_TypeC);

	/* Initialize AT Command Library Buffer */
	gsparams.mode = ATCMD_MODE_STATION;
	gsparams.psave = ATCMD_PSAVE_DEFAULT;
	if (gs2200.begin(gsparams)) {
		Serial.println("GS2200 Initilization Fails");
		while (1);
	}

	/* GS2200 Association to AP */
	if (gs2200.activate_station(AP_SSID, PASSPHRASE)) {
		Serial.println("Association Fails");
		while (1);
	}

	hostParams.host = (char *)HTTP_SRVR_IP;
	hostParams.port = (char *)HTTP_PORT;
	theHttpGs2200.begin(&hostParams);

	Serial.println("Start HTTP Client");

	/* Set HTTP Headers */
	// theHttpGs2200.config(HTTP_HEADER_AUTHORIZATION, "Basic dGVzdDp0ZXN0MTIz");
	// theHttpGs2200.config(HTTP_HEADER_TRANSFER_ENCODING, "chunked");
	theHttpGs2200.config(HTTP_HEADER_HOST, HTTP_SRVR_IP);
  theHttpGs2200.config(HTTP_HEADER_CONTENT_TYPE, "application/octet-stream");

  /* Initialize SD */
  Serial.print("Insert SD card.");
  while (!theSD.begin()) {
    ; /* wait until SD card is mounted. */
  }

	digitalWrite(LED0, HIGH); // turn on LED

}

bool custom_post(const char* url_path, const char* body, uint32_t size) {
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


void uploadImage(char* filename) {
  // Create body
  File file = theSD.open(filename, FILE_READ);
  // Calculate Size
  uint32_t file_size = file.size();

  // create_body 
  char* body = (char *)malloc(file_size); // +1 is null char
  if(body == NULL) {
    Serial.println("No free memory");
  }

  // Copy body
  int index = 0;
  while (file.available()) {
    body[index++] = file.read();
  }
  file.close();

  bool result = custom_post(HTTP_POST_PATH, body, file_size);
  if (false == result) {
    Serial.println("Post Failed");
  }
  free(body);
}

bool first = false;
// the loop function runs over and over again forever
void loop() {

	static int count = 0;

  if (!first) {

    uploadImage("PICT001.JPG");
    first = true;

    bool result = false;
    do {
      result = theHttpGs2200.receive(5000);
      if (result) {
        theHttpGs2200.read_data(Receive_Data, RECEIVE_PACKET_SIZE);
        ConsolePrintf("%s", (char *)(Receive_Data));
      } else {
        // AT+HTTPSEND command is done
        Serial.println( "\r\n");
      }
    } while (result);

    result = theHttpGs2200.end();
  }

}
