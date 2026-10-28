@echo off
title CCCP_Amazon — First-Time Setup
color 0A
cls

echo =====================================================
echo   CCCP_Amazon Multi-Vendor Marketplace
echo   First-Time Setup Script for Windows
echo =====================================================
echo.

:: ── Check Node.js ────────────────────────────────────
echo [1/6] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH.
    echo Please download and install Node.js from https://nodejs.org
    echo Choose the LTS version, then re-run this script.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node --version') do set NODE_VER=%%v
echo OK - Node.js %NODE_VER% found.

:: ── Check npm ─────────────────────────────────────────
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm not found. Reinstall Node.js from nodejs.org.
    pause
    exit /b 1
)

:: ── Check MySQL ───────────────────────────────────────
echo.
echo [2/6] Checking MySQL...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MySQL CLI not found in PATH.
    echo Make sure MySQL is running and accessible.
    echo If using XAMPP: start Apache and MySQL from XAMPP Control Panel.
    echo If using MySQL Workbench: ensure the MySQL service is running.
    echo.
    echo Then press any key to continue anyway...
    pause >nul
) else (
    for /f "tokens=*" %%v in ('mysql --version') do set MYSQL_VER=%%v
    echo OK - %MYSQL_VER%
)

:: ── Setup Server .env ─────────────────────────────────
echo.
echo [3/6] Setting up environment files...

if not exist "server\.env" (
    copy "server\.env.example" "server\.env" >nul
    echo Created server/.env from template.
    echo.
    echo IMPORTANT: Open server/.env and update these values:
    echo   DB_PORT   - your MySQL port (3306 for XAMPP, 3307 for Docker)
    echo   DB_USER   - your MySQL username (root for XAMPP)
    echo   DB_PASSWORD - your MySQL password (blank for XAMPP root)
    echo   JWT_SECRET  - change to any long random string
    echo.
    echo Press any key after editing server/.env to continue...
    pause >nul
) else (
    echo server/.env already exists, skipping.
)

if not exist "client\.env" (
    copy "client\.env.example" "client\.env" >nul
    echo Created client/.env from template.
) else (
    echo client/.env already exists, skipping.
)

:: ── Install Server Dependencies ───────────────────────
echo.
echo [4/6] Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed for server. Check error above.
    pause
    exit /b 1
)
echo OK - Server dependencies installed.
cd ..

:: ── Install Client Dependencies ───────────────────────
echo.
echo [5/6] Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo ERROR: npm install failed for client. Check error above.
    pause
    exit /b 1
)
echo OK - Client dependencies installed.
cd ..

:: ── Database Setup + Seeding ──────────────────────────
echo.
echo [6/6] Setting up database and seeding demo data...
echo.
echo This will:
echo   - Connect to your MySQL database
echo   - Create all tables (DROPS existing data if any!)
echo   - Seed 10 seller shops, products, 3 customers, and admin accounts
echo.
set /p CONFIRM=Type YES to proceed with database setup: 
if /i "%CONFIRM%" neq "YES" (
    echo Skipped database setup. Run manually with:
    echo   cd server
    echo   node scripts/migrate.js --seed
    goto :done
)

cd server
node scripts/migrate.js --seed
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Database setup failed.
    echo Common fixes:
    echo   1. Make sure MySQL is running
    echo   2. Check DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in server/.env
    echo   3. The database user must have CREATE privileges
    echo.
    pause
    exit /b 1
)
cd ..

:done
echo.
echo =====================================================
echo   SETUP COMPLETE!
echo =====================================================
echo.
echo To START the application, run:
echo   start-app.bat
echo.
echo Or manually in TWO separate terminal windows:
echo.
echo   Terminal 1 (Server):
echo     cd server
echo     npm run dev
echo.
echo   Terminal 2 (Client):
echo     cd client
echo     npm run dev
echo.
echo Then open: http://localhost:5173
echo.
echo See SETUP.md for login credentials and full guide.
echo.
pause
