@echo off
chcp 65001 >nul
setlocal
rem Instalador del skill de presentaciones narradas, para Windows.
rem Doble clic. Copia esta carpeta a los skills de Claude y deja lista la voz.
rem Para probar sin tocar nada real: set PN_DESTINO=otra\carpeta  y  set PN_SIN_PIP=1

set "ORIGEN=%~dp0"
if defined PN_DESTINO (set "DEST=%PN_DESTINO%") else (set "DEST=%USERPROFILE%\.claude\skills\presentacion-narrada")

echo.
echo  Presentaciones narradas - instalador
echo  ------------------------------------
echo.
echo  1/4  Copiando el skill a:
echo       %DEST%
robocopy "%ORIGEN%." "%DEST%" /E /NFL /NDL /NJH /NJS /NP /XF INSTALAR.bat >nul
if errorlevel 8 (
  echo       [X] No se pudo copiar. Cierra Claude e intenta de nuevo.
  goto fin
)
echo       [OK]

echo.
echo  2/4  Buscando Python...
set "PY="
where python >nul 2>nul && python -c "import sys" >nul 2>nul && set "PY=python"
if not defined PY (where py >nul 2>nul && set "PY=py -3")
if not defined PY (
  echo       [X] No hay Python. Instalalo de https://www.python.org/downloads/
  echo           y marca la casilla "Add python.exe to PATH". Luego vuelve a abrir este instalador.
  goto node
)
echo       [OK] %PY%

echo.
echo  3/4  Instalando la voz (edge-tts)...
if defined PN_SIN_PIP (
  echo       [--] omitido por PN_SIN_PIP
) else (
  %PY% -m pip install --user --quiet --disable-pip-version-check edge-tts
)
%PY% -c "import edge_tts" >nul 2>nul
if errorlevel 1 (
  echo       [X] La voz no quedo instalada. Prueba a mano:  %PY% -m pip install edge-tts
) else (
  echo       [OK] voz lista
)

:node
echo.
echo  4/4  Revisando Node y Chrome...
where node >nul 2>nul
if errorlevel 1 (
  echo       [X] Falta Node.js 22 o mas nuevo: https://nodejs.org  version LTS
) else (
  for /f "tokens=1 delims=." %%v in ('node -p "process.versions.node"') do (
    if %%v LSS 22 (echo       [X] Tu Node es version %%v; hace falta 22 o mas nuevo: https://nodejs.org) else (echo       [OK] Node %%v)
  )
)
set "NAV="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "NAV=Chrome"
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "NAV=Chrome"
if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" set "NAV=Chrome"
if not defined NAV if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "NAV=Edge"
if not defined NAV if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "NAV=Edge"
if defined NAV (echo       [OK] %NAV%) else (echo       [X] No encontre Chrome ni Edge)

echo.
echo  Listo. Abre una sesion NUEVA de Claude Code (o la pestana Code de Claude)
echo  y pidele:  "hazme una presentacion con voz de ..."
echo  Si arriba salio alguna [X], resuelvela y vuelve a abrir este instalador.

:fin
echo.
if not defined PN_DESTINO pause
endlocal
