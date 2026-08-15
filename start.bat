@echo off
REM start.bat — double-click this to start the backend server AND
REM open the website in your default browser, in one go.
REM
REM Place this file directly inside the student-study-planner folder
REM (next to the "backend" and "pages" folders).

echo Starting backend server...
start "Study Planner Backend" cmd /k "cd backend && npm run dev"

echo Waiting for the server to start...
timeout /t 5 /nobreak >nul

echo Opening the website...
start "" "%~dp0pages\login.html"

echo Done. You can close this window (the backend keeps running in its own window).
