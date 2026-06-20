## 最初に
1. run-capture-auth-cookies.bat を実行してください。
2. auth-cookies.local.json ファイルが生成されていることを確認してください。


## シナリオテストの実行
K6 run 01_application-list-navigation.js -e BASE_URL="dev.houjin-backoffice.tm.softbank.co.jp"
