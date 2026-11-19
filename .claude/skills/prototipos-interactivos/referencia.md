# Referencia de patrones · Naranjito Lab

Cada patrón apunta al archivo de `src/` donde vive la versión completa.

## Base de la página (`style.css`, `app.js`)
- **Tokens por mundo:** `.w-x{--paper;--card;--ink;--ink2;--rule;--art1;--art2;--art3;--on1}`. El body copia la clase del mundo activo con un IntersectionObserver de `rootMargin:'-45% 0px -54% 0px'`.
- **Bucle único:** `addTask(el, fn, {anim})` registra una tarea; el IntersectionObserver marca `vis`; con movimiento reducido solo se dibuja si `dirty`.
- **Fondo vivo:** `bg(section, init, mode)` crea un canvas `position:sticky; height:100vh` dentro de `.bgwrap` absoluto. `init(S)` devuelve `draw(t)`. El estado `S` tiene `p` (progreso de scroll), `mx`/`my` (puntero), `taps`, `w`, `h` y `k` (tokens). Motivos usados: poliedro low-poly con sombreado, lluvia de caracteres, campo eléctrico, células, red de actores que se polariza, trama riso que reacciona al audio.
- **Ventana `.win`:** botón `?` con un overlay de prompt copiable (`copy()` con plan B en un modal si el portapapeles falla).
- **Tickets de ideas:** máscara con `radial-gradient` para la perforación y talón vertical «Copiar».
- **Tabla periódica de herramientas:** grid de elementos con símbolo, familia de color y panel de detalle.

## Mascota (`app.js`)
- SVG pixelado con extrusión falsa en 3D (caras de arriba y del lado), ojos que siguen el puntero en pasos enteros, parpadeo con `scaleY`.
- `HATS{}`: grupos SVG anclados en `translate(114 74)`. `hatOn(M,h)` hace un pop con `cubic-bezier(.3,1.7,.5,1)`.
- `.faint`: rotar −92°, ojos en X y estrellas en órbita.

## Simulaciones (`app.js`)
- Péndulo doble con RK4 a 240 Hz, dos copias con diferencia de 10⁻ⁿ rad.
- Fourier: remuestreo por longitud de arco, DFT ordenada por amplitud, epiciclos.
- SIR con Euler (dt 0.1), cuadrícula de 200 personas por día.
- ADN a proteína: tabla `TCAG` de 64 codones con índice 16·i+4·j+k; mutación clasificada en silenciosa, de sentido erróneo o sin sentido.
- Fórmulas electorales (D'Hondt, Sainte-Laguë y Hare con resto mayor), índice de Gallagher y hemiciclo con escaños proporcionales al radio de cada fila.
- Torneo de Axelrod con semilla reproducible (mulberry32), ruido y modo de juego contra un rival oculto.
- Secuenciador con planificador de anticipación (setInterval de 25 ms y ventana de 0.12 s) y un analizador que alimenta el fondo.

## Render WebGL (`render.js`)
- HEAD común: ruido 2D/3D, fbm, `sky()` con atardecer, noche y estrellas, tonemap ACES, viñeta y grano.
- Agua: suma de ondas con ω = √(gk), heightfield + bisección, Fresnel.
- Tierra: DDA de voxeles, rayo de sombra, AO con 4 vecinos, agua con absorción por canal.
- Aire: nubes volumétricas con Beer-Lambert, marcha de luz de 5 pasos y fase HG doble.
- Fuego: stable fluids 2D (advección, curl, vorticidad, flotación, divergencia, 20 iteraciones de Jacobi, gradiente) en texturas half-float, render como lámina orientada a la cámara. `FX` gestiona la explosión por fases: faroles con esquirlas, apagón y restauración. `SND` sintetiza explosión, cristal y crepitar.
- Calidad: `QM{papa,auto,max}`, escala adaptativa por EMA de ms por cuadro.

## Museo (`gallery.js`)
- Sección alta con un contenedor `sticky` de 100vh; la pista avanza con `translateX(-p·xmax)`; el año se interpola entre obras.
- Arte por obra en canvas 2D, homenaje a un movimiento artístico distinto en cada una.
- Paredes procedurales en GPU (mármol con domain warp, madera, travertino), molduras entre salas y piso de duela.
- Luces de riel: péndulo amortiguado con la velocidad del scroll; temperatura de color en Kelvin (algoritmo de Tanner Helland) que cambia mientras la persona se queda frente a una obra.

## Estudio 3D (`arch.js`)
- three.js r147 UMD por carga diferida, ACESFilmic, sRGB, sombras PCFSoft y `localClippingEnabled`.
- Texturas en canvas: ónix de bandas, mármol en losas, nogal, travertino y normales de agua repetibles.
- Variantes de `KHR_materials_variants` con `parser.getDependency` y `assignFinalMaterial`.
- Si el host no sirve `.glb`: gzip + base64 en un `.js` y `DecompressionStream` en el navegador.
- PMREM generado desde el cielo al mover la hora; `overrideMaterial` en alambre para la vista de plano.

## Pruebas
- `test.js`: recorre todas las secciones en 1440 y 390 px, hace clics y Konami, y revisa el desborde.
- `fire2.js` y `arq.js`: secuencias guionizadas con `page.route` a `vendor/` y servidor local.
