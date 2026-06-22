@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 05
set APPLICATION_ID=9

k6 run tests/05_confirmation-mail-draft-navigation.js


pause
