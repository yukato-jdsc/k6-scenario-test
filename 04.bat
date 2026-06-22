@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 04
set APPLICATION_ID=9

k6 run tests/04_customer-selection-navigation.js


pause
