@echo off
setlocal

set K6_BROWSER_HEADLESS=false
set K6_VUS=1
set BASE_URL=https://dev.houjin-backoffice.tm.softbank.co.jp


k6 run tests/12_email-extraction-processing.js


pause
