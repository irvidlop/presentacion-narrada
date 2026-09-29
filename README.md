# Presentación narrada

Un skill de Claude Code que arma presentaciones que se explican solas. Una voz en español cuenta cada sección, la página baja sola y cada cosa se señala justo cuando se nombra.

- **Señalamiento:** aro, marcatextos, círculo a mano, flecha o esquinas.
- **Movimiento:** gráficas que se dibujan, cifras que crecen, tarjetas que giran, sellos y 22 efectos en total.
- **Reproductor:** subtítulos palabra por palabra, velocidad 1×, 1.25× o 1.5× y botón para volver al inicio.

Tú pones el contenido. Queda **un solo archivo HTML** que abre sin internet en computadora y celular, más un PDF si lo pides.

Mira un ejemplo: descarga [`ejemplo/presentacion-ejemplo.html`](ejemplo/presentacion-ejemplo.html) y ábrelo con doble clic.

## Instalar

### Opción 1: con el plugin de Claude Code (se actualiza)

En Claude Code, o en la pestaña Code de la app de escritorio de Claude:

```
/plugin marketplace add https://github.com/irvidlop/presentacion-narrada.git
/plugin install presentacion-narrada@presentaciones-narradas
```

Usa la dirección completa con `https`: la forma corta intenta entrar por SSH y falla si no tienes llave de GitHub.

Para recibir las mejoras: `/plugin marketplace update presentaciones-narradas`. También puedes prender la actualización automática en `/plugin` → Marketplaces.

### Opción 2: con el instalador (Windows)

1. Botón verde **Code → Download ZIP** en esta página. Clic derecho al zip → **Extraer todo**.
2. Doble clic a **`INSTALAR.bat`**. Copia el skill, instala la voz y revisa que tengas Node y Chrome. Cada paso dice `[OK]` o `[X]`.
3. Abre una sesión nueva de Claude Code.

### Lo que necesita tu computadora

- Python con la voz: `python -m pip install edge-tts`. El instalador lo hace solo.
- Node.js 22 o más nuevo: [nodejs.org](https://nodejs.org), versión LTS.
- Chrome o Edge.
- Internet al generar la voz, que sale del servicio de voz de Microsoft. Para ver la presentación no hace falta.

## Usar

Pídele a Claude algo como:

> Hazme una presentación con voz de mi reporte de agosto, en morado.

Claude arma las secciones, escribe lo que dice la voz, la genera y revisa todo en computadora y celular antes de entregarte el archivo. La revisión se detiene si algo no se ve, si un texto no se lee, si la página se sale de la pantalla o si la voz señala algo equivocado.

Trae cuatro temas de color (azul, morado, verde y violeta) y se pueden cambiar por los de tu marca.

## Qué hay dentro

```
plugins/presentacion-narrada/skills/presentacion-narrada/
  SKILL.md        las instrucciones que sigue Claude
  plantilla/      el motor (voz, señalamiento, efectos) y una presentación de ejemplo
  scripts/        crear, generar la voz, armar y revisar
  referencias/    las piezas, cómo escribir el guion, instalación y por qué el motor es como es
```

Las letras Raleway y Work Sans van incluidas bajo la licencia SIL Open Font License.
