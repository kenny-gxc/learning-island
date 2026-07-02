@echo off
if exist .next rmdir /s /q .next
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
start http://localhost:3000
npm run dev
