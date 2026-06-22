@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 02
k6 run --summary-export "%K6_RESULT_FILE_PREFIX%.json" tests/02_mail-registration-navigation.js > "%K6_RESULT_FILE_PREFIX%.txt" 2>&1


pause
