@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 11
k6 run tests/11_portal-navigation.js


pause
