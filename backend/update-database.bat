@echo off
setlocal enabledelayedexpansion
title Relay Desk - Database UPDATE (safe, non-destructive)

rem =====================================================
rem   Edit these if your MySQL setup is different
rem =====================================================
set DB_HOST=localhost
set DB_PORT=3306
set DB_USER=root
set DB_PASSWORD=root

echo ============================================
echo   Relay Desk - Database UPDATE
echo ============================================
echo.
echo This runs migration-v2.sql against the EXISTING "relay_desk"
echo database. It does NOT delete anything - it only adds:
echo   - tickets.remark column
echo   - knowledge_base_articles.url column
echo   - forgot_password_enabled setting
echo.
echo Your current tickets, customers, and settings are safe.
echo.

rem ---- Try to find mysql.exe: PATH first, then common install locations ----
set MYSQL_EXE=

where mysql >nul 2>nul
if not errorlevel 1 (
    set MYSQL_EXE=mysql
)

if "%MYSQL_EXE%"=="" (
    for %%P in (
        "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe"
        "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
        "C:\Program Files\MySQL\MySQL Server 5.7\bin\mysql.exe"
        "C:\xampp\mysql\bin\mysql.exe"
        "C:\wamp64\bin\mysql\mysql8.0.31\bin\mysql.exe"
        "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe"
    ) do (
        if exist %%P (
            set MYSQL_EXE=%%~P
        )
    )
)

if "%MYSQL_EXE%"=="" (
    echo ERROR: Could not find "mysql.exe" automatically.
    echo Open this .bat file in Notepad and add a line like:
    echo     set MYSQL_EXE=C:\path\to\your\mysql.exe
    echo right below "set DB_PASSWORD=root" above.
    echo.
    pause
    exit /b 1
)

echo Found MySQL at: %MYSQL_EXE%
echo Running migration-v2.sql ...
echo.

"%MYSQL_EXE%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% < "%~dp0migration-v2.sql"

if errorlevel 1 (
    echo.
    echo ============================================
    echo   Something went wrong. Check the error above.
    echo ============================================
) else (
    echo.
    echo ============================================
    echo   Success! Database updated - no data was lost.
    echo ============================================
    echo.
    echo Restart your backend now:  npm run dev
    echo.
)

pause
endlocal
