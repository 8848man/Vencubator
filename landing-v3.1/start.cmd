@echo off
chcp 65001 >nul
rem Vencubator 랜딩 v3.1 “뿌리” 로컬 실행 (Windows). 이 파일을 더블클릭하세요. 앱은 같은 서버의 /app/ 으로 열립니다.
cd /d "%~dp0\.."
where node >nul 2>nul || (echo Node.js가 필요합니다: https://nodejs.org & pause & exit /b 1)
start "Vencubator landing v3.1 :4177" cmd /k node landing-v3.1\scripts\serve.mjs
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:4177/landing-v3.1/
