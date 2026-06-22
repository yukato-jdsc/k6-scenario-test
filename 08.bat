@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 08
k6 run tests/08_knowledge-registration-navigation.js


pause
