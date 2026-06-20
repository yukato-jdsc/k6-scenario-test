@echo off
setlocal

set K6_BROWSER_HEADLESS=false
set K6_VUS=1
set BASE_URL=https://dev.houjin-backoffice.tm.softbank.co.jp
set K6_APPLICATION_ID=9

k6 run tests/05_confirmation-mail-draft-navigation.js


pause
