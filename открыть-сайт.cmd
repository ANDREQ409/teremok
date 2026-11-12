@echo off
title SITE SERVER - do not close this window
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0serve-local.ps1"
echo.
echo Server stopped.
pause
