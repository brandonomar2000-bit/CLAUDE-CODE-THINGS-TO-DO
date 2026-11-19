<div align="center">

<img src="docs/img/hero.jpg" alt="Portada de Naranjito Lab: «Tú traes la idea. Yo armo el prototipo», con Naranjito, el robotcito naranja pixelado, frente a un poliedro de colores" width="100%">

# Naranjito Lab

**Una demo interactiva para colectivos y grupos de estudiantes que quieren entrarle a la IA y todavía no saben qué es Codex ni qué se arma en un Jam.**

Ocho prototipos que funcionan · cuatro escenas renderizadas en vivo · un museo de 24 siglos · cero líneas que tengas que escribir

`HTML` · `CSS` · `JavaScript` · `Canvas 2D` · `WebGL` · `Web Audio` · sin frameworks, sin servidor

</div>

---

## Sobre este repo

> VISUAL THINGS AND DYNAMIC TOUR LANDSCAPE ABOUT ALL THE NEWS THAT BRINGS TO YOU CLAUDE CODE; EXPLAIN FOR ALL THE TEAM MEMBERS WHAT THE AI LAB HAS NEW AND FEEL FREE TO INTEGRATE MORE DEVELOPMENT MODULES AND ARCHITECTURE OF YOUR CREATIVITY AND AUTHORSHIP

Naranjito Lab es el primer módulo de este laboratorio: una vuelta guiada por lo que hoy se puede construir con Claude Code. Cada módulo nuevo puede vivir en su propia sección de la página o en su propia carpeta.

## Qué es

Una sola página web, hecha en una sesión con [Claude Code](https://claude.com/claude-code), que sirve para dar una plática o correr un taller. Te guía **Naranjito**, un robotcito naranja de pixeles que cambia de sombrero según la sección. Explica qué hace un agente de IA, enseña prototipos reales de las cuatro áreas del conocimiento y trae todo lo necesario para correr un Jam de tres horas.

Cada fondo, gráfica, simulación y escena es código que se dibuja en tu navegador. No hay fotos ni video.

## Recorrido

### 1. ¿Chat, agente o qué?
Una terminal que se escribe sola muestra cómo un agente pasa de un pedido a un link publicado. Un control de autonomía va de *autocompletar* a *equipo de agentes*.

### 2. La tabla periódica de lo posible
<img src="docs/img/tabla.jpg" alt="Tabla periódica con 18 herramientas agrupadas en seis familias de colores" width="100%">

Dieciocho cosas que se pueden hacer con un agente, en seis familias. Cada una trae qué es, un prompt para copiar y lo que entrega.

### 3. Las cuatro áreas del conocimiento

| Área | Prototipos que funcionan |
|---|---|
| **I · Físico-Matemáticas e Ingenierías** | Péndulo doble caótico integrado con RK4 · Dibujo reconstruido con epiciclos de Fourier |
| **II · Biológicas, Químicas y de la Salud** | Modelo epidémico SIR con vacunación · Traductor de ADN a proteína con mutaciones |
| **III · Ciencias Sociales** | D'Hondt, Sainte-Laguë y Hare con hemiciclo, coaliciones e índice de Gallagher · Torneo de Axelrod del dilema del prisionero |
| **IV · Humanidades y Artes** | Caja de ritmos pentatónica con Web Audio · Ley de Zipf aplicada a Cervantes y Sor Juana |

<img src="docs/img/area1.jpg" alt="Ventanas del Área I: péndulo doble y epiciclos de Fourier" width="49%"> <img src="docs/img/area3.jpg" alt="Ventana del Área III: simulador de sistemas electorales con hemiciclo" width="49%">

Cada ventana tiene un botón **«?»** que enseña el prompt que la arma, y cada área trae seis ideas más para un Jam, con su prompt listo para copiar.

### 4. Agua, tierra, fuego y aire: render en tiempo real

<img src="docs/img/render-agua.jpg" alt="Océano con reflejos del sol" width="49%"> <img src="docs/img/render-tierra.jpg" alt="Mundo de bloques con lago, pasto y nieve" width="49%">
<img src="docs/img/render-fuego.jpg" alt="Fogata volumétrica sobre troncos" width="49%"> <img src="docs/img/render-aire.jpg" alt="Mar de nubes volumétricas al atardecer" width="49%">

Cuatro shaders de WebGL que tu tarjeta gráfica calcula rayo por rayo:

| Escena | Cómo se modela |
|---|---|
| **Agua** | Suma de 9 ondas con la relación de dispersión ω = √(g·k), reflejo de Fresnel y espuma en las crestas |
| **Tierra** | Mundo de bloques recorrido con el algoritmo DDA de Amanatides y Woo, sombras con un segundo rayo y oclusión ambiental |
| **Fuego** | Volumen de ruido fractal con emisión de cuerpo negro, luz parpadeante y chispas |
| **Aire** | Nubes volumétricas con atenuación de Beer-Lambert y dispersión de Henyey-Greenstein |

Arrastras para mirar alrededor, mueves el sol y eliges la calidad: **Modo papa**, **Auto** o **5090 en max**. Un contador de FPS te dice cuánto aguanta tu equipo.

> Las capturas se tomaron con un navegador sin tarjeta gráfica. En una GPU real se ven igual y se mueven con fluidez.

### 5. Kit para el Jam
<img src="docs/img/jam.jpg" alt="Armador de prompts: formulario a la izquierda y prompt generado a la derecha" width="100%">

- Un programa de tres horas, bloque por bloque
- Un armador que convierte «hazme una página de X» en un brief completo
- Una ruleta de retos
- Un cronómetro de sprint de 10 minutos

### 6. Museo de la máquina que piensa

<img src="docs/img/museo.gif" alt="Recorrido animado por el museo: el año avanza de 350 a.C. a 2024 mientras Naranjito entra a cada cuadro" width="100%">

Una línea del tiempo que avanza mientras bajas. El año corre en una placa de pared y Naranjito camina por la sala, se mete a cada cuadro a jugar con la obra, se pone lentes industriales en la Revolución industrial y **se desmaya frente a la computadora cuántica**.

- **Salas con paredes de verdad.** Diez materiales generados en la tarjeta gráfica con ruido fractal y deformación de dominio: mármol de Carrara con vetas de oro, travertino, nogal, tablones, Bardiglio, Verde Alpi, Nero Marquina, Breccia rosa, Rosso Alicante y Giallo Siena. Cada sala tiene su moldura y el piso es de duela de madera.
- **Luces de riel.** Cada cuadro tiene su lámpara, que se balancea con la inercia del scroll. Mientras te quedas frente a una obra, la luz recorre la temperatura de color de fría (6500 K) a neutra, amarilla, ámbar y cálida (2700 K). La placa muestra los Kelvin en vivo.

<img src="docs/img/museo-carrara.jpg" alt="Sala de mármol de Carrara con vetas de oro, riel de luces y el silogismo de Aristóteles" width="49%"> <img src="docs/img/museo-eliza.jpg" alt="Sala de Nero Marquina con ELIZA iluminada con luz amarilla" width="49%">

| Año | Obra | Año | Obra |
|---|---|---|---|
| c. 350 a.C. | Aristóteles · El silogismo | 1958 | Frank Rosenblatt · El perceptrón |
| 1305 | Ramon Llull · Ars Magna | 1966 | Joseph Weizenbaum · ELIZA |
| 1687 | Isaac Newton · El cálculo | 1968 | Kubrick y Clarke · *2001: Odisea del espacio* |
| 1703 | Gottfried W. Leibniz · Aritmética binaria | 1973 | Harold Cohen · AARON |
| 1837 | Charles Babbage · La Máquina Analítica | 1989 | Yann LeCun · Redes convolucionales |
| 1843 | Ada Lovelace · Nota G | 1989–2009 | John L. Pollock · OSCAR |
| 1854 | George Boole · Las leyes del pensamiento | 1995 | David Chalmers · El problema difícil |
| 1890 | Herman Hollerith · La tabuladora | 2017 | Vaswani y equipo · El Transformer |
| 1936 | Alan Turing · La máquina de Turing | 2023 | Anthropic · Claude y Claude Code |
| 1943 | McCulloch y Pitts · La neurona artificial | 2019–2024 | La computadora cuántica |
| 1948 | Claude Shannon · Teoría de la información | | |
| 1950 | Alan Turing · El juego de la imitación | | |
| 1956 | El taller de Dartmouth | | |

<img src="docs/img/museo-hollerith.jpg" alt="Naranjito con lentes industriales dentro de la tarjeta perforada de Hollerith" width="49%"> <img src="docs/img/museo-cuantica.jpg" alt="Naranjito desmayado con ojos en X frente a la computadora cuántica" width="49%">

### 7. Glosario sin pena
Doce tarjetas que se voltean: Prompt, Agente, Codex, Claude Code, Artifact, Repositorio, Token, Contexto, Alucinación, Conector (MCP), Subagente y API.

### Secretos
- Prueba el código Konami: <kbd>↑</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd><kbd>←</kbd><kbd>→</kbd><kbd>B</kbd><kbd>A</kbd>
- Escribe `sudo` en cualquier parte
- Al final de la página hay una pastilla roja y una azul

## Cómo abrirlo

**Opción rápida:** descarga el repo y abre `index.html` en Chrome, Edge o Firefox. No necesita instalar nada.

**En línea con GitHub Pages:** en el repo, entra a **Settings → Pages**, elige la rama `main` y la carpeta `/ (root)`, y guarda. En un par de minutos queda en `https://<tu-usuario>.github.io/<nombre-del-repo>/`.

## Cómo editarlo

El código vive en `src/`, dividido por partes. `index.html` se genera uniéndolas:

```bash
bash src/build.sh
```

```
naranjito-lab/
├── index.html        ← la página completa, generada
├── src/
│   ├── body.html     ← el contenido y las secciones
│   ├── style.css     ← tokens de color por sección y estilos
│   ├── app.js        ← Naranjito, fondos vivos, prototipos, Jam, glosario, tour
│   ├── gallery.js    ← el museo: 23 obras generativas y la línea del tiempo
│   ├── render.js     ← los cuatro shaders de WebGL
│   └── build.sh
└── docs/img/         ← capturas de este README
```

## Créditos y avisos

- Hecho con **Claude Code** como demostración de lo que un agente puede construir en una sesión.
- **Naranjito es un homenaje de fan** al bichito pixelado que te saluda al abrir Claude Code. Este proyecto **no es oficial ni está afiliado a Anthropic**.
- Las obras, las paredes y las luces del museo son código que dibuja el navegador, no fotos ni reproducciones. Los textos de Cervantes y Sor Juana son de dominio público.
- Los partidos del simulador electoral son ficticios. Los modelos (SIR, ADN, render) son ilustrativos: no sustituyen datos oficiales, diagnósticos ni asesoría.
- Tipografías de Google Fonts: Unbounded, Geist, Geist Mono e Instrument Serif.
