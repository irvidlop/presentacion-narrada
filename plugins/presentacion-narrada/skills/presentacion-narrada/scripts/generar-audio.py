# Genera la voz de la presentación desde guion.json.
#   python generar-audio.py
# Necesita edge-tts (python -m pip install edge-tts) e internet: la voz la genera el servicio de Microsoft.
# No necesita ffmpeg: las partes se pegan cuadro por cuadro.
#
# Deja en audio/:
#   presentacion.mp3  el audio completo
#   capitulos.json    por sección: en qué segundo empieza, cada palabra con su tiempo (subtítulos)
#                     y cada señalamiento con su tiempo (qué se ilumina y qué se anima).
#
# Los señalamientos van en guion.json como ["primeras palabras de la frase", "selector", "acción"].
# El tiempo sale de la palabra real del audio, no de un cálculo: si una frase no aparece, se detiene.
import asyncio, json, pathlib, sys, re, unicodedata, hashlib, time
try: sys.stdout.reconfigure(encoding="utf-8"); sys.stderr.reconfigure(encoding="utf-8")
except Exception: pass
try:
    import edge_tts
except ImportError:
    sys.exit("Falta edge-tts. Instálalo con:  python -m pip install edge-tts")

aqui = pathlib.Path(__file__).resolve().parent
PAUSA = 0.7  # segundos de silencio entre secciones
cfg = json.loads((aqui / "guion.json").read_text(encoding="utf-8"))
VOZ = cfg.get("voz", "es-MX-DaliaNeural")
RITMO = cfg.get("ritmo", "+3%")
secciones = cfg["secciones"]

def norm(w):
    w = unicodedata.normalize("NFD", w.lower())
    w = "".join(c for c in w if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9ñ]", "", w)

def huella(cfg):
    base = {"voz": cfg.get("voz"), "ritmo": cfg.get("ritmo"),
            "secciones": [[s["id"], s["t"], s.get("cues", [])] for s in cfg["secciones"]]}
    return hashlib.sha1(json.dumps(base, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]

# Duración real contando cuadros MP3 (edge-tts entrega MPEG-2 capa III, 24 kHz, 48 kbps, mono).
BR = {1: [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320],
      2: [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160]}
SR = {1: [44100, 48000, 32000], 2: [22050, 24000, 16000]}
def cuadros(data):
    i, n, seg = 0, 0, 0.0
    while i + 4 <= len(data):
        h = data[i:i + 4]
        if h[0] != 0xFF or (h[1] & 0xE0) != 0xE0:
            i += 1; continue
        ver = 1 if (h[1] >> 3) & 3 == 3 else 2
        bri, sri, pad = h[2] >> 4, (h[2] >> 2) & 3, (h[2] >> 1) & 1
        if bri in (0, 15) or sri == 3:
            i += 1; continue
        br, sr = BR[ver][bri] * 1000, SR[ver][sri]
        size = (144 if ver == 1 else 72) * br // sr + pad
        muestras = 1152 if ver == 1 else 576
        i += size; n += 1; seg += muestras / sr
    return n, seg

async def voz(txt):
    com = edge_tts.Communicate(txt, VOZ, rate=RITMO, boundary="WordBoundary")
    audio, palabras = bytearray(), []
    async for ch in com.stream():
        if ch["type"] == "audio":
            audio += ch["data"]
        elif ch["type"] == "WordBoundary":
            palabras.append((ch["offset"] / 1e7, ch["text"]))
    return bytes(audio), palabras

def voz_con_reintentos(txt, sid):
    for intento in range(3):
        try:
            return asyncio.run(voz(txt))
        except Exception as e:
            print(f"  [{sid}] la voz falló ({e.__class__.__name__}), reintento {intento + 1}/3")
            time.sleep(2 + intento * 3)
    sys.exit(f"[{sid}] no se pudo generar la voz. Revisa la conexión a internet.")

def alinear(texto, marcas):
    """Empareja cada palabra del guion (con su puntuación) con su tiempo en el audio."""
    out, j = [], 0
    for w in texto.split():
        n, t = norm(w), None
        if n:
            for k in range(j, min(j + 4, len(marcas))):
                if norm(marcas[k][1]) == n:
                    t, j = marcas[k][0], k + 1
                    break
        if t is None:
            t = out[-1][0] if out else 0.0
        out.append([round(t, 2), w])
    return out

ids = [s["id"] for s in secciones]
if len(set(ids)) != len(ids):
    sys.exit("Hay dos secciones con el mismo id en guion.json")

# Silencio: cuadros MP3 vacíos con la misma cabecera que usa la voz.
silencio = None
partes, caps, t0 = [], [], 0.0
for s in secciones:
    data, marcas = voz_con_reintentos(s["t"], s["id"])
    n, d = cuadros(data)
    if d < 1 or not marcas:
        sys.exit(f"La sección {s['id']} salió vacía o sin tiempos ({d:.1f} s, {len(marcas)} palabras)")
    if silencio is None:
        cab = data[data.index(b"\xff"):][:4]
        tam = len(data) // n if n else 144
        silencio = (cab + bytes(tam - 4)) * round(PAUSA / (d / n))
        _, pausa = cuadros(silencio)
    pal = alinear(s["t"], marcas)
    normas = [norm(w) for _, w in pal]
    cues = []
    for cue in s.get("cues", []):
        if len(cue) != 3:
            sys.exit(f"[{s['id']}] cada señalamiento lleva 3 partes [frase, selector, acción]: {cue}")
        frase, sel, act = cue
        f = [norm(w) for w in frase.split() if norm(w)]
        pos = next((k for k in range(len(normas)) if normas[k:k + len(f)] == f), None)
        if pos is None:
            sys.exit(f"[{s['id']}] no encontré en el texto la frase del señalamiento: '{frase}'")
        cues.append([round(t0 + max(0, pal[pos][0] - 0.12), 2), sel, act])
    if [c[0] for c in cues] != sorted(c[0] for c in cues):
        sys.exit(f"[{s['id']}] los señalamientos no van en el orden en que se dicen")
    caps.append({"id": s["id"], "inicio": round(t0, 2),
                 "palabras": [[round(t0 + tt, 2), w] for tt, w in pal], "cues": cues})
    partes += [data, silencio]
    t0 += d + pausa
    print(f"{s['id']:16s} {d:6.1f} s  {len(marcas):4d} palabras  {len(cues):2d} señalamientos")

(aqui / "audio").mkdir(exist_ok=True)
salida = aqui / "audio" / "presentacion.mp3"
salida.write_bytes(b"".join(partes))
_, total = cuadros(salida.read_bytes())
(aqui / "audio" / "capitulos.json").write_text(json.dumps(
    {"duracion": round(total, 2), "huella": huella(cfg), "capitulos": caps},
    ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(f"presentacion.mp3  {total / 60:.1f} min a 1×, {total / 1.25 / 60:.1f} min a 1.25×  ({salida.stat().st_size // 1024} KB)")
