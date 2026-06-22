@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 10
k6 run tests/10_knowledge-management-navigation.js


pause
