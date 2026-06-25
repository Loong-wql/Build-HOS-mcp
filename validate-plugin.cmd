@echo off
setlocal
set "ROOT=%~dp0"
set "PYTHON=%ROOT%.venv-plugin-validate\Scripts\python.exe"
set "VALIDATOR=%USERPROFILE%\.codex\skills\.system\plugin-creator\scripts\validate_plugin.py"
set "PLUGIN=%~1"
if "%PLUGIN%"=="" set "PLUGIN=%ROOT%plugins\build-harmonyos-apps"

if not exist "%PYTHON%" (
  echo Missing validation venv Python: %PYTHON%
  exit /b 1
)

if not exist "%VALIDATOR%" (
  echo Missing plugin validator: %VALIDATOR%
  exit /b 1
)

"%PYTHON%" "%VALIDATOR%" "%PLUGIN%"
exit /b %ERRORLEVEL%