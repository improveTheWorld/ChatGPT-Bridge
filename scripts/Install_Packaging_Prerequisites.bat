@echo off
echo Run as admin
setlocal enabledelayedexpansion

:: Check for sed.exe

set sed_path="%ProgramFiles(x86)%\GnuWin32\bin\sed.exe"

if exist %sed_path% (
  echo sed is already installed.
  pause
  exit /B
)
:: Download and install sed for windows...
echo Downloading sed...
powershell -Command "Invoke-WebRequest -Uri 'https://freefr.dl.sourceforge.net/project/gnuwin32/sed/4.2.1/sed-4.2.1-setup.exe' -OutFile '%TEMP%\sed-4.2.1-setup.exe'"

echo Installing sed...
"%TEMP%\sed-4.2.1-setup.exe" /VERYSILENT /SUPPRESSMSGBOXES /NORESTART /SP-

echo Adding sed to system Path...
setx /M PATH "%PATH%;%ProgramFiles(x86)%\GnuWin32\bin"

:: Check for jq.exe
where jq.exe >nul 2>nul
if %errorlevel% neq 0 (
    echo jq.exe not found. Attempting to download and install...
    goto download_jq
) else (
    echo jq.exe is already installed.
    goto check_choco
)

:download_jq
:: Download jq.exe for Windows
powershell -Command "Invoke-WebRequest -Uri 'https://github.com/stedolan/jq/releases/download/jq-1.6/jq-win64.exe' -OutFile '%USERPROFILE%\jq.exe'"
if %errorlevel% neq 0 (
    echo Failed to download jq.exe. Exiting...
    goto :eof
)
echo jq.exe downloaded successfully.

:: Add jq.exe path to the system PATH
setx PATH "%PATH%;%USERPROFILE%" /M
echo Added jq.exe to system PATH.

:check_choco
:: Check for choco
where choco >nul 2>nul
if %errorlevel% neq 0 (
    echo Chocolatey not found. Attempting to install...
    goto install_choco
) else (
    echo Chocolatey is already installed.
    goto check_7zip
)

:install_choco
:: Install Chocolatey using PowerShell from within the batch script
powershell -NoProfile -ExecutionPolicy Bypass -Command "[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))"
if %errorlevel% neq 0 (
    echo Failed to install Chocolatey. Exiting...
    goto :eof
)
echo Chocolatey installed successfully.

:check_7zip
:: Check for 7z.exe
where 7z.exe >nul 2>nul
if %errorlevel% neq 0 (
    echo 7z.exe not found. Attempting to install...
    goto install_7zip
) else (
    echo 7z.exe is already installed.
    goto confirm_restart
)

:install_7zip
:: Install 7-Zip using Chocolatey
choco install 7zip -y
if %errorlevel% neq 0 (
    echo Failed to install 7-Zip. Exiting...
    goto :eof
)
echo 7-Zip installed successfully.

:confirm_restart
set /P "user_input=Do you want to restart the command prompt now? (Y/N): "
if /I "%user_input%"=="Y" (
    goto restart_cmd
) else if /I "%user_input%"=="N" (
    goto :eof
) else (
    echo Invalid input. Please enter Y or N.
    goto confirm_restart
)

:restart_cmd
start cmd.exe /k
goto :eof
