## はじめに実行
1. run-capture-auth-cookies.bat を実行してください。
2. auth-cookies.local.json ファイルが生成されていることを確認してください。

## シナリオテストの実行
K6_BROWSER_HEADLESS=false K6 run tests/01_application-list-navigation.js 
