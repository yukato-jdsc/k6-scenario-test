@echo off

set "BASE_URL=https://dev.houjin-backoffice.tm.softbank.co.jp"
set "K6_TEST_NO=%~1"

if "%K6_TEST_NO%"=="" goto :eof

rem K6実行結果の出力先を準備する
set "RESULTS_DIR=%~dp0results"
if not exist "%RESULTS_DIR%" mkdir "%RESULTS_DIR%"

set "K6_RESULT_FILE_PREFIX=%RESULTS_DIR%\%K6_TEST_NO%"

rem 画面表示系テストは負荷確認用に同時実行数を増やす
set "DEFAULT_VUS=1"
set "HIGH_LOAD_VUS=10"
set "HIGH_LOAD_TESTS=01 02 03 04 05 06 07 08 09 10 11"

set "K6_VUS=%DEFAULT_VUS%"

for %%T in (%HIGH_LOAD_TESTS%) do (
  if "%K6_TEST_NO%"=="%%T" set "K6_VUS=%HIGH_LOAD_VUS%"
)
