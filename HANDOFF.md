# HANDOFF · Naranjito Lab

Relevo para continuar en una sesión nueva. Léelo completo antes de tocar código.

## Dónde está todo
- **Repo:** `brandonomar2000-bit/CLAUDE-CODE-THINGS-TO-DO`, rama **`naranjito-lab`** (commit `7f48a95` y siguientes). No está fusionada en `main`; PR pendiente: https://github.com/brandonomar2000-bit/CLAUDE-CODE-THINGS-TO-DO/pull/new/naranjito-lab
- **Demo publicada (Artifact):** https://claude.ai/artifact/QEmrAhkopZQUM1qAodtFVC, compartida como «cualquiera con el link». Para actualizarla, publica con `url` = ese link.
- **Código fuente:** `src/`. `bash src/build.sh` une todo en `index.html`.
  - `body.html`: secciones y markup
  - `style.css`: tokens por mundo (`.w-*`) y estilos
  - `app.js`: Naranjito, fondos vivos, tour/dock, inventario, prototipos de las áreas I a IV, Jam, glosario y easter eggs. Expone `window.__lab`.
  - `gallery.js`: museo con 23 obras, salas de mármol y madera, luces de riel con temperatura de color
  - `render.js`: 4 escenas WebGL (agua, tierra, fuego, aire), simulación de fluidos del fuego (`SIM`), explosión y apagón (`FX`) y sonido (`SND`)
  - `arch.js`: estudio 3D con three.js r147 (showroom y villa con yate, auto glTF)
- **Modelo del auto:** `assets/car.glb` (Car Concept, CC BY 4.0, Eric Chadwick / Khronos; ver créditos en el README). En el Artifact va como `assets/car.js` (gzip + base64), porque el Artifact no sirve `.glb`. `arch.js` intenta primero el `.glb` y, si falla, la versión `.js`.
- **Referencias del usuario:** `docs/referencias/`
  - Porsche Paint to Sample: inspiración del módulo siguiente
  - unicornio de peluche «subagente de Meta», el personaje del usuario
  - lobby de ónix: referencia del showroom

## Decisiones de arquitectura (no revertir sin preguntar)
1. **Un solo HTML sin frameworks**, armado desde `src/` por partes. Cada módulo es un IIFE aislado. Si un módulo falla, los demás siguen funcionando.
2. **Mundos por sección.** Cada `<section class="world w-xxx">` define sus tokens (`--paper --card --ink --ink2 --rule --art1..3 --on1`). Al pasar por cada sección, el body copia su clase, y así la barra y el dock cambian de color.
3. **Un solo `requestAnimationFrame`** (`addTask` en `app.js`) que renderiza solo lo visible (IntersectionObserver). `render.js` y `arch.js` tienen su propio bucle, también condicionado a visibilidad.
4. **Fondos vivos** con `bg(sec, init, mode)`: un canvas `sticky` por sección que reacciona a scroll (`S.p`), puntero y toques.
5. **Naranjito:** SVG pixelado, sombreros intercambiables (`HATS`) y ojos en X para desmayarse (`.faint`). `makeMascot(host,id,own)`: con `own=true` la mascota no sigue el sombrero global (la del museo usa `hatOn`).
6. **WebGL de las escenas:** un contexto y un programa por escena. Los uniforms que una escena no tiene se ignoran (location null). Resolución adaptativa por FPS (Papa / Auto / 5090).
7. **Fuego:** stable fluids 2D en texturas half-float de 128 × 256, renderizado como lámina orientada a la cámara con caída en profundidad. Si no hay texturas flotantes, usa la flama procedural.
8. **three.js r147 en UMD**, por carga diferida desde jsDelivr solo cerca de `#arquitectura`, porque r147 es la última versión con `examples/js`. No migrar a módulos ES sin probar la CSP del Artifact.
9. **Lo que permite el Artifact:** scripts solo de cdnjs, jsDelivr, unpkg, Tailwind y jQuery; nada de fetch externo; sin `alert`, `print` ni descargas; audio solo después de un gesto del usuario.
10. **Honestidad en pantalla:** simulaciones marcadas como ilustrativas, partidos ficticios, Naranjito como homenaje de fan no oficial, créditos CC-BY visibles.

## Estado actual
- Todo publicado y en la rama.
- Pruebas de Playwright con SwiftShader: 0 errores, sin desborde en 1440 y en 390 px.
- **No probado en una GPU real:** la fluidez del fuego, las sombras de three.js y los FPS.
- Las pruebas usan un servidor local (`python3 -m http.server`), porque `file://` bloquea cargar el `.glb`. Hay que desviar los pedidos de jsDelivr a una copia local en `vendor/` (no está en el repo).

## Siguientes pasos pendientes
1. **Módulo final: «Laboratorio de pesos», galería de discos de acetato (lo pidió el usuario).**
   - Ubicación: después del Museo y antes del Glosario.
   - Inspiración: Porsche Paint to Sample (`docs/referencias/ref-porsche-paint-to-sample.jpg`):
     - una tarjeta grande inclinada encima, que cambia al elegir otro disco
     - texto enorme detrás
     - un selector de colorimetría que retiñe toda la escena
   - Cada **disco** es un «modelo» con su mascota simbólica en la etiqueta y un color propio. **No usar logos ni marcas oficiales;** solo símbolos genéricos. Propuesta:
     - Naranjito (Claude)
     - un cubo de colores de cuatro puntas (Gemini/Google)
     - un nudo hexagonal (GPT)
     - una ballena (DeepSeek)
     - un viejo sabio con lentes (Grok)
     - un infinito azul (Meta)
     - el **unicornio de peluche del usuario** como «subagente chambeando»: usar su imagen de `docs/referencias/`, que es del usuario
   - Al poner el disco en la tornamesa, gira y la aguja recorre los surcos. Los surcos son **capas de una red neuronal**: neuronas que se encienden y una animación educativa de **forward pass → pérdida → backpropagation**, con los gradientes regresando en otro color.
   - **Escena de subagentes:** un orquestador reparte subtareas a 3 o 4 subagentes (las mascotas) que trabajan en paralelo y regresan resultados.
   - Todo marcado como modelo simbólico y educativo, no como la arquitectura real de ninguna empresa.
   - Reutilizar: `bg()`, `.win`, `.ficha`, `rx-tabs`, la mascota (sombrero `mago`) y `SND` para un crujido de vinil.
2. Abrir el PR de `naranjito-lab` a `main` y activar GitHub Pages (Settings → Pages → `main` / root).
3. Probar en GPU real (laptop y celular) y ajustar los parámetros del fuego en `render.js`: `SIM.step`, `cool`, `eps` y `buoy`.
4. Opcional: comprimir `car.glb` con `gltf-transform` (quantize/meshopt) cuando se permita `npx`; hoy pesa 11.8 MB.

## Cómo trabajar aquí
- Usa la skill del proyecto `.claude/skills/prototipos-interactivos/`, que tiene el método y los patrones de todos los módulos.
- Los hooks de `.claude/settings.json` guardan cada sesión como Markdown en `.claude/logs/`.
