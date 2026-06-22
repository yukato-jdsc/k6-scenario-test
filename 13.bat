@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 13
set APPLICATION_ID=2

k6 run tests/13_customer-confirm-processing.js


pause
