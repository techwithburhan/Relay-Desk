@echo off
setlocal enabledelayedexpansion
title Relay Desk - Database Setup

rem =====================================================
rem   Edit these if your MySQL setup is different
rem =====================================================
set DB_HOST=localhost
set DB_PORT=3306
set DB_USER=root
set DB_PASSWORD=root

echo ============================================
echo   Relay Desk - MySQL Database Setup
echo ============================================
echo.
echo This will create the "relay_desk" database and all tables
echo (branches, agents, customers, tickets, comments,
echo  knowledge_base_articles) using schema.sql in this folder.
echo.
echo MySQL user : %DB_USER%
echo MySQL host : %DB_HOST%:%DB_PORT%
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
    echo.
    echo It isn't in your PATH, and it isn't in any of the common
    echo install locations this script checks.
    echo.
    echo FIX: open This PC / File Explorer and search for "mysql.exe"
    echo to find where MySQL is installed on your machine, for example:
    echo   C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe
    echo.
    echo Then open this .bat file in Notepad and change this line near
    echo the top so it points straight at that file:
    echo.
    echo     set MYSQL_EXE=C:\path\to\your\mysql.exe
    echo.
    echo ^(Add that line right below "set DB_PASSWORD=root" above^)
    echo.
    pause
    exit /b 1
)

echo Found MySQL at: %MYSQL_EXE%
echo.
echo Connecting to MySQL and running schema.sql ...
echo.

rem ---- Run the schema against MySQL ----
rem %~dp0 = the folder this .bat file is in, so it works no matter
rem where you double-click it from.
"%MYSQL_EXE%" -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% < "%~dp0schema.sql"

if errorlevel 1 (
    echo.
    echo ============================================
    echo   Something went wrong. Check the error above.
    echo ============================================
    echo.
    echo Common causes:
    echo   - Wrong password ^(currently set to: %DB_PASSWORD%^)
    echo   - MySQL server isn't running ^(check Services / XAMPP control panel^)
    echo   - Database already exists with conflicting data
    echo.
) else (
    echo.
    echo ============================================
    echo   Success! Database "relay_desk" is ready.
    echo ============================================
    echo.
    echo You can now log in to the app with:
    echo   Admin  : burhan@gclbroking.com        ^(all branches^)
    echo   Dealer : atul@gclbroking.com           ^(Delhi branch^)
    echo   Client : it@gclbroking.com             ^(own tickets only^)
    echo   Password for all of the above: password123
    echo.
    echo Next step: run  npm install  followed by  npm run dev
    echo ^(.env is already set up with your MySQL credentials^)
    echo.
)

pause
endlocal
