# Arma la presentación en UN solo archivo HTML (motor, imágenes, letras, voz y tiempos adentro),
# la revisa en Chrome y, si se pide, imprime el PDF.
#   python armar.py              arma y revisa
#   python armar.py --pdf        además imprime el PDF
#   python armar.py --sin-revisar   solo si no hay Chrome; lo dice fuerte
# Se detiene con un mensaje claro si algo está mal: una presentación que se ve bien y está mal
# es peor que una que no arma.
import base64, re, os, sys, json, subprocess, pathlib, shutil, hashlib, mimetypes
try: sys.stdout.reconfigure(encoding="utf-8"); sys.stderr.reconfigure(encoding="utf-8")
except Exception: pass
aqui = pathlib.Path(__file__).resolve().parent
args = sys.argv[1:]
def alto(msg): sys.exit("\n✗ " + msg + "\n")

src = (aqui / "index.html").read_text(encoding="utf-8")
cfg = json.loads((aqui / "guion.json").read_text(encoding="utf-8"))
nombre = cfg.get("archivo") or aqui.name

# Un carácter de control invisible (una diagonal-b escrita desde un script se vuelve retroceso)
# rompe una condición sin que la línea se vea distinta.
for f in ("index.html", "motor.js", "motor.css"):
    txt = (aqui / f).read_text(encoding="utf-8")
    ctl = [i for i, c in enumerate(txt) if ord(c) < 32 and c not in "\t\n\r"]
    if ctl: alto(f"{f} trae {len(ctl)} caracteres de control invisibles; el primero en la posición {ctl[0]}")

# El audio tiene que ser del guion actual: si el texto cambió y la voz no, la página se desfasa.
capf = aqui / "audio" / "capitulos.json"
if not capf.exists() or not (aqui / "audio" / "presentacion.mp3").exists():
    alto("Falta el audio. Corre primero:  python generar-audio.py")
caps = json.loads(capf.read_text(encoding="utf-8"))
base = {"voz": cfg.get("voz"), "ritmo": cfg.get("ritmo"),
        "secciones": [[s["id"], s["t"], s.get("cues", [])] for s in cfg["secciones"]]}
if caps.get("huella") != hashlib.sha1(json.dumps(base, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]:
    alto("El guion cambió después de generar la voz. Corre otra vez:  python generar-audio.py")

# Cada sección del guion debe existir en la página con su id.
for s in cfg["secciones"]:
    if not re.search(r'id="' + re.escape(s["id"]) + r'"', src):
        alto(f'La sección "{s["id"]}" del guion no existe en index.html (falta id="{s["id"]}")')

def b64(p): return base64.b64encode(p.read_bytes()).decode()
def tipo(p): return mimetypes.guess_type(p.name)[0] or ("image/svg+xml" if p.suffix == ".svg" else "application/octet-stream")
out = src
css = (aqui / "motor.css").read_text(encoding="utf-8")
js = (aqui / "motor.js").read_text(encoding="utf-8")
if '<link rel="stylesheet" href="motor.css">' not in out: alto("index.html ya no carga motor.css")
if '<script src="motor.js"></script>' not in out: alto("index.html ya no carga motor.js")
out = out.replace('<link rel="stylesheet" href="motor.css">', "<style>\n" + css + "\n</style>")
if "/*CAPITULOS*/null" not in js: alto("motor.js perdió el marcador /*CAPITULOS*/")
js = js.replace("/*CAPITULOS*/null", json.dumps(caps, ensure_ascii=False, separators=(",", ":")))
out = out.replace('<script src="motor.js"></script>', "<script>\n" + js.replace("</script", "<\\/script") + "\n</script>")

def emb(m):
    p = aqui / m.group(2)
    if not p.exists(): alto(f"Falta el archivo {m.group(2)}")
    return m.group(1) + '="data:' + tipo(p) + ";base64," + b64(p) + '"'
out = re.sub(r'(src|href)="((?:img|audio)/[^"]+)"', emb, out)
def fnt(m):
    p = aqui / m.group(1)
    if not p.exists(): alto(f"Falta la letra {m.group(1)}")
    return 'url("data:font/woff2;base64,' + b64(p) + '")'
out = re.sub(r'url\("(fonts/[^"]+)"\)', fnt, out)
out = re.sub(r"url\((img/[^)]+)\)", lambda m: 'url("data:' + tipo(aqui / m.group(1)) + ";base64," + b64(aqui / m.group(1)) + '")', out)
for resto in ('src="img/', 'src="audio/', 'url("fonts/', "url(img/"):
    if resto in out: alto(f"Quedó un archivo sin meter: {resto}…")

dest = aqui / f"{nombre}.html"
dest.write_text(out, encoding="utf-8")
mb = os.path.getsize(dest) / 1024 / 1024
print(f"✓ {dest.name}  {mb:.1f} MB", flush=True)
if mb > 15: print("  ⚠ pesa más de 15 MB: comprime las imágenes (JPG de 1600 px de ancho basta)", flush=True)

if "--sin-revisar" in args:
    print("⚠ NO se revisó en Chrome: nadie comprobó que cada señalamiento encuentre su pieza ni que se vea en celular.")
    sys.exit(0)
node = shutil.which("node")
if not node: alto("Falta Node.js (versión 22 o más) para revisar. Instálalo o corre con --sin-revisar, sabiendo que nadie lo revisó.")
cmd = [node, str(aqui / "chrome.mjs"), str(dest)]
if "--pdf" in args: cmd += ["--pdf", str(aqui / f"{nombre}.pdf")]
r = subprocess.run(cmd)
if r.returncode: alto("La revisión en Chrome encontró problemas (arriba dice cuáles).")
