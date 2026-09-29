# Qué instalar

Solo lo necesita quien **arma** la presentación. Para **verla** basta un navegador.

## Windows

1. **Python** (3.10 o más): de python.org, marcando "Add python.exe to PATH". Luego, en una terminal:
   ```
   python -m pip install edge-tts
   ```
   Si hay varios Python, usa el mismo con el que vas a correr `generar-audio.py`. Para saber cuál es: `python -c "import sys; print(sys.executable)"`.
2. **Node.js 22 o más**: de nodejs.org, versión LTS. Comprobar: `node --version`.
3. **Chrome o Edge**: cualquiera de los dos. Edge viene con Windows. Si Chrome está en un lugar raro: `set CHROME=C:\ruta\chrome.exe`.

## Mac

```
python3 -m pip install edge-tts
brew install node
```
Chrome o Edge en /Applications. En Mac, `python3` en vez de `python` en todos los comandos.

## Cómo saber si ya está

```
python -c "import edge_tts; print('voz lista')"
node --version
```

## Internet

`generar-audio.py` necesita internet: la voz la genera el servicio de Microsoft (el mismo que usa Edge para leer en voz alta). Si una red de oficina lo bloquea, falla con un error de conexión después de 3 intentos. Armar, revisar y ver la presentación no necesitan internet.

## Si hay varios Python

Pasa seguido en Windows: la voz quedó instalada en un Python y la terminal usa otro. `py -0p` lista todos. Prueba `"<ruta>\python.exe" -c "import edge_tts"` con cada uno y usa el que responda para `generar-audio.py`.
