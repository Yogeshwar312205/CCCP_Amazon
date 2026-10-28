@echo off
title CCCP_Amazon — Starting Application
color 0A
cls

echo =====================================================
echo   CCCP_Amazon — Starting Development Servers
echo =====================================================
echo.
echo Starting backend server in a new window...
start "CCCP Backend - Port 5000" cmd /k "cd /d %~dp0server && npm run dev"

echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak >nul

echo Starting frontend in a new window...
start "CCCP Frontend - Port 5173" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo =====================================================
echo   Both servers are starting in separate windows.
echo =====================================================
echo.
echo   Backend  : http://localhost:5000
echo   Frontend : http://localhost:5173
echo   API Base : http://localhost:5000/api/v1
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo To stop: close the two server terminal windows.
echo.
pause
