@echo off
setlocal
cd /d "%~dp0"
if not exist "index.html" (
  echo Arquivo index.html nao encontrado. Extraia todo o ZIP antes de abrir.
  pause
  exit /b 1
)
start "" "%~dp0index.html"
endlocal
