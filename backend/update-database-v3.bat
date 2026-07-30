@echo off
setlocal enabledelayedexpansion
title Relay Desk - Database UPDATE v3 (safe, non-destructive)

set DB_HOST=localhost
set DB_PORT=3306
set DB_USER=root
set DB_PASSWORD=root

echo ============================================
echo   Relay Desk - Database UPDATE v3
echo ============================================
echo.
echo This runs migration-v3.sql against the EXISTING "relay_desk"
echo database. It does NOT delete anything - it adds:
echo   - Branch Management fields (manual number, enable/disable)
echo   - Department + status-change permission per user
echo   - Ticket requester_name + direct branch_id
echo   - Ticket Transfer workflow tables
echo   - Detailed Activity Timeline table
echo   - Internal Remark visibility settings
echo.
echo Your current tickets, customers, and settings are safe.
echo.

set MYSQL_EXE=
where mysql >nul 2>nul
if not errorlevel 1 set MYSQL_EXE=mysql

if "%MYSQL_EXE%"=="" (
    for %%P in (
        "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
        "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
        "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
        "C:\xampp\mysql\bin\mysql.exe"
        "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysql.exe"
        "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe"
    ) do (
        if exist %%P set MYSQL_EXE=%%~P
    )
)

if "%MYSQL_EXE%"=="" (
    echo ERROR: Could not find "mysql.exe" automatically.
    echo Open this .bat file in Notepad and add:
    echo     set MYSQL_EXE=C:\path\to\your\mysql.exe
    echo right below "set DB_PASSWORD=root" above.
    pause
    exit /b 1
)

echo Found MySQL at: %MYSQL_EXE%
echo Running migration-v3.sql ...
echo.

"%MYSQL_EXE%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% < "%~dp0migration-v3.sql"

if errorlevel 1 (
    echo.
    echo Something went wrong. Check the error above.
) else (
    echo.
    echo ============================================
    echo   Success! Database updated - no data was lost.
    echo ============================================
    echo Restart your backend now:  npm run dev
)

pause
endlocal
