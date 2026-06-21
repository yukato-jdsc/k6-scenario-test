@echo off
setlocal

set K6_BROWSER_HEADLESS=true
call "%~dp0config.bat"
set K6_USERNAME=9000417L2
set K6_PASSWORD=PassWord$99

k6 run utils/capture-auth-cookies.js > result.txt 2>&1
if errorlevel 1 exit /b %errorlevel%

powershell -NoProfile -ExecutionPolicy Bypass -File utils/extract-k6-auth-cookies.ps1
if errorlevel 1 exit /b %errorlevel%

if exist result.txt del result.txt
exit /b %errorlevel%
