@echo off
setlocal

set K6_BROWSER_HEADLESS=false
set K6_VUS=1
call "%~dp0config.bat"


k6 run tests/03_mail-registration-edit-navigation.js


pause
