@echo off
setlocal
rem Keep this file ASCII with Windows CRLF line endings.
cd /d "%~dp0.."
if errorlevel 1 goto path_error
where node >nul 2>nul
if errorlevel 1 goto node_error
if /i "%~1"=="--check" goto check
node site\scripts\build.mjs
if errorlevel 1 goto build_error
start "Vencubator site :4180" cmd /k node site\scripts\serve.mjs
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:4180/
exit /b 0

:check
node --version
if errorlevel 1 exit /b 1
node --check site\scripts\build.mjs
if errorlevel 1 exit /b 1
node --check site\scripts\serve.mjs
if errorlevel 1 exit /b 1
echo Launcher check passed.
exit /b 0

:path_error
echo Could not open the Vencubator project folder.
goto fail
:node_error
echo Node.js was not found in PATH. Install it from https://nodejs.org
goto fail
:build_error
echo Site build failed. See the error above.
:fail
if /i "%~1"=="--check" exit /b 1
pause
exit /b 1
