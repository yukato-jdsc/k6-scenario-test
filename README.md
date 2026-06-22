## はじめに
以下の手順でログイン済みのクッキーを生成してください。
1. run-capture-auth-cookies.bat を実行する
2. auth-cookies.local.json ファイルが生成されていることを確認

## シナリオテストの実行方法
各 *.bat を実行してください（ファイル名はテスト番号を示します）

## 各テストの計測対象
Trend メトリクスに記録する時間は、以下の対象に到達するまでの時間です。
#1〜#11 は画面上の文字が表示されるまでではなく、指定したサーバーレスポンスを受信するまでを計測します。
画面表示の確認は checks として継続しますが、Trend の時間には含めません。

| No. | テストファイル | 計測対象 |
| --- | --- | --- |
| 1 | tests/01_application-list-navigation.js | `/scb010101` へ遷移開始してから `GET /api/applications` のレスポンス受信まで |
| 2 | tests/02_mail-registration-navigation.js | `/scb010102` へ遷移開始してから `GET /scb010102` の画面 HTML レスポンス受信まで |
| 3 | tests/03_mail-registration-edit-navigation.js | `/scb010102-edit` へ遷移開始してから `GET /scb010102-edit` の画面 HTML レスポンス受信まで |
| 4 | tests/04_customer-selection-navigation.js | `/scb020101` へ遷移開始してから `GET /api/applications/{APPLICATION_ID}` と `GET /api/applications/{APPLICATION_ID}/bfs-entries` の両方のレスポンス受信まで |
| 5 | tests/05_confirmation-mail-draft-navigation.js | `/scb040101` へ遷移開始してから `POST /api/applications/{APPLICATION_ID}/confirmation-email-draft` のレスポンス受信まで |
| 6 | tests/06_application-review-navigation.js | `/scc010501` へ遷移開始してから `GET /api/applications/{APPLICATION_ID}/field-evidences` のレスポンス受信まで |
| 7 | tests/07_sending-mail-draft-navigation.js | `/scd010101` へ遷移開始してから `GET /api/applications/{APPLICATION_ID}` と `GET /api/applications/{APPLICATION_ID}/pdf` の両方のレスポンス受信まで |
| 8 | tests/08_knowledge-registration-navigation.js | `/scg010101` へ遷移開始してから `GET /scg010101` の画面 HTML レスポンス受信まで |
| 9 | tests/09_knowledge-candidate-review-navigation.js | 「経験知を抽出」ボタン押下直前から `POST /api/knowledges/extract` のレスポンス受信まで |
| 10 | tests/10_knowledge-management-navigation.js | `/scg010302` へ遷移開始してから `GET /api/knowledges/grouped` のレスポンス受信まで |
| 11 | tests/11_portal-navigation.js | `/scz020101` へ遷移開始してから `GET /scz020101` の画面 HTML レスポンス受信まで |
| 12 | tests/12_email-extraction-processing.js | 依頼メール登録画面で「登録」ボタンを押下してから、顧客候補確認画面の表示確認まで |
| 13 | tests/13_customer-confirm-processing.js | 顧客候補確認画面で「確定して次へ」ボタンを押下してから、申請内容確認画面の表示確認まで |
| 14 | tests/14_confirmation-mail-draft-processing.js | 申請内容確認画面で「確認依頼メールを作成」ボタンを押下してから、確認メールドラフト作成中スピナーが消えるまで |
| 15 | tests/15_application-confirm-processing.js | 申請内容の確定モーダルで「申請を確定」ボタンを押下してから、申込書送付メール画面の成功表示確認まで |
