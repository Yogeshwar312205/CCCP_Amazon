@echo off
echo ========================================
echo CCCP Amazon - Development Environment
echo ========================================
echo.
echo Starting Backend Server (Port 5000)...
echo.

cd server
start cmd /k "npm run dev"

echo.
echo Starting Frontend Server (Port 5173)...
echo.

cd ..\client
start cmd /k "npm run dev"

echo.
echo ========================================
echo Both servers are starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo ========================================
echo.
pause
