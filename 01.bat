@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 01
k6 run tests/01_application-list-navigation.js


pause
