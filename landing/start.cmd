@echo off
chcp 65001 >nul
rem Vencubator 랜딩 + 프로토타입 로컬 실행 (Windows). 이 파일을 더블클릭하세요.
cd /d "%~dp0\.."
where node >nul 2>nul || (echo Node.js가 필요합니다: https://nodejs.org & pause & exit /b 1)
start "Vencubator prototype :4183" cmd /k node prototype\server.mjs
start "Vencubator landing :4174" cmd /k node landing\scripts\serve.mjs
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:4174/landing/
