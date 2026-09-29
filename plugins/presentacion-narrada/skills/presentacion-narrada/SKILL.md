---
name: presentacion-narrada
description: Arma presentaciones HTML interactivas que se explican solas con voz en español. Una voz narra cada sección, la página baja sola y lo que se va nombrando se ilumina, con puntero, subtítulos y velocidad 1×, 1.25× o 1.5×. Todo queda en un solo archivo que abre sin internet, más un PDF si se pide. Úsalo siempre que alguien pida una presentación "con voz", "narrada", "que se explique sola", "con audio", "que vaya señalando", o quiera ponerle voz o volver interactiva una presentación, un reporte, un avance o unos resultados. También cuando pida convertir un deck, documento o reporte a una página que se presente sola. El contenido es siempre el de quien lo pide, nunca datos de otra presentación.
---

# Presentación narrada

Una página que se presenta sola: la voz cuenta cada sección y va señalando cada cosa justo cuando la nombra. La persona pone el contenido; este skill trae el motor (voz, señalamiento, subtítulos, velocidad, revisión) y una plantilla con ejemplos de cada pieza.

Todo lo que salió mal en las primeras presentaciones ya viene resuelto en los scripts, que se detienen si vuelve a pasar.

## Qué necesita la computadora

- **Python 3.10+** con edge-tts: `python -m pip install edge-tts`. La voz sale del servicio de Microsoft, así que pide internet al generarla. Verla después no pide internet.
- **Node.js 22+** y **Chrome o Edge**, para la revisión automática y el PDF.
- No hace falta ffmpeg.

Antes de empezar, corre `python -c "import edge_tts"` y `node --version`. Si edge-tts falla, busca otro Python antes de pedir que lo instalen: en Windows `py -0p` lista todos, y puede estar en uno que no es el de por defecto. Usa ese mismo Python para `generar-audio.py`. Si de verdad falta algo, dile a la persona qué instalar con el comando exacto (`referencias/instalacion.md`) y no sigas a medias.

## Flujo

### 1. Entender qué se va a presentar

Pregunta lo que no esté claro, en una sola tanda:
- **De qué trata y a quién va** (dirección, el área, un cliente). Eso decide el tono.
- **El contenido real**: datos, cifras, documentos, capturas. Si trae un PDF, un deck o un reporte, léelo y saca de ahí las secciones.
- **Los colores**: `azul` (el de siempre), `morado` (morado con rosa), `verde` (verde con dorado) o `violeta` (violeta con naranja). Si la persona trae los colores de su marca, empieza con el tema más parecido y cambia los valores en el bloque de tema de index.html. El tema cambia los colores; las letras son Raleway y Work Sans en todos. Si la marca usa otras y tienes sus archivos `.woff2`, ponlos en `fonts/` y cambia `--f-titulo` y `--f-texto` en el bloque de tema de index.html.
- **Quién la firma** (nombre y área para la portada).

Si no puedes preguntar, arma con lo que hay y al entregar di qué supusiste. Nunca rellenes con datos de otra presentación ni inventes cifras: si falta un número, deja la tarjeta sin él o pregunta.

### 2. Crear la carpeta

```bash
python <skill>/scripts/nueva.py "<carpeta destino>" --tema morado --titulo "Resultados del trimestre"
```

Queda una carpeta completa y por su cuenta, con `index.html`, `guion.json`, `motor.css`, `motor.js`, `img/`, `fonts/` y los tres scripts. Trae la presentación de ejemplo adentro para que veas cómo se conecta todo. **Reemplaza el ejemplo con el contenido real**; no lo dejes.

Pon la carpeta donde la persona trabaja, dentro de la carpeta de su proyecto o área, nunca suelta en la raíz de un repositorio.

### 3. Construir las secciones (`index.html`)

- La portada es `<header class="hero" id="inicio" data-label="Inicio">`. Cada sección es `<section class="sec" id="…" data-label="…">`. El `data-label` es el nombre que sale en el reproductor, en el índice y en el puntero. `class="sec dark"` hace una sección oscura.
- Elige la pieza que mejor muestre cada cosa: cifras que cuentan solas, barras que comparan, gráfica de línea que se dibuja, anillos de avance, cita grande, paso a paso, pestañas, tarjetas que giran, línea de tiempo, antes/después que se arrastra, teléfono con la página que baja sola, flujo con chispas. Tienes el HTML listo para copiar en **`referencias/componentes.md`**. Léelo antes de escribir las secciones.
- Mejor pocas secciones bien mostradas que muchas: entre 4 y 12. El largo lo pone el contenido. Un reporte corto da una presentación de uno o dos minutos, y está bien: no rellenes para alargarla.
- Las imágenes van en `img/` y se llaman como `img/archivo.jpg`. Una captura de 1600 px de ancho en JPG basta; más grande hace pesado el archivo.
- No toques `motor.css` ni `motor.js`. Si una sección necesita un estilo propio, va en el `<style>` de index.html. Una animación propia se registra como acción (ver componentes.md).
- Si la marca tiene reglas de color, respétalas. En el tema `morado`, encima del rosa la letra va blanca.

### 4. Escribir el guion (`guion.json`)

Es lo que dice la voz y qué señala mientras lo dice. Una entrada por sección, con el mismo `id` que en la página:

```json
{"id": "resultados",
 "t": "En tres meses bajamos el tiempo de respuesta. Antes tardábamos dos días. Ahora, cuatro horas.",
 "cues": [["bajamos el tiempo", "#barras", "repetir"],
          ["Antes tardábamos", ".fila@Antes", ""],
          ["Ahora, cuatro horas", ".bigshift", ""]]}
```

Cada señalamiento es `[primeras palabras de la frase, qué señalar, acción]`:
- **Las palabras** se copian tal cual del texto, de 2 a 5. En ese momento exacto del audio se dispara el señalamiento.
- **Qué señalar**: un selector CSS (`#barras`, `.stat`) o `selector@texto` para "el primero de estos que contenga este texto" (`.nodo@Guion`). El texto no distingue mayúsculas. Se busca primero dentro de la sección que se narra y, si ahí no está, en toda la página. Así `.fila@Julio` cae en la fila de su sección aunque otra sección también tenga una fila Julio.
- **La acción** es opcional y se pueden juntar varias con `+`. Además de las de siempre (`clic`, `tab:idPanel`, `pasos`, `voltear`, `repetir`, `contar`, `barrido`), hay 22 efectos: marcas a mano que sustituyen el aro (`marcar`, `subrayar`, `circular`, `flecha`, `esquinas`, `enfocar`) y animaciones (`crecer`, `rodar`, `cambiar:…`, `palabras`, `escribir`, `dibujar`, `llenar`, `cascada`, `comparar`, `revelar`, `acercar`, `recorrer`, `tocar`, `sello:…`, `latido`, `confeti`). Cuál usar para qué: `referencias/componentes.md` § 17. Varía el estilo según lo que se nombra (una frase se marca, un número se encierra o crece), no por adornar.

Cómo escribir lo que dice la voz está en **`referencias/guion.md`** (léelo). Lo corto: habla como la persona que presenta, frases cortas, nada de relleno, los números como se dicen. Señala algo cada una o dos frases: la página tiene que moverse mientras se habla. Si está instalada la skill `no-ai-slop`, pásale el texto antes de generar la voz.

### 5. Generar la voz

```bash
python generar-audio.py
```

Crea `audio/presentacion.mp3` y `audio/capitulos.json`. Tarda unos segundos por sección. Se detiene si una frase de señalamiento no aparece en el texto, o si los señalamientos no van en el orden en que se dicen. Si cambias el guion, vuelve a correrlo: `armar.py` se niega a armar con una voz vieja.

### 6. Armar y revisar

```bash
python armar.py          # un solo HTML con todo adentro
python armar.py --pdf    # además el PDF horizontal
```

`armar.py` mete el motor, las imágenes, las letras y la voz en un solo archivo, y luego lo revisa en Chrome, en computadora y en celular. Se detiene y dice qué falló si:
- un señalamiento no encuentra su pieza o usa una acción que no existe;
- una sección del guion no existe en la página;
- un bloque se queda invisible después de recorrer la página;
- un texto casi no se lee (contraste medido menor a 3:1, por ejemplo letra clara sobre un recuadro claro);
- algo es más ancho que un celular de 390 px (el celular aleja la página y el reproductor se sale de la pantalla);
- la voz dentro del archivo no se puede reproducir o no dura lo que dicen los capítulos;
- al brincar a cada señalamiento, lo que se ilumina no es lo que pide el guion;
- hay errores de JavaScript.

Arregla lo que diga y vuelve a correrlo hasta que pase. `--sin-revisar` existe solo para cuando no hay Chrome, y avisa que nadie revisó.

### 7. Mirarla antes de entregar

Que pase la revisión no basta: comprueba que las cosas estén donde deben, no que se vean bien. Abre y mira:
- `revision/escritorio.png` y `revision/celular.png`: la portada.
- `revision/secciones/`: una captura por sección, tomada en su primer señalamiento, con el aro y el puntero puestos. Revisa que nada se encime, que el texto se lea y que lo señalado sea lo que la voz dice en ese momento.

Si además puedes abrir el HTML en un navegador, dale play y deja correr por lo menos una sección. Si algo se señala antes o después de tiempo, casi siempre la frase del señalamiento aparece en otra parte del texto.

### 8. Entregar

Entrega **el archivo `<nombre>.html`** (el nombre sale de `"archivo"` en guion.json). Es el único que se comparte: abre con doble clic, sin internet, en computadora y celular. Si se pidió, también el PDF. Dile a la persona:
- cuánto dura a 1.25×, la velocidad con que arranca;
- que se edita cambiando `index.html` y `guion.json` y corriendo los dos scripts en ese orden;
- qué partes quedaron pendientes por falta de datos, si hubo.

## Si algo falla

- **"no encontré en el texto la frase del señalamiento"**: las palabras del señalamiento no están escritas igual en `t`. Cópialas del texto.
- **La voz tarda o falla**: el servicio de voz necesita internet; el script reintenta 3 veces.
- **"el navegador alejó la página"**: algo tiene ancho fijo. La revisión dice qué pieza es; dale `max-width:100%` o `min-width:0`.
- Lo demás, con el porqué de cada decisión del motor, está en `referencias/defectos.md`.
