# Piezas de la presentación

Cada pieza ya tiene su estilo en `motor.css` y su movimiento en `motor.js`. Aquí va el HTML para copiar y cómo se señala. Todas respetan "reducir movimiento" y salen quietas en el PDF.

**Contenido**
1. Sección y encabezado
2. Aparición al hacer scroll
3. Cifras que cuentan solas
4. Tarjetas
5. Barras que comparan
6. De → a, en grande
7. Flujo con chispas
8. Paso a paso
9. Pestañas
10. Tarjetas que giran
11. Línea de tiempo
12. Tabla
13. Captura en navegador
14. Teléfono con la página que baja sola
15. Antes / después que se arrastra
16. Índice automático
17. Acciones de los señalamientos (y los 22 efectos)
18. Acciones propias
19. Gráfica de línea que se dibuja
20. Anillo de avance
21. Cita grande

---

## 1. Sección y encabezado

```html
<section class="sec" id="resultados" data-label="Resultados">
  <div class="wrap">
    <div class="sec-head reveal"><h2>Resultados del trimestre</h2><span class="tag">Ventas</span></div>
    <p class="lead reveal">Una o dos frases que digan lo principal.</p>
    …piezas…
  </div>
</section>
```

- `id` = el `id` de su entrada en `guion.json`. `data-label` = nombre corto (reproductor, índice, puntero).
- `class="sec dark"` = sección oscura; los textos y tarjetas se adaptan solos.
- Sin etiquetas chiquitas ni números encima del título ("01", "RESUMEN"): se ven a plantilla. Si la sección de verdad es un paso de una secuencia, que lo diga el título.
- La portada es `header.hero#inicio`. Ya viene en la plantilla: cambia el `kicker`, el `h1` (lo que va en `<span class="grad">` sale en el color de acento), el `sub`, las 4 `hstat` y el `byline`. El botón `[data-escuchar]` arranca la voz y calcula solo cuánto dura.

## 2. Aparición al hacer scroll

- `class="reveal"`: el bloque sube y aparece.
- `class="stagger"`: sus hijos aparecen uno tras otro. Úsalo en rejillas y listas.
- `data-in`: recibe la clase `.in` al verse, sin animación propia, para piezas con CSS propio.

## 3. Cifras que cuentan solas

```html
<div class="grid3 stagger" id="cifras">
  <div class="stat"><b><span data-count="247">247</span></b><span>pacientes atendidos</span></div>
  <div class="stat"><b><span data-count="42">42</span>%</b><span>más que el mes pasado</span></div>
  <div class="stat"><b>$<span data-count="1050">1050</span></b><span>ticket promedio</span></div>
</div>
```

El número final va escrito en el HTML. Así, si el navegador no anima, se ve el número bueno y no un 0. Solo cuentan enteros; para decimales escribe el número sin `data-count`. Señalar: `"#cifras"` con `contar` para que vuelvan a contar, o `".stat@ticket"` para una sola.

## 4. Tarjetas

```html
<div class="grid2 stagger">
  <div class="card top lift"><h3>Título</h3><p>Texto corto.</p><ul><li>Punto</li></ul></div>
  <div class="card"><h3>Otra</h3><p>…</p></div>
</div>
<div class="callout reveal"><strong>Lo importante:</strong> una línea destacada.</div>
```

Rejillas: `grid2`, `grid3`, `grid4`. En celular se vuelven de una columna. `top` = franja de color arriba; `lift` = se levanta al pasar el mouse.

## 5. Barras que comparan

```html
<div class="barras" id="barras">
  <div class="fila"><span class="nombre">Antes<small>enero</small></span><div class="pista"><div class="f gris" style="--w:88%"></div></div><span class="valor">19.4 s</span></div>
  <div class="fila"><span class="nombre">Ahora<small>marzo</small></span><div class="pista"><div class="f" style="--w:14%"></div></div><span class="valor">3.0 s</span></div>
</div>
```

`--w` es el largo de la barra: calcúlalo contra el valor más grande (el más grande en 100% o cerca). `gris` = la barra de "antes". Señalar: `"#barras"` con `repetir` vuelve a llenarlas; `".fila@Ahora"` señala una.

## 6. De → a, en grande

```html
<div class="bigshift reveal"><span class="from">115</span><span class="arr">→</span><span class="to">8</span></div>
```

## 7. Flujo con chispas

```html
<div class="flujo stagger">
  <div class="line"></div><i class="spark"></i><i class="spark"></i><i class="spark"></i>
  <div class="nodo"><div class="ic">1</div><b>Llega</b><span>La solicitud entra.</span></div>
  <div class="nodo"><div class="ic">2</div><b>Se revisa</b><span>…</span></div>
  <div class="nodo"><div class="ic">3</div><b>Se entrega</b><span>…</span></div>
</div>
```

Las columnas se ajustan solas al número de `.nodo`; con más de 5 se aprieta. Señalar: `".nodo@Se revisa"`.

## 8. Paso a paso

```html
<div class="sec-head reveal"><div>…</div><button class="playbtn" type="button" data-play="s1">▶ Repetir</button></div>
<div class="stepper reveal" id="s1">
  <div class="rail"><b></b></div>
  <div class="st"><div class="c">1</div><b>Pide</b><span>Qué pasa aquí.</span></div>
  <div class="st"><div class="c">2</div><b>Arma</b><span>…</span></div>
  <div class="st"><div class="c">3</div><b>Entrega</b><span>…</span></div>
</div>
```

Se recorre solo al verse. Cada `stepper` necesita un `id` distinto. Señalar: `"#s1"` con `pasos` lo recorre mientras la voz lo explica; `".st@Arma"` señala un paso.

## 9. Pestañas

```html
<div class="tabs reveal" data-tabs="zonas" role="tablist">
  <button class="tab" type="button" data-p="p-norte" aria-selected="true">Norte</button>
  <button class="tab" type="button" data-p="p-sur" aria-selected="false">Sur</button>
</div>
<div class="panel on" data-group="zonas" id="p-norte">…</div>
<div class="panel" data-group="zonas" id="p-sur">…</div>
```

`data-tabs` en la barra y `data-group` en los paneles llevan el mismo nombre. El primer panel lleva `on`. Los `id` de panel no se repiten en toda la página. Señalar: `["cuando vemos el Sur", "#p-sur .card", "tab:p-sur"]`: la voz abre la pestaña y luego señala algo dentro. En el PDF salen todos los paneles, uno tras otro.

## 10. Tarjetas que giran

```html
<div class="voltea-grid stagger">
  <button class="voltea" type="button"><span class="giro">
    <span class="frente"><small>Riesgo</small><strong>El problema, corto</strong><em>Toca para voltear</em></span>
    <span class="atras"><small>Cómo quedó</small><span>La solución en una o dos frases.</span></span>
  </span></button>
</div>
```

Al frente, poco texto: la tarjeta mide 180 px de alto. Señalar: `[".voltea@El problema", "voltear"]` con la frase donde se nombra.

## 11. Línea de tiempo

```html
<ul class="tl" id="tl"><i class="draw"></i>
  <li><b>Enero</b>Qué pasó.</li>
  <li><b>Marzo</b>Qué pasó.</li>
</ul>
```

La línea se dibuja al verse. Señalar: `"#tl"` con `repetir` la vuelve a dibujar; `".tl li@Marzo"` señala un punto.

## 12. Tabla

```html
<table class="reveal">
  <tr><th>Qué</th><th>Quién</th><th>Cuándo</th></tr>
  <tr><td>…</td><td>…</td><td>…</td></tr>
</table>
```

En celular se desliza de lado dentro de su caja, sin mover la página. Señalar una fila: `"tr@texto de la fila"` pinta la fila en vez de levantarla.

## 13. Captura en navegador

```html
<figure class="reveal">
  <div class="browser"><div class="bar"><i></i><i></i><i></i><span>tuempresa.com/precios</span></div>
    <img class="zoom" src="img/precios.jpg" alt="Página de precios"></div>
  <figcaption>Qué se ve y por qué importa.</figcaption>
</figure>
```

`class="zoom"` en la imagen: se amplía al tocarla.

## 14. Teléfono con la página que baja sola

```html
<div class="phone" style="--dur:30s"><div class="screen"><img src="img/scroll-home.jpg" alt="Home en celular"></div></div>
```

La imagen es una captura larga del celular, de arriba abajo (390 px de ancho × lo que mida). Baja y sube sola mientras se ve y se detiene con el mouse encima. `--dur` = segundos de una bajada.

## 15. Antes / después que se arrastra

```html
<div class="ba">
  <img src="img/antes.jpg" alt="Antes">
  <div class="top"><img src="img/despues.jpg" alt="Después"></div>
  <div class="handle"><b>⇆</b></div>
  <span class="lab l">Antes</span><span class="lab r">Después</span>
</div>
```

Las dos imágenes deben medir lo mismo. Al verse hace un barrido para que se note que se mueve. Señalar: `".ba"` con `barrido`.

## 16. Índice automático

```html
<section class="sec" id="indice" data-label="Índice" style="padding-top:70px">
  <div class="wrap"><div class="sec-head reveal"><div><span class="n">RECORRIDO</span><h2>Qué vas a ver</h2></div></div>
  <ol class="toc stagger" data-auto></ol></div>
</section>
```

Se llena solo con las secciones que tienen `data-label`. No necesita entrada en el guion. Con la voz sonando, tocar una sección del índice lleva el audio ahí.

## 17. Acciones de los señalamientos

Hay tres familias. Se combinan con `+`: `"circular+contar"`, `"tab:p-sur+cascada"`, `"subrayar+sello:✓ Hecho"`.

**Qué hace la pieza** (lo que ya estaba):

| Acción | Qué hace |
|---|---|
| `""` | Solo ilumina (aro) y lleva el puntero |
| `clic` | Le da clic a la pieza señalada |
| `tab:idPanel` | Abre esa pestaña y luego señala la pieza (que puede estar dentro) |
| `pasos` o `pasos:id` | Recorre el paso a paso |
| `voltear` | Voltea la tarjeta |
| `repetir` | Repite la entrada: barras, línea de tiempo, stagger |
| `contar` | Vuelve a contar las cifras |
| `barrido` | Mueve el antes/después |

**Cómo se señala**. Estos cambian el aro por una marca hecha a mano; úsalos para variar:

| Estilo | Qué hace | Para qué |
|---|---|---|
| `marcar` | Marcatextos detrás del texto, renglón por renglón | Una frase o un título que importa |
| `subrayar` | Raya a mano bajo cada renglón | Una idea dentro de un párrafo |
| `circular` | Círculo a mano alrededor | Un número, una fila, un punto de la gráfica |
| `flecha` | Flecha curva que llega desde un lado | "Aquí": algo chico o al final de una fila |
| `esquinas` | Cuatro esquinas como visor de cámara | Una captura, una tabla, una zona |
| `enfocar` | La pieza crece un poco y se queda al frente (con aro) | Un paso o una tarjeta entre varias |

**Qué pasa además**. Tomado del catálogo de HyperFrames:

| Efecto | Qué hace | Para qué |
|---|---|---|
| `crecer` | La cifra cuenta y crece mientras cuenta | Un número que subió |
| `rodar` | Las cifras giran como tragamonedas y se asientan | Un número que llega de sorpresa |
| `cambiar:nuevo texto` | El texto sale hacia arriba y entra el nuevo | "19.4 s" → "3.0 s" en el mismo lugar |
| `palabras` | Las palabras entran una por una, enfocándose | Una cita o frase clave, sección oscura |
| `escribir` | El texto se escribe solo con cursor | Una nota, un mensaje, un comando |
| `dibujar` | La gráfica traza su línea, luego sus puntos | `.grafica` (ver 19) o SVG con clase `trazo` |
| `llenar` | Los anillos se llenan y cuentan | `.anillo` (ver 20) |
| `cascada` | Los hijos entran uno tras otro | Una rejilla o lista al nombrarla completa |
| `comparar` | Los dos primeros hijos entran de lados opuestos | Antes contra ahora, dos opciones |
| `revelar` | La pieza se descubre de izquierda a derecha | Una imagen o captura nueva |
| `acercar` o `acercar:1.2` | La imagen se acerca despacio (cámara) | Una captura mientras se explica |
| `recorrer:60` | La captura larga baja al 60% | `.phone` o `.browser` con captura larga |
| `tocar` | Clic simulado: la pieza se hunde y sale una onda | Un botón o una opción "que se elige" |
| `sello:✓ Listo` | Sello que cae en la esquina y se queda | Algo terminado o aprobado |
| `latido` | Un brillo que crece y se apaga | Un resultado, sin mover nada |
| `confeti` | Confeti que sale de la pieza | **Un** logro grande por presentación |

Cómo elegir:
- El aro es lo normal. Cambia de estilo cuando la voz cambia de tipo de cosa (una frase → `marcar`; un número → `circular` o `crecer`), no para adornar.
- No repitas el mismo efecto dos veces seguidas, salvo series naturales (tres tarjetas que se voltean).
- `confeti` y `sello` pierden fuerza si se repiten: uno o dos por presentación.
- Cuando la voz llega a una sección nueva, su título sube como telón. Eso ya lo hace el motor solo.

Todo efecto deja la pieza como estaba o mejor. En el PDF y con "reducir movimiento" se ve el estado final, sin animación. Al reiniciar con ↺, lo que `cambiar` y `sello` modificaron vuelve a como estaba.

La pieza señalada se levanta y la rodea un aro del color de acento, separado 6 px para no pegarse al texto. El puntero viaja a su esquina de arriba a la izquierda con el nombre de la sección, que se desvanece a los dos segundos. **Lo demás no se oscurece:** cuando se probó atenuar el resto, pidieron que todo se siguiera viendo.

## 18. Acciones propias

Para una animación que no está en la lista, regístrala en el `<script>` del final de index.html (después de `motor.js`):

```html
<script>
Presentacion.acciones.brillar = function(el, valor){
  el.animate([{filter:'brightness(1.5)'},{filter:'none'}], {duration:900});
};
</script>
```

Y en el guion: `["esta cifra", "#total", "brillar"]`. Con `"brillar:rojo"`, `valor` llega como `"rojo"`. La revisión se detiene si el guion usa una acción que no existe.


## 19. Gráfica de línea que se dibuja

```html
<figure class="grafica card" id="grafica" data-valores="120,138,131,164,190,236" data-etiquetas="Abr,May,Jun,Jul,Ago,Sep" data-sufijo="" aria-label="Citas por mes, de abril a septiembre">
  <figcaption>Citas por mes.</figcaption>
</figure>
```

El motor la arma sola con los valores: línea, área, puntos, etiquetas y el último valor en grande. Se ve completa desde el principio (así sale en el PDF). Al verse, la línea se traza; con `dibujar` se traza otra vez mientras la voz la explica. `circular` sobre `"#grafica .g-fin"` encierra el último valor.

## 20. Anillo de avance

```html
<div class="card anillos reveal" id="anillos">
  <div class="anillo" data-valor="72"><span>de las citas se confirman solas</span></div>
  <div class="anillo" data-valor="94"><span>de las pacientes llegan a su hora</span></div>
</div>
```

`data-valor` es un porcentaje de 0 a 100. Se llena y cuenta al verse; `llenar` lo repite.

## 21. Cita grande

```html
<section class="sec dark" id="frase" data-label="Una frase">
  <div class="wrap"><p class="cita reveal" id="cita">Lo que no se mide se ve bien y está mal.</p><span class="quien reveal">Quién lo dijo o de dónde sale</span></div>
</section>
```

Para decirla con `palabras` y luego `marcar`. Una por presentación, dos como mucho.
