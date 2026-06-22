@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 03
k6 run --summary-export "%K6_RESULT_FILE_PREFIX%.json" tests/03_mail-registration-edit-navigation.js > "%K6_RESULT_FILE_PREFIX%.txt" 2>&1


pause
