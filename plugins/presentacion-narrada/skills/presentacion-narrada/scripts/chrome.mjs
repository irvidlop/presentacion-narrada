// Revisa la presentación ya armada en un Chrome sin ventana y, si se pide, imprime el PDF.
// Lo llama armar.py:  node chrome.mjs <archivo.html> [--pdf <archivo.pdf>]
// Revisa en computadora (1440×900) y en celular (390×844):
//   - que no quede ningún bloque invisible después de recorrer la página,
//   - que la página no se salga de lado en el celular,
//   - que la voz metida en el archivo se pueda reproducir y dure lo que dicen los capítulos,
//   - que cada señalamiento encuentre su pieza y cada acción exista,
//   - que no haya errores de JavaScript.
//   - que al llegar a cada señalamiento se ilumine justo la pieza que pide el guion.
// Deja capturas en revision/: la portada en computadora y celular, y cada sección en el momento
// de su primer señalamiento (revision/secciones/), para mirarlas sin tener que darle play.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync, existsSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os"; import { join, dirname } from "node:path"; import { pathToFileURL } from "node:url";

if (typeof WebSocket === "undefined") { console.error("✗ Hace falta Node 22 o más nuevo (node --version)."); process.exit(5); }
const [html, ...rest] = process.argv.slice(2);
const pdfOut = rest[0] === "--pdf" ? rest[1] : null;
const L = process.env.LOCALAPPDATA || "", PF = process.env.PROGRAMFILES || "C:/Program Files", PF86 = process.env["PROGRAMFILES(X86)"] || "C:/Program Files (x86)";
const candidatos = [process.env.CHROME,
  join(PF, "Google/Chrome/Application/chrome.exe"), join(PF86, "Google/Chrome/Application/chrome.exe"), join(L, "Google/Chrome/Application/chrome.exe"),
  join(PF86, "Microsoft/Edge/Application/msedge.exe"), join(PF, "Microsoft/Edge/Application/msedge.exe"),
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"].filter(Boolean);
const exe = candidatos.find(p => existsSync(p));
if (!exe) { console.error("✗ No encontré Chrome ni Edge. Si está en otro lugar: set CHROME=ruta\\chrome.exe"); process.exit(5); }

const port = 9400 + Math.floor(Math.random() * 400);
const prof = mkdtempSync(join(tmpdir(), "presentacion-"));
const chrome = spawn(exe, ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`,
  "--autoplay-policy=no-user-gesture-required", "--mute-audio", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
// El perfil temporal de Chrome pesa unos 50 MB. Se borra siempre, también si algo falla, y después
// de que Chrome terminó de cerrar: borrarlo antes falla en silencio y se acumulan hasta llenar el disco.
const closed = new Promise(r => chrome.once("exit", r));
let ws;
async function finish(code) {
  try { ws && ws.close(); } catch {}
  chrome.kill(); await Promise.race([closed, sleep(5000)]);
  for (let i = 0; i < 10; i++) { try { rmSync(prof, { recursive: true, force: true }); break; } catch { await sleep(300); } }
  process.exit(code);
}
let tabs; for (let i = 0; i < 80; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
if (!tabs) { console.error("✗ Chrome no arrancó"); await finish(5); }
ws = new WebSocket(tabs.find(t => t.type === "page").webSocketDebuggerUrl);
await new Promise(r => ws.onopen = r);
let id = 0; const pend = new Map(), errores = [];
ws.onmessage = e => { const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  if (m.method === "Runtime.exceptionThrown") errores.push(m.params.exceptionDetails.exception?.description?.split("\n")[0] || m.params.exceptionDetails.text);
  if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errores.push(m.params.args.map(a => a.value ?? a.description).join(" ")); };
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async expr => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result?.result?.value;
await send("Page.enable"); await send("Runtime.enable");
const url = pathToFileURL(html).href;
const carpeta = join(dirname(html), "revision"); mkdirSync(carpeta, { recursive: true });
const fallas = [];

async function recorrer(nombre, w, h, mobile) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: mobile ? 2 : 1, mobile });
  await send("Page.navigate", { url }); await sleep(2500);
  const alto = await ev("document.documentElement.scrollHeight");
  for (let y = 0; y <= alto; y += Math.round(h * 0.6)) { await ev(`scrollTo({top:${y},behavior:"instant"})`); await sleep(140); }
  await sleep(900);
  const st = await ev(`JSON.stringify(window.__estado ? window.__estado(${w}) : null)`);
  if (!st) { fallas.push(`${nombre}: la página no cargó el motor (¿error de JavaScript?)`); return; }
  const e = JSON.parse(st);
  if (e.ocultos) fallas.push(`${nombre}: ${e.ocultos} bloques se quedaron invisibles después de recorrer la página`);
  if (e.ancho > w + 1) fallas.push(`${nombre}: el navegador alejó la página a ${e.ancho}px en una pantalla de ${w}px; algo es más ancho que la pantalla`);
  if (e.anchas.length) fallas.push(`${nombre}: hay piezas que se salen de la pantalla por la derecha: ${e.anchas.join(', ')}`);
  if (e.scroll > w + 1) fallas.push(`${nombre}: la página mide ${e.scroll}px de ancho en una pantalla de ${w}px (se sale de lado)`);
  // Se mide dos veces con 3 s de separación: una pieza a media transición (un paso que se está
  // encendiendo) puede medir mal un instante. Solo cuenta lo que falla las dos veces.
  let bajo = JSON.parse(await ev("JSON.stringify(window.__contraste())"));
  if (bajo.length) { await sleep(3000); const otra = JSON.parse(await ev("JSON.stringify(window.__contraste())")); bajo = bajo.filter(x => otra.includes(x)); }
  if (bajo.length) fallas.push(`${nombre}: ${bajo.length} textos casi no se leen (contraste menor a 3:1): ${bajo.slice(0, 5).join(" | ")}`);
  await ev(`scrollTo({top:0,behavior:"instant"})`); await sleep(1800);
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(carpeta, `${nombre}.png`), Buffer.from(shot.result.data, "base64"));
}

await recorrer("escritorio", 1440, 900, false);
// La voz metida en el archivo: que se pueda leer y que dure lo que dicen los capítulos.
const aud = JSON.parse(await ev(`new Promise(r=>{const a=document.getElementById('aud');const f=()=>r(JSON.stringify({d:a.duration,err:a.error&&a.error.code}));if(a.readyState>=1)f();else{a.addEventListener('loadedmetadata',f);a.addEventListener('error',f);a.load();setTimeout(f,8000)}})`));
const capsDur = await ev("window.__estado(1440).duracion");
if (aud.err || !isFinite(aud.d) || aud.d < 1) fallas.push(`la voz no se puede reproducir dentro del archivo (duración ${aud.d}, error ${aud.err})`);
else if (Math.abs(aud.d - capsDur) > 1.5) fallas.push(`la voz dura ${aud.d.toFixed(1)} s y los capítulos dicen ${capsDur} s: la página se desfasaría`);
const faltan = JSON.parse(await ev("JSON.stringify(window.__cuesSinDestino ? window.__cuesSinDestino() : ['falta la función de revisión'])"));
faltan.forEach(f => fallas.push("señalamiento: " + f));

// Recorrido por los señalamientos: brinca el audio a cada uno y comprueba que lo iluminado sea lo que pide
// el guion. Así se ve si un señalamiento cae en la pieza de otra sección o se lo gana el siguiente.
if (!faltan.length) {
  const dirSec = join(carpeta, "secciones"); rmSync(dirSec, { recursive: true, force: true }); mkdirSync(dirSec, { recursive: true });
  await send("Page.navigate", { url }); await sleep(2000);
  const caps = JSON.parse(await ev("JSON.stringify(window.__cues())"));
  let n = 0, k = 0;
  for (const c of caps) {
    k++;
    for (let j = 0; j < c.cues.length; j++) {
      const [t, sel, acc] = c.cues[j];
      await ev(`(()=>{const a=document.getElementById('aud');a.currentTime=${t + 0.2};a.dispatchEvent(new Event('timeupdate'))})()`);
      await sleep(acc && acc.startsWith("tab:") ? 550 : 350);
      const r = JSON.parse(await ev(`JSON.stringify(window.__spotEs(${JSON.stringify(sel)},${JSON.stringify(c.id)}))`));
      n++;
      if (!r.ok) fallas.push(`señalamiento en ${c.id} ("${sel}"): se iluminó ${r.spot} en vez de ${r.esperado}`);
      if (j === 0) { await sleep(900); const sh = await send("Page.captureScreenshot", { format: "jpeg", quality: 72 });
        writeFileSync(join(dirSec, `${String(k).padStart(2, "0")}-${c.id}.jpg`), Buffer.from(sh.result.data, "base64")); }
    }
  }
  console.log(`  recorrí ${n} señalamientos en ${caps.length} secciones`);
}
await recorrer("celular", 390, 844, true);
await send("Emulation.clearDeviceMetricsOverride");
[...new Set(errores)].forEach(x => { if (!/Señalamiento sin destino|Acción desconocida/.test(x)) fallas.push("error de JavaScript: " + x); });

if (fallas.length) { console.error("✗ Revisión:\n  - " + [...new Set(fallas)].join("\n  - ")); await finish(4); }
console.log(`✓ Revisión: sin bloques ocultos, sin desborde en celular, voz de ${Math.round(aud.d)} s, todos los señalamientos con destino. Capturas en revision/`);

if (pdfOut) {
  // ?pdf apaga las animaciones: sin eso se imprime a media animación (contadores en 0, barras vacías).
  await send("Page.navigate", { url: url + "?pdf" }); await sleep(3500);
  if (!(await ev("document.documentElement.classList.contains('pdf')"))) { console.error("✗ La página no entró en modo pdf"); await finish(2); }
  const r = await send("Page.printToPDF", { preferCSSPageSize: true, printBackground: true });
  if (!r.result) { console.error("✗ No se pudo imprimir el PDF", JSON.stringify(r.error)); await finish(3); }
  writeFileSync(pdfOut, Buffer.from(r.result.data, "base64"));
  console.log("✓ PDF:", pdfOut);
}
await finish(0);
