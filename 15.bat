@echo off
setlocal

set K6_BROWSER_HEADLESS=false
set K6_VUS=1
call "%~dp0config.bat"
set APPLICATION_ID=6

k6 run tests/15_application-confirm-processing.js


pause
