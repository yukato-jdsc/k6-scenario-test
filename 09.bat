@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 09
k6 run tests/09_knowledge-candidate-review-navigation.js


pause
