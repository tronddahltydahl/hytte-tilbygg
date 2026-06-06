@echo off
title Design Cabin - oppstart
cd /d "C:\Users\TrondDahl\Claud-trond\hytte-tilbygg"

echo ============================================
echo    Starter Design Cabin-prosjektet
echo ============================================
echo.

echo [1/3] Starter dev-server i eget vindu...
start "Design Cabin dev-server" cmd /k "npm run dev"

echo [2/3] Venter litt mens serveren starter...
timeout /t 6 /nobreak >nul

echo [3/3] Starter nettleser og Claude Code...
start "" "http://localhost:3000"
echo.
echo Klart! Claude Code starter nedenfor - skriv inn det du vil endre.
echo Lukk dev-server-vinduet etter bruk (Ctrl+C, eller bare kryss det ut).
echo.

claude
