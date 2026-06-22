@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 06
set APPLICATION_ID=9

k6 run tests/06_application-review-navigation.js


pause
