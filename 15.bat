@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 15
set APPLICATION_ID=6

k6 run --summary-export "%K6_RESULT_FILE_PREFIX%.json" tests/15_application-confirm-processing.js > "%K6_RESULT_FILE_PREFIX%.txt" 2>&1


pause
