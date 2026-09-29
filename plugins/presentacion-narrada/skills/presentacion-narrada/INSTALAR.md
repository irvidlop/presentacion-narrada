# Cómo instalar el skill de presentaciones narradas

Para compañeros que quieren armar sus propias presentaciones con voz. Una vez instalado, basta con pedirle a Claude algo como *"hazme una presentación con voz de mi reporte"*.

## Con dos comandos en Claude Code (se actualiza solo)

En Claude Code, o en la pestaña Code de Claude para escritorio, escribe:

```
/plugin marketplace add https://github.com/irvidlop/presentacion-narrada.git
/plugin install presentacion-narrada@presentaciones-narradas
```

Usa la dirección completa con `https`: la forma corta `irvidlop/presentacion-narrada` intenta entrar por SSH y falla en computadoras sin llave de GitHub. Para recibir mejoras: `/plugin marketplace update presentaciones-narradas`, o prende la actualización automática en `/plugin` → Marketplaces. La voz, Node y Chrome se necesitan igual; si falta la voz: `python -m pip install edge-tts`.

## En Windows, con el instalador

1. Recibes `presentacion-narrada.zip`. Clic derecho → **Extraer todo**.
2. Entra a la carpeta y da doble clic a **`INSTALAR.bat`**. Copia el skill a tus skills de Claude, instala la voz y revisa que tengas Node y Chrome. Cada paso dice `[OK]` o `[X]`.
3. Si salió alguna `[X]`, instala lo que dice (Python de python.org marcando "Add python.exe to PATH", o Node de nodejs.org, versión LTS) y vuelve a abrir `INSTALAR.bat`.
4. Abre una sesión **nueva** de Claude Code, o de la pestaña Code en Claude para escritorio, y pide tu presentación.

Funciona en Claude Code y en la pestaña Code de la app de escritorio, porque ahí Claude puede correr la voz y la revisión en tu computadora. En el chat normal de Claude (claude.ai) no: la voz necesita salir a internet desde tu computadora.

## En Mac

Copia la carpeta `presentacion-narrada` a `~/.claude/skills/` y en una terminal corre `python3 -m pip install edge-tts`. Necesitas también Node 22+ (`brew install node`) y Chrome o Edge.

## Qué necesita la computadora

- Python con la voz (edge-tts). El instalador la pone.
- Node.js 22 o más nuevo.
- Chrome o Edge.

Detalle en `referencias/instalacion.md`.

## Para volver a repartirlo

La fuente de verdad es esta carpeta. Para mandarla, comprímela (clic derecho → Enviar a → Carpeta comprimida) y comparte el zip. Cualquier zip viejo se queda viejo en cuanto algo cambia aquí, así que manda siempre uno recién hecho.
