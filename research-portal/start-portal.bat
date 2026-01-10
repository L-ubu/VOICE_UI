@echo off
echo ========================================
echo   VUI Research Portal
echo   Opening on http://localhost:8080
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

start http://localhost:8080

python -m http.server 8080



