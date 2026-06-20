@echo off
setlocal

set K6_BROWSER_HEADLESS=true
set BASE_URL=https://dev.houjin-backoffice.tm.softbank.co.jp
set K6_USERNAME=9000417L2
set K6_PASSWORD=PassWord$99

k6 run capture-auth-cookies.js > result.txt 2>&1
if errorlevel 1 exit /b %errorlevel%

powershell -NoProfile -ExecutionPolicy Bypass -File extract-k6-auth-cookies.ps1
if errorlevel 1 exit /b %errorlevel%

if exist result.txt del result.txt
exit /b %errorlevel%
