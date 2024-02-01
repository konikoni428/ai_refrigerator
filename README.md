<div align="center">
  <h1>:fork_and_knife: AI冷蔵庫</h1>
  <h3>
    :star: elchika 2023年SPRESENSE活用コンテスト 投稿作品
    <a href="https://elchika.com/promotion/spresense2023/conditions/">
      <img alt="elchika spresense contest" title="elchika spresense contest" src="https://img.shields.io/badge/contest page-blue.svg?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEiIHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIj48cGF0aCBkPSJNMTI5IDExMWMtNTUgNC05MyA2Ni05MyA3OEwwIDM5OGMtMiA3MCAzNiA5MiA2OSA5MWgxYzc5IDAgODctNTcgMTMwLTEyOGgyMDFjNDMgNzEgNTAgMTI4IDEyOSAxMjhoMWMzMyAxIDcxLTIxIDY5LTkxbC0zNi0yMDljMC0xMi00MC03OC05OC03OGgtMTBjLTYzIDAtOTIgMzUtOTIgNDJIMjM2YzAtNy0yOS00Mi05Mi00MmgtMTV6IiBmaWxsPSIjZmZmIi8+PC9zdmc+"/>
    </a>
    :star:
  </h3>
  <div style="text-align: center;">
    <img alt="ai refrigerator" title="ai refrigerator" src="https://github.com/konikoni428/ai_refrigerator/assets/61688218/eede05ea-bf4c-415e-9616-882c3882f410"/>
  </div>
</div>




## 目次

1. [概要](#概要)
2. [アプリケーション公開サイト](#アプリケーション公開サイト)
3. [使い方](#使い方)
4. [システムアーキテクチャ](#システムアーキテクチャ)
5. [使用した部品・サービス](#使用した部品サービス)
6. [開発に使用したツール](#開発に使用したツール)
7. [コーディング](#コーディング)
    1. [Spresense](#spresense)
    2. [GS2200 WiFi Addonボードを用いた画像アップロード](#gs2200-wifi-addonボードを用いた画像アップロード)
    3. [Web APP](#web-app)
8. [モデリング](#モデリング)
9. [全てのソースコード](#全てのソースコード)

## 概要
私たちはソニーの開発したボードコンピュータ「SPRESENSE」を活用し、冷蔵庫向けのスマートセンシングデバイスを作成しました。
このデバイスは、冷蔵庫内の食材の在庫状況をカメラによってセンシングし、定期的にサーバーにアップロードすることで、ユーザーが外出先からでも冷蔵庫の内容を確認できるような機能を提供します。

さらに、画像認識機能を備えた対話型AIモデルGPT-4との連携により、ユーザーはセンシングされた画像を用いてサーバー上でチャットボットと対話することが可能です。これにより、冷蔵庫内の食材を基にしたレシピ推薦や、特定の料理を作る際に追加で必要な食材の提案など、ユーザーの幅広いニーズに応えることが可能だと考えています。

## アプリケーション公開サイト

![app link](https://img.shields.io/badge/Vercel-app-blue.svg?logo=vercel)

> [!important]
> Githubアカウント、OpenAIの対話モデルGPT4Vが利用可能なAPI Keyが必要です

## 使い方

1. **[🌏Web]** ログインする

    Github アカウントを使ってログインします

2.  **[🌏Web]** GPT4Vが利用可能なAPIキーの入力

    ![ChatGPTKey](https://camo.elchika.com/e367574bf7ccc7854955afba0ecb6d249cc25ad0/687474703a2f2f73746f726167652e676f6f676c65617069732e636f6d2f656c6368696b612f76312f757365722f64373561346230352d363236332d343366342d393261322d6534363062343865656336312f64643730306266332d326232392d343563632d393464632d326536336238336236623538/)

    OpenAIのAPI Keyは[こちらのリンク](https://platform.openai.com/api-keys)より取得可能です

3.  **[🌏Web]** Spresenseの画像アップロード用APIキーを発行する

    左上にあるユーザー名をクリックするとAPI Keyというオプションがあるのでクリックします

    ![APIKEY取得](https://camo.elchika.com/82899d75a48ed7e69c093e441056dc085d806697/687474703a2f2f73746f726167652e676f6f676c65617069732e636f6d2f656c6368696b612f76312f757365722f64373561346230352d363236332d343366342d393261322d6534363062343865656336312f38653333333862352d383538382d346639342d623338322d333261663132323938306630/)

4.  **[🌏Web]** RegenerateをクリックしてAPI Keyを発行する

    ![APIKey発行](https://camo.elchika.com/07573c0d2ff7f93328a54beaa5143e8a054a094f/687474703a2f2f73746f726167652e676f6f676c65617069732e636f6d2f656c6368696b612f76312f757365722f64373561346230352d363236332d343366342d393261322d6534363062343865656336312f39366664306339352d343862612d346136392d626639342d633564346465633337333332/)

5. **[📟Spresense]** Spresenseの`config.h`を編集して書き込み

    編集すべき変数は以下の3つです。
    `AP_SSID`と`PASSPHRASE`には、Spresenseを接続するWiFiのSSIDとパスワードを、`HTTP_AUTH_KEY`にはStep4で作成したOpenAI APIキーを入力してください
    ```cpp
    #define  AP_SSID        "your-ssid"
    #define  PASSPHRASE     "your-password"

    #define  HTTP_AUTH_KEY  "Bearer <YOUR API KEY>"
    ```

6. **[📟Spresense]** 動かして画像アップロード

   実行！！

8. **[🌏Web]** 画像を選択してチャットする

    チャット欄の左側に＋ボタンがあり、クリックすると画像選択が可能です。
    試験用にPCから画像アップロードも可能となっております。
    （Vercel Blobの制約のため100kB程度の画像を送っていただけると助かります）

    ![画像選択](https://camo.elchika.com/026ac370f5dd5bedf187152d85e256e82a2e8907/687474703a2f2f73746f726167652e676f6f676c65617069732e636f6d2f656c6368696b612f76312f757365722f64373561346230352d363236332d343366342d393261322d6534363062343865656336312f32366536373333652d343466332d343265322d616339382d373565623939343861303065/)

    ![チャット入力](https://camo.elchika.com/db7410c9c6290e73ef5f8b91e135a542531652c7/687474703a2f2f73746f726167652e676f6f676c65617069732e636f6d2f656c6368696b612f76312f757365722f64373561346230352d363236332d343366342d393261322d6534363062343865656336312f63663733323935372d386534322d343965312d393835612d623939346534336434333537/) 

    ![回答](https://camo.elchika.com/ae25d637d8c0e4994c6315f35f77514aee9867b0/687474703a2f2f73746f726167652e676f6f676c65617069732e636f6d2f656c6368696b612f76312f757365722f64373561346230352d363236332d343366342d393261322d6534363062343865656336312f32316530656465382d616437342d343930342d393233362d623364646631663530396565/)

## システムアーキテクチャ
このシステムは以下のようなアーキテクチャ構成になっています。
![image](https://github.com/konikoni428/ai_refrigerator/assets/57473877/a9356cf4-a5e1-418d-b9b2-7a3ed76dcae6)

## 使用した部品・サービス
- SPRESENSEメインボード
  - SPRESENSEの基礎となるボードです。
- SPRESENSE拡張ボード
  - SDカードの挿入や音声のI/Oができるようになる拡張アタッチメント
- SPRESENSE HDRカメラボード
  - SPRESENSEメインボードにつなぐことで撮影ができるようになる拡張アタッチメント
- SPRESENSE Wi-Fi Add-onボード (GS2200-WiFi)
  - SPRESENSEメインボードにつなぐことでWifi通信ができるようになる拡張アタッチメント
- SDカード
  - SPRESENSE拡張ボードに挿入することでプログラムで使用するデータを格納することができる
- React + Next.js
  - Web App作成のため
- Vercel + Vercel KV + Vercel Blob
  - 作成したWebAppのホスティングや、データ保管のため
- PLAフィラメント
  - SPRESENSEを固定するためのケースを出力するための素材
  
## 開発に使用したツール
- Arduino IDE
  - SPRESENSE上で動作するプログラムのコーディング＆SPRESENSEへのインストール
- (コーディングに使用したものの記載お願いします)
- Sindoh 3DWOX 2X 3D Printer
  - モデリングしたケースを出力するための3D Printer
- Fusion360
  - ケースをモデリングするためのエディタ

## コーディング

### Spresense

#### GS2200 WiFi Addonボードを用いた画像アップロード
公式より提供されている[Arduinoライブラリ](https://github.com/jittermaster/GS2200-WiFi)をもちいてPOST通信を使いサーバーに画像をアップロードしています。

初めはなかなかうまくいかなかったのですが、ライブラリを眺めていると`strlen(body)`では画像バイナリは正しく送信するサイズの計算が行えないことに気づきました。

```cpp:src/HttpGs2200.cpp
bool HttpGs2200::post(const char* url_path, const char* body) {
	bool result = false;

	HTTP_DEBUG("POST Start");
	result = connect();

	WiFi_InitESCBuffer();

	HTTP_DEBUG("Socket Open");
	result = send(HTTP_METHOD_POST, 10, url_path, body, strlen(body));

	return result;
}
```

そのため、SDカードから画像を読み込んで画像をアップロードする際にはPOST関数を使用せず、POST関数と同等な関数かつファイルサイズを渡すことが可能な関数を`custom_post`関数として定義することで問題の回避を行いました。

```cpp:upload.ino
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


void uploadImage(char *filename) {
  // Create body
  File file = theSD.open(filename, FILE_READ);
  // Calculate size in byte
  uint32_t file_size = file.size();

  // Define_a body pointer having the continuous memory space with size `file_size`
  char *body = (char *)malloc(file_size);
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
```

なお余談ですが、一般的にWebで利用される`multipart/form-data`を使用した画像アップロードに挑戦していたのですが、まったくうまくいかなかったので、成功した方は教えていただきたいです。

また、アップロード先にVercelにてホスティングしているサーバーを指定し、HTTPSにてアップロードを行うことに挑戦しましたが、ルート証明書を入れても正しくアップロードできませんでした。RSA4096bitで証明書のサイズが大きいこと、リダイレクトがかかることが原因だと考えていますが、GS2200ライブラリ側で問題になってそうなところを修正しても改善しませんでした。

そのため回避策としてVercelのHTTPSのサーバーに対してプロキシするHTTPサーバを立てることで回避しました。
もちろん何もセキュリティ的に良くない構成となっているため、修正したいのですがどうにもできず、改善できた方は教えていただきたいです。     

```text
┌─────────────┐           ┌──────────────┐        ┌─────────────────┐
│             │   http    │              │ https  │                 │
│  Spserense  │ ────────► │  HTTP Proxy  │ ──────►│  Vercel Server  │
│             │           │              │        │                 │
└─────────────┘           └──────────────┘        └─────────────────┘
```

ちなみにプロキシは以下のようなnginx設定を用いました。
```nginx.conf
server {
    server_name ai-refrigerator.konikoni428.com;
    listen 80;
    listen [::]:80;
    charset UTF-8;

    location / {
        proxy_pass_request_headers off;
        proxy_set_header Host ai-refrigerator.vercel.app;
        proxy_set_header Authorization $http_authorization;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_pass https://ai-refrigerator.vercel.app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_buffering off;
        chunked_transfer_encoding off;
        client_max_body_size 10m;
    }
}
```

### Web APP
チャット画面には

- React
- Next.js

を用いて開発を行いました。

またWebサービスのホスティングのため、Nextjsの開発元である[Vercel社](https://vercel.com/)のホスティングサービスを利用しました
比較的無料で使える枠が大きいので今回のようなサービスを公開するには非常に利用しやすいです。

また、ChatGPTのような画面を作るにあたって[ai-chatbot](https://github.com/vercel/ai-chatbot)というNext.jsの開発元であるVercel社が出しているサンプルをベースに開発を行いました。

すべての説明はコード量から難しいため、主にSpresenseから画像を受け取る所に関係するコードについて紹介いたします。

まず、このAI 冷蔵庫 WebAppはログイン機能が存在します。そのため画像アップロード時には誰が画像をアップロードしたのか識別するためにAPIKeyを用いた認証を行います。

APIを発行する処理は以下のコードによって行われます。
`registerApiKey()`を呼び出すことでAPIKeyが発行されます。
本WebAppはGithubを用いたログイン連携が可能となっており、その処理は[NextAuth.js](https://next-auth.js.org/)によって行われます。  
その際、[Vercel KV](https://vercel.com/docs/storage/vercel-kv)と呼ばれるRedis互換のNoSQLサービスを利用してAPIKeyとuserIdの関連付けデータをサーバー側に保管します。

```typescript:app/actions.ts
import { kv } from '@vercel/kv'
import { auth } from '@/auth'

const generateRandomString = (length: number) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }
  
  return randomString;
};


export async function registerApiKey() {
  const session = await auth()
  const userId = session?.user.id

  if (!userId) {
    return {
      error: 'Unauthorized'
    }
  }

  try{
    // remove old key
    const oldApiKey = await kv.get<string>(`user:apiKey:${userId}`);
    await kv.set(`apiKey:${oldApiKey}`, "");
  } catch (error) {
    console.log("No old api key")
  }

  const newApiKey = generateRandomString(16)

  try {
    await kv.set(`user:apiKey:${userId}`, newApiKey);
    await kv.set(`apiKey:${newApiKey}`, userId);
    return {
      apiKey: newApiKey
    }
  } catch (error) {
    // Handle errors
    return {
      error: "Register Failed"
    }
  }
}
```

ここからは実際のアップロードの処理となっています。
Next.jsにはAppRoutingと呼ばれる機能があり、appフォルダ以下のフォルダ構成がそのままAPIに変換され、この例では https://<example.com>/api/uploadに対して、POSTのリクエストを処理するコードになっています。  

リクエストが届くとまず初めに認証が行われ、`Authorization: Bearer <API KEY>`のようにAuthorizationヘッダに先ほど作成したAPIKeyを付与することで認証が行われます。
問題なく認証が行われると、リクエストボディから画像を取り出し、[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)というストレージサービスに保管しています。

```typescript:api/upload/route.ts
import { kv } from '@vercel/kv'
import { put } from '@vercel/blob';

export const runtime = 'edge'

const generateRandomString = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters.charAt(randomIndex);
    }
    
    return randomString;
};


export async function POST(req: Request) {
  const authorizationHeader = req.headers.get('Authorization')

  if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
    return new Response('Bad request. You need to set Authorization header with Bearer token', {
        status: 400,
    })
  }
  const apiKey = authorizationHeader.split('Bearer ')[1]
  
  const userId = await kv.get<string>(`apiKey:${apiKey}`)
  if (!userId || userId.length === 0) {
    return new Response('Bad api key', {
      status: 401
    })
  }

  const imageData = req.body
  if (!imageData) {
    return new Response('Bad request', {
        status: 400
    })
  }

  const date = new Date()
  const filename = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}_${generateRandomString(8)}.jpg`;

  const blob = await put(`${userId}/${filename}`, imageData, {
    access: 'public',
  });

  return new Response('Success', {
    status: 200
  })
}
```

## モデリング

より冷蔵庫内の食材を正確に把握できるように、各環境（冷蔵庫）に合わせて、設営場所・カメラ角度を変えれるようなケースをモデリングしました。
角度調整部は[こちらのボールジョイントを](https://www.thingiverse.com/thing:1156296)、SPRESENSE固定部は[公式githubを](https://github.com/sonydevworld/spresense-hw-design-files/blob/master/Case/LTE-Board-Case-Sample/stl/LTE-Board-Case-Sample_bottom.stl)を参考にさせていただきました。

（参考にした角度調整部（左）参考にしたSPRESENSE固定部（右））
![image](https://github.com/konikoni428/ai_refrigerator/assets/57473877/a83bdedd-f847-471d-a218-7552a32f99f2)


モデリングにはFusion360を、プリントにはSindoh 3DWOX 2X 3D Printerを使用しました。
実際のモデルデータは[github](https://github.com/konikoni428/ai_refrigerator/tree/main/case_model)に置いています。



（制作した土台部分のモデル（左）制作したSPRESENSE固定部（右））
![image](https://github.com/konikoni428/ai_refrigerator/assets/57473877/334046a5-85cf-4033-892c-0d0d59c04983)




（ボール部分によって角度調整が可能（左・中央）。実際にSPRESENSEをマウントして撮影している様子（右））
![image](https://github.com/konikoni428/ai_refrigerator/assets/57473877/82997fa5-8081-4f26-9235-28d0a7cb1811)


はじめてのモデリングでジョイント部分がちゃんと機能するか心配でしたが、きれいに出力＆機能されました！

## 全てのソースコード

Elchikaにのみ記入



