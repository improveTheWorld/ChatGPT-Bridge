@echo off
setlocal enabledelayedexpansion

:: Read config.json file to get the version and source folder
for /f "tokens=1,2" %%a in ('jq -r ".version,.name" ../package.json') do (
  if not defined VERSION (
    set "VERSION=%%~a"
  ) else if not defined NAME (
    set "NAME=%%~a"
  )
)
set "SOURCE=..\src"
:: Check if the VERSION and SOURCE variables are set
if not defined VERSION (
    echo Version not found in config.json
    exit /b 1
)
if not defined SOURCE (
    echo Source not found in config.json
    exit /b 1
)



:: Create temporary folder
set "TEMP_DIR=%TEMP%\%NAME%_%VERSION%"
if exist "%TEMP_DIR%" (
  rd /s /q "%TEMP_DIR%"
)
mkdir "%TEMP_DIR%"

:: Copy source folder to the temporary folder
xcopy /E /I "%SOURCE%" "%TEMP_DIR%"

:: Update version in manifest.json
set "MANIFEST=%TEMP_DIR%\manifest.json"
set "UPDATED_MANIFEST=%TEMP_DIR%\manifest_updated.json"
jq --arg version "%VERSION%" ".version = $version" "%MANIFEST%" > "%UPDATED_MANIFEST%"

:: Replace original manifest.json with updated version
move /y "%UPDATED_MANIFEST%" "%MANIFEST%"

:: Update version in popup.html
set "POPUP_FILE=%TEMP_DIR%\popup.html"
set "RELEASE_DATE=20%date:~6,2%-%date:~3,2%-%date:~0,2%"
sed -i "s/<h2>Version .*<\/h2>/<h2>Version %VERSION% - Released %RELEASE_DATE%<\/h2>/" "%POPUP_FILE%"
del sed*

:: Apply uglify on all .js files in the temporary folder
for /r "%TEMP_DIR%" %%f in (*.js) do (
   start /WAIT cmd.exe /c "uglifyjs "%%f" -o "%%f" --compress --mangle"
)

:: Create zip file with version name
set "ZIP_NAME=..\dist\%NAME%_%VERSION%.zip"
echo Creating zip file...
pushd "%TEMP_DIR%" && (7z a -tzip "%CD%\..\dist\%ZIP_NAME%" "*") && popd || (echo 7z command failed)
echo Unzipping files to the current folder...
7z x -o"%CD%" "%ZIP_NAME%"

:: Display the location of the created zip file
echo The zip file has been created at: %CD%\%ZIP_NAME%

:: Cleanup
rd /s /q "%TEMP_DIR%"

:confirm_restart
set /P "user_input=Tap Enter to Exit..."


