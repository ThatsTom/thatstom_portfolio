@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nao foi encontrado. Este modo opcional requer Node.js 18 ou superior.
  echo Para abrir sem instalar nada, use ABRIR-SITE.bat.
  pause
  exit /b 1
)
node -e "if (Number(process.versions.node.split('.')[0]) < 18) process.exit(1)"
if errorlevel 1 (
  echo Este modo opcional requer Node.js 18 ou superior.
  pause
  exit /b 1
)
if not defined PORT set "PORT=5173"
node -e "const p=process.env.PORT; if (!/^\d+$/.test(p) || Number(p) < 1 || Number(p) > 65535) process.exit(1)"
if errorlevel 1 (
  echo PORT deve ser um numero inteiro entre 1 e 65535.
  pause
  exit /b 1
)
echo Iniciando o portfolio em http://127.0.0.1:%PORT%
node scripts/serve.mjs --open
if errorlevel 1 (
  echo O servidor nao iniciou. Confira a mensagem acima.
  pause
  exit /b 1
)
endlocal
