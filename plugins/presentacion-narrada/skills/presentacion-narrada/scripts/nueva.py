# Crea la carpeta de una presentación nueva a partir de la plantilla.
#   python nueva.py "C:/ruta/mi-presentacion" --tema morado --titulo "Resultados del trimestre"
# Temas: azul (el de siempre), morado (con rosa), verde (con dorado), violeta (con naranja).
# La carpeta queda completa y por su cuenta: trae el motor y los scripts, así que se puede volver a
# armar aunque el skill cambie después.
import sys, shutil, pathlib, argparse, re, json
try: sys.stdout.reconfigure(encoding="utf-8"); sys.stderr.reconfigure(encoding="utf-8")
except Exception: pass

TEMAS = {
  "azul": dict(marca="#3E5BA9", oscuro="#2B3F78", tinte="#EAF0FB", acento="#E0795B", brillo="#58C2A7",
                 bmarca="#A9BFF2", bacento="#F6B39E", noche="#161A26", noche2="#232838", papel="#F8F8F5"),
  # morado: botones #8E44A8 (5.93:1 con blanco) y rosa #EC80A8. Encima del rosa, letra blanca.
  "morado": dict(marca="#8E44A8", oscuro="#6E2F86", tinte="#F2EAF7", acento="#EC80A8", brillo="#FF9248",
             bmarca="#D9A6EA", bacento="#F4A6C3", noche="#1B1322", noche2="#2A1E33", papel="#FBF9F4"),
  "verde": dict(marca="#308373", oscuro="#1F5E52", tinte="#E4F2EF", acento="#C9A45C", brillo="#86CCBF",
             bmarca="#86CCBF", bacento="#E8CF9A", noche="#10201D", noche2="#1A2F2B", papel="#F8F7F3"),
  # violeta #6B5E9B con naranja #FF9248 y teal #58C2A7.
  "violeta": dict(marca="#6B5E9B", oscuro="#4E4378", tinte="#EFECF7", acento="#FF9248", brillo="#58C2A7",
             bmarca="#B9AEE3", bacento="#FFC39A", noche="#1C1830", noche2="#2A2544", papel="#FFF8F1"),
}

def bloque(t):
    return f"""/*TEMA*/
@font-face{{font-family:"Raleway";font-weight:100 900;font-display:block;src:url("fonts/Raleway-var-latin.woff2") format("woff2")}}
@font-face{{font-family:"Work Sans";font-weight:100 900;font-display:block;src:url("fonts/WorkSans-var-latin.woff2") format("woff2")}}
:root{{
  --marca:{t['marca']}; --marca-oscuro:{t['oscuro']}; --marca-tinte:{t['tinte']}; --acento:{t['acento']}; --brillo:{t['brillo']};
  --brillo-marca:{t['bmarca']}; --brillo-acento:{t['bacento']};
  --tinta:#1E2230; --tinta-2:#525868; --tinta-3:#838999;
  --papel:{t['papel']}; --tarjeta:#FFFFFF; --linea:#E3E2DC; --suave:#EFEEE9;
  --noche:{t['noche']}; --noche-2:{t['noche2']}; --en-noche:#F4F2F8; --en-noche-2:#C3BECF;
  --f-titulo:"Raleway",system-ui,sans-serif; --f-texto:"Work Sans",system-ui,sans-serif;
}}
/*FIN-TEMA*/"""

ap = argparse.ArgumentParser()
ap.add_argument("destino")
ap.add_argument("--tema", default="azul", choices=sorted(TEMAS))
ap.add_argument("--titulo", default="")
a = ap.parse_args()

skill = pathlib.Path(__file__).resolve().parent.parent
dest = pathlib.Path(a.destino).resolve()
if dest.exists() and any(dest.iterdir()):
    sys.exit(f"La carpeta {dest} ya tiene archivos. Elige otra o bórrala primero.")
shutil.copytree(skill / "plantilla", dest, dirs_exist_ok=True)
for f in ("generar-audio.py", "armar.py", "chrome.mjs"):
    shutil.copy2(skill / "scripts" / f, dest / f)

html = (dest / "index.html").read_text(encoding="utf-8")
html = re.sub(r"/\*TEMA\*/.*?/\*FIN-TEMA\*/", lambda m: bloque(TEMAS[a.tema]), html, flags=re.S)
if a.titulo:
    html = html.replace("<title>Presentación de ejemplo</title>", f"<title>{a.titulo}</title>")
(dest / "index.html").write_text(html, encoding="utf-8")
gtxt = (dest / "guion.json").read_text(encoding="utf-8")
slug = re.sub(r"[^a-z0-9]+", "-", (a.titulo or dest.name).lower().translate(str.maketrans("áéíóúüñ", "aeiouun"))).strip("-")
gtxt = re.sub(r'"archivo": "[^"]*"', '"archivo": ' + json.dumps(slug or "presentacion"), gtxt, count=1)
json.loads(gtxt)
(dest / "guion.json").write_text(gtxt, encoding="utf-8")
print(f"✓ Presentación nueva en {dest} (tema {a.tema}). Trae el ejemplo adentro: reemplázalo con el contenido real.")
