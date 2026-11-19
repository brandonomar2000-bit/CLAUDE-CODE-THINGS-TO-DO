#!/usr/bin/env bash
# Une los archivos de src/ en un solo index.html listo para abrir o para GitHub Pages.
set -euo pipefail
cd "$(dirname "$0")"
OUT=../index.html
{
  printf '%s\n' '<!doctype html>' '<html lang="es">' '<head>' \
    '<meta charset="utf-8">' \
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">' \
    '<title>Naranjito Lab</title>' \
    '<meta name="description" content="Demo interactiva para colectivos estudiantiles: agentes de IA, prototipos de las cuatro áreas del conocimiento, render en tiempo real y un museo de la historia de la IA.">' \
    '<link rel="preconnect" href="https://fonts.googleapis.com">' \
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' \
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;600&family=Instrument+Serif:ital@0;1&family=Unbounded:wght@500;700;800&display=swap">' \
    '<style>[hidden]{display:none!important}:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}</style>'
  echo '<style>'; cat style.css; echo '</style>'
  echo '</head>'; echo '<body>'
  cat body.html
  echo '<script>'; cat app.js; echo '</script>'
  echo '<script>'; cat gallery.js; echo '</script>'
  echo '<script>'; cat render.js; echo '</script>'
  echo '</body>'; echo '</html>'
} > "$OUT"
echo "Listo: $(wc -c < "$OUT") bytes en index.html"
