@echo off
setlocal

set K6_BROWSER_HEADLESS=false
set K6_VUS=1
set BASE_URL=https://dev.houjin-backoffice.tm.softbank.co.jp
set APPLICATION_ID=6

k6 run tests/14_confirmation-mail-draft-processing.js


pause
