@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 12
k6 run tests/12_email-extraction-processing.js


pause
