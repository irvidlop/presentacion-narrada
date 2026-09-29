# Presentación narrada

La que se comparte es **`<nombre>.html`**: un solo archivo con todo adentro. Abre con doble clic, sin internet.

| Archivo | Para qué |
|---|---|
| `index.html` | Las secciones de la página. Aquí se cambia lo que se ve. |
| `guion.json` | Lo que dice la voz y qué señala mientras lo dice. |
| `img/` | Imágenes de la página. |
| `generar-audio.py` | Crea la voz desde `guion.json` (necesita internet). |
| `armar.py` | Junta todo en un solo HTML y lo revisa en Chrome. `--pdf` también saca el PDF. |
| `motor.css`, `motor.js`, `chrome.mjs` | El motor. No se editan. |

Después de cambiar algo:

```
python generar-audio.py
python armar.py
```

En ese orden si cambiaste el guion. Si solo cambiaste la página, basta `python armar.py`. Si algo está mal, `armar.py` se detiene y dice qué.
