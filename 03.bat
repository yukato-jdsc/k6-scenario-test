@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 03
k6 run tests/03_mail-registration-edit-navigation.js


pause
