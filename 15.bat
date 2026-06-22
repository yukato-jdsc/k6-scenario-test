@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 15
set APPLICATION_ID=6

k6 run tests/15_application-confirm-processing.js


pause
