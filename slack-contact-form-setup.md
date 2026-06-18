# Google Forms と Slack の連携手順

このサイトのお問い合わせページは、HTML 内に Google Forms を埋め込む構成です。
Slack 通知はサイト側の JavaScript ではなく、Google Form の回答先スプレッドシートに Google Apps Script を設定して行います。

## 全体の流れ

```text
Google Form 送信
-> 回答スプレッドシートに記録
-> Apps Script の onFormSubmit が実行
-> Slack Incoming Webhook に POST
-> Slack チャンネルに通知
```

## 1. Slack Incoming Webhook を用意する

1. Slack API のアプリ管理画面で Slack App を作成する
2. Incoming Webhooks を有効化する
3. 通知先チャンネルを選び、Webhook URL を発行する

参考: https://api.slack.com/messaging/webhooks

Webhook URL は秘密情報です。GitHub、HTML、公開ファイルには直接書かないでください。

## 2. Google Form の回答先スプレッドシートを開く

対象の Google Form で、回答先になっている Google スプレッドシートを開きます。

このリポジトリでは、お問い合わせページは以下のように Google Forms を埋め込んでいます。

- `contact-medical.html`
- `contact-patient.html`
- `contact-company.html`

## 3. Apps Script を作成する

スプレッドシート上部のメニューから `拡張機能 > Apps Script` を開き、以下のコードを追加します。

```javascript
function onFormSubmit(e) {
  const webhookUrl = PropertiesService
    .getScriptProperties()
    .getProperty("SLACK_WEBHOOK_URL");

  const values = e.namedValues || {};
  const body = Object.keys(values)
    .map((key) => `*${key}*: ${values[key].join(", ")}`)
    .join("\n");

  const payload = {
    text: "新しいお問い合わせが届きました",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*新しいお問い合わせが届きました*\n${body}`,
        },
      },
    ],
  };

  UrlFetchApp.fetch(webhookUrl, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
  });
}
```

## 4. Webhook URL をスクリプトプロパティに保存する

Apps Script のプロジェクト設定から、スクリプトプロパティに以下を追加します。

```text
SLACK_WEBHOOK_URL = https://hooks.slack.com/services/...
```

コード内に Webhook URL を直接書かず、必ずスクリプトプロパティから読むようにします。

## 5. フォーム送信時のトリガーを追加する

Apps Script の左メニューから `トリガー` を開き、トリガーを追加します。

- 実行する関数: `onFormSubmit`
- イベントのソース: `スプレッドシート`
- イベントの種類: `フォーム送信時`

初回実行時またはトリガー保存時に、Google アカウントの権限承認が必要になることがあります。

## 6. 動作確認する

1. Google Form からテスト送信する
2. 回答先スプレッドシートに回答が記録されることを確認する
3. Slack の指定チャンネルに通知が届くことを確認する
4. 通知されない場合は Apps Script の実行ログを確認する

## 注意点

- Webhook URL は公開リポジトリにコミットしない
- Slack 通知に個人情報や医療情報を含めすぎない
- Slack 側のチャンネル権限を必要最小限にする
- Google Form の項目名を変更すると、Slack 通知の表示名も変わる
- 複数フォームで同じ仕組みを使う場合は、フォームごとのスプレッドシートに同じ Apps Script とトリガーを設定する

