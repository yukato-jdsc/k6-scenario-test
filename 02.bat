@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 02
k6 run tests/02_mail-registration-navigation.js


pause
