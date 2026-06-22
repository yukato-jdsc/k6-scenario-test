@echo off

set "BASE_URL=https://dev.houjin-backoffice.tm.softbank.co.jp"
set "K6_TEST_NO=%~1"

if "%K6_TEST_NO%"=="" goto :eof

set "K6_VUS=1"

if "%K6_TEST_NO%"=="01" set "K6_VUS=10"
if "%K6_TEST_NO%"=="02" set "K6_VUS=10"
if "%K6_TEST_NO%"=="03" set "K6_VUS=10"
if "%K6_TEST_NO%"=="04" set "K6_VUS=10"
if "%K6_TEST_NO%"=="05" set "K6_VUS=10"
if "%K6_TEST_NO%"=="06" set "K6_VUS=10"
if "%K6_TEST_NO%"=="07" set "K6_VUS=10"
if "%K6_TEST_NO%"=="08" set "K6_VUS=10"
if "%K6_TEST_NO%"=="09" set "K6_VUS=10"
if "%K6_TEST_NO%"=="10" set "K6_VUS=10"
if "%K6_TEST_NO%"=="11" set "K6_VUS=10"
