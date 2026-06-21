@echo off
setlocal

set K6_BROWSER_HEADLESS=false
set K6_VUS=1
call "%~dp0config.bat"
set APPLICATION_ID=9

k6 run tests/05_confirmation-mail-draft-navigation.js


pause
