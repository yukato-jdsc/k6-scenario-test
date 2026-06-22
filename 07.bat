@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 07
set APPLICATION_ID=9

k6 run --summary-export "%K6_RESULT_FILE_PREFIX%.json" tests/07_sending-mail-draft-navigation.js > "%K6_RESULT_FILE_PREFIX%.txt" 2>&1


pause
