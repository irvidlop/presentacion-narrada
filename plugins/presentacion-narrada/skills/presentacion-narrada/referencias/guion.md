# Cómo escribir lo que dice la voz

La voz es la persona que presenta. Si suena a robot o a folleto, la presentación entera se siente falsa, por bonita que se vea.

## El tono

- **Habla como la persona que presenta**, en primera persona del plural si es un equipo: "bajamos", "armamos", "nos falta". Directo, sin rodeos.
- **Frases cortas.** Una idea por frase. La voz no tiene comas visibles: una frase de 30 palabras se pierde al oírla.
- **Primero lo que pasó, luego el porqué.** "Bajamos el tiempo de respuesta a cuatro horas. Antes eran dos días, porque todo pasaba por una sola persona."
- **Nada de relleno ni de frases de folleto**: "cabe destacar", "es importante mencionar", "sin duda", "en este sentido", "robusto", "innovador", "potenciar", "de vanguardia". Tampoco finales profundos del tipo "y eso lo cambia todo".
- **No le digas al público qué sentir** ("esto es impresionante"). Di el dato y deja que impresione solo.
- **Nombra lo que se ve.** Si en pantalla hay tres tarjetas, la voz las nombra en el mismo orden. Así el señalamiento cae donde la persona está mirando.
- **Nada de lo que no esté en la página ni en los datos.** La voz explica lo que hay; no inventa.

## Los números, como se dicen

edge-tts lee casi todo bien, pero se entiende mejor así:
- Cifras grandes redondas: "casi dos millones de visitas", no "1,955,934".
- Porcentajes: "el treinta y siete por ciento" o "37%" (lo lee bien).
- Precios: "mil cincuenta pesos". `$1,050` también lo lee, pero con letra no hay duda.
- Siglas que se deletrean: escríbelas separadas ("C R M") o usa el nombre ("el sistema de clientes"). "GA4" suena raro; mejor "Analytics".
- Horas y fechas: "a las nueve de la mañana", "el 17 de septiembre".
- Palabras en inglés: la voz en español las pronuncia en español. Si importan, cámbialas ("vista previa" en vez de "preview").

## Cuánto dura

- La voz dice unas 150 palabras por minuto a 1×, unas 190 a 1.25× (con la que arranca).
- Sección normal: hasta 120 palabras. La portada: 40 a 70.
- El largo lo pone el contenido: un reporte corto da una presentación de uno o dos minutos, y está bien. No rellenes. En el otro extremo, más de 10 minutos a 1.25× cansa: parte en dos o recorta.

## Los señalamientos

```json
"cues": [["primeras palabras", "selector", "acción"], …]
```

- **Uno cada una o dos frases.** Si la voz habla 20 segundos sin que nada se mueva, la persona deja de mirar.
- **Las palabras se copian del texto**, de 2 a 5, y tienen que ser únicas dentro de la sección. Si se repiten, el señalamiento cae en la primera vez que aparecen.
- **En orden**: el segundo señalamiento tiene que decirse después del primero. El script se detiene si no.
- **Señala lo más chico que tenga sentido**: la tarjeta, no toda la rejilla; la fila, no toda la tabla. Una rejilla completa se señala solo cuando la voz habla de todo el grupo.
- La primera frase de cada sección conviene señalarla (título, `lead` o la pieza principal). Si no, la página baja al inicio de la sección y espera.
- Pestañas: `tab:idPanel` en el señalamiento de la frase que la nombra. Después, las siguientes piezas del mismo panel ya no necesitan `tab:`.
- `selector@texto` busca el primer elemento del selector que contiene ese texto: `.stat@ticket`, `.nodo@Entrega`, `tr@Monterrey`.

## Antes de generar la voz

1. Lee el guion en voz alta, o por lo menos mentalmente con ritmo. Lo que te trabe, cámbialo.
2. Si la skill `no-ai-slop` está disponible, pásale todos los textos `t` y quédate con su versión, cuidando que los señalamientos sigan encontrando sus palabras.
3. `python generar-audio.py`. Si una frase no aparece, el mensaje dice cuál y en qué sección.

## Voces

En `guion.json`, `"voz"`:
- `es-MX-DaliaNeural`: mujer, México. La de la primera presentación.
- `es-MX-JorgeNeural`: hombre, México.
- Otras: `python -m edge_tts --list-voices` y busca las que empiezan con `es-`.

`"ritmo": "+3%"` acelera la voz un poco desde el origen; el público la acelera más con los botones 1.25× y 1.5×. Entre `-10%` y `+10%` suena natural.
