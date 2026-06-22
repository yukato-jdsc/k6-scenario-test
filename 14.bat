@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 14
set APPLICATION_ID=6

k6 run tests/14_confirmation-mail-draft-processing.js


pause
