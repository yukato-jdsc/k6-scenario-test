@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 14
set APPLICATION_ID=6

k6 run --summary-export "%K6_RESULT_FILE_PREFIX%.json" tests/14_confirmation-mail-draft-processing.js > "%K6_RESULT_FILE_PREFIX%.txt" 2>&1


pause
