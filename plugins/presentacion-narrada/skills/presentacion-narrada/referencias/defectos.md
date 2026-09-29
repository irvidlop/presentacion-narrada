# Por qué el motor es como es

Cada decisión del motor viene de algo que falló en la primera presentación (septiembre de 2026). Todos esos defectos se veían bien en una prueba y fallaban en otra. Si vas a cambiar el motor, lee esto antes.

## Bloques que nunca aparecían

El aviso del navegador de "ya está en pantalla" (IntersectionObserver) se puede saltar un bloque con un scroll rápido, y en una pestaña que no se dibuja ni siquiera llega. El bloque se queda invisible para siempre y nada marca error. **Ahora** se revisa la posición real en cada scroll y, como red de seguridad, cada medio segundo mientras quede algo pendiente. La revisión recorre la página entera y cuenta los que quedan ocultos.

## Contadores en 0

Ponían el 0 antes de animar; si el navegador no dibujaba, se quedaban en 0. **Ahora** el número final está escrito en el HTML y el 0 se pone hasta el primer cuadro de la animación.

## El PDF salía a media animación

`chrome --print-to-pdf` pierde el `?pdf` de la dirección, la página arranca con animaciones y se imprime con contadores en 0 y paneles vacíos. **Ahora** se imprime por el protocolo de depuración de Chrome (`chrome.mjs`), que abre con `?pdf` y se detiene si la página no entró en ese modo.

## Un carácter invisible rompía el código

Una diagonal-b (`\b`) escrita desde un script de Python entró como retroceso (carácter 0x08). La línea se veía idéntica y una condición dejaba de funcionar. **Ahora** `armar.py` se detiene si index.html, motor.js o motor.css traen caracteres de control. Para editar código con diagonales inversas, usa la herramienta de edición, no un script que escriba el texto.

## La voz y la página se desfasaban

Si se cambia el guion y no se regenera la voz, la página avanza a destiempo sin que nada falle. **Ahora** `capitulos.json` guarda una huella del guion y `armar.py` se niega a armar si no coincide. Además, el tiempo de cada señalamiento sale de la palabra real del audio (los "WordBoundary" de edge-tts), no de un cálculo por número de palabras.

## La velocidad no desfasa nada

La velocidad cambia `playbackRate` del audio, y los señalamientos se disparan por `currentTime`, que es el tiempo del audio y no del reloj. A 1.5× todo llega en su momento. El reloj del reproductor sí se divide entre la velocidad para mostrar lo que de verdad falta. `preservesPitch` mantiene el tono de la voz.

## En el celular el reproductor no se veía

Una barra de dirección falsa no se dejaba encoger y empujaba la página a 444 px en un teléfono de 390. El teléfono alejaba la página para que cupiera y el reproductor quedaba fuera de la pantalla. `scrollWidth` no lo delata porque `body` tiene `overflow-x:hidden`. **Ahora** la revisión emula un celular de verdad y compara `innerWidth` con 390; si crece, dice qué pieza es la ancha. Arreglo común: `min-width:0` en hijos de rejilla y en textos que no se cortan.

## "No hagas más claro lo demás"

La primera versión del señalamiento atenuaba el resto de la sección. Se pidió quitarlo: todo tiene que seguir viéndose y solo lo señalado se destaca. Por eso `.spot` levanta y pone un aro, y no toca lo demás.

## El puntero tapaba los títulos

La etiqueta del puntero iba a un lado y tapaba el texto. **Ahora** va arriba del elemento (`top:-44px`) y el puntero se queda dentro de la pantalla.

## El disco se llenó

Cada Chrome que abre un script deja un perfil temporal de unos 50 MB, y borrarlo justo después de cerrarlo falla en silencio. Se juntaron 31. **Ahora** `chrome.mjs` espera a que Chrome cierre, reintenta el borrado y lo hace también si algo falla.

## Sin ffmpeg

La primera versión pegaba las partes de audio con ffmpeg. edge-tts entrega MP3 de cuadros fijos (24 kHz, 48 kbps, 144 bytes por cuadro), así que ahora se pegan directo y el silencio entre secciones son cuadros vacíos con la misma cabecera. La duración se calcula contando cuadros; coincide con ffprobe al milisegundo (92.448 s en la prueba).

## Las capturas largas mienten

La captura de página completa de Chrome repite la portada pasada cierta altura. Para mirar la página hay que tomar pantalla por pantalla. Con `scroll-behavior:smooth`, los saltos seguidos de un script se interrumpen entre sí: usa `scrollTo({top, behavior:"instant"})`, o parecerá que la página no carga.

## Un señalamiento caía en otra sección

`.fila@Julio` buscaba en toda la página y encontraba la fila Julio de una sección anterior; la revisión decía que todo tenía destino porque sí lo tenía, solo que el equivocado. **Ahora** se busca primero dentro de la sección que se narra. Y la revisión brinca el audio a cada señalamiento y compara lo iluminado con lo que pide el guion, sección por sección (salió en la primera prueba con un reporte de CRM).

## La etiqueta del puntero tapaba lo de arriba

Al ir encima de la pieza, tapaba el título que estaba justo arriba, y el aro pegado al borde tocaba el texto. **Ahora** el aro va separado 6 px (`outline-offset`), el puntero se pone en la esquina de afuera y la etiqueta se desvanece a los dos segundos.

## Un recuadro que no se leía y un paso a paso roto en celular

La segunda prueba (una guía de un agendador de citas) encontró dos cosas que la revisión dejaba pasar. En una sección oscura, el recuadro destacado salía blanco con letra casi blanca: faltaba su versión oscura. Y en celular, la descripción de cada paso caía en la columna de 46 px del círculo, una palabra por renglón. **Ahora** las dos están en motor.css, y la revisión mide el contraste de cada texto contra su fondo real. Si baja de 3:1, se detiene. Se mide dos veces con 3 s de separación, porque un paso que se está encendiendo mide mal un instante y daba falsas alarmas.

## Señalar una cifra de la portada la desaparecía

Las cifras de la portada entran con una animación CSS de opacidad 0 a 1. El pulso del aro también era una animación CSS, y una animación nueva reemplaza a la anterior: al señalar la cifra, la pieza volvía a su opacidad base, 0, y se esfumaba. **Ahora** el pulso lo pone motor.js con Web Animations, que se suma encima sin quitar la animación de la pieza. Todos los efectos nuevos usan Web Animations por lo mismo.

## Los efectos nuevos: de dónde salen y qué reglas siguen

Los 22 efectos salen del catálogo de HyperFrames (HeyGen): marcatextos, trazo que se dibuja, cámara que acerca, contador tragamonedas, clic con onda, confeti, sello, entrada en cascada y comparación en espejo. Siguen las reglas de impeccable: cada uno dice algo, frena suave (ease-out-expo), no rebota, y la pieza ya está completa sin animación. Por eso la gráfica y los anillos se dibujan completos desde el principio y la animación solo los recorre. El año "2026" salía como "2,026" al contar; ahora el contador respeta si el número venía escrito con comas o sin ellas.
