@echo off
setlocal

set K6_BROWSER_HEADLESS=false
call "%~dp0config.bat" 07
set APPLICATION_ID=9

k6 run tests/07_sending-mail-draft-navigation.js


pause
