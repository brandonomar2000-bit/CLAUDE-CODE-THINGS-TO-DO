---
name: prototipos-interactivos
description: Método para construir demos y prototipos interactivos en HTML (web o app) que no parezcan plantilla, con mundos visuales por sección, simulaciones reales, render en tiempo real, guía con mascota y kit para talleres. Úsala cuando alguien pida una demo, un prototipo, una landing interactiva, un explicador, un simulador educativo o un módulo nuevo para Naranjito Lab.
---

# Prototipos interactivos que enamoran

Esta skill destila cómo se construyó Naranjito Lab. Los patrones con código están en `referencia.md`, en esta misma carpeta. Léela antes de escribir un módulo.

## 1. Antes de escribir código
1. **Una frase por módulo:** qué debe poder **hacer** la persona, no qué va a leer.
2. **Dato real del tema:** unidades, fórmulas, nombres propios, fechas. Si inventas un ejemplo, márcalo como ejemplo en la propia pieza.
3. **Referencia visual:** si el usuario manda capturas, extrae el lenguaje concreto (cápsulas, tipografía, qué se mueve con el scroll). Toma el oficio, no la marca: nada de logos ni mascotas oficiales de otras empresas.
4. **Elige el motor correcto:**
   - Canvas 2D para fondos y gráficas
   - shaders de WebGL para render «realista»
   - three.js para 3D de objetos con materiales (autos, casas)
   - Web Audio para sonido, siempre sintetizado y después de un gesto del usuario

## 2. Estructura que funciona
- **Mundos por sección:** cada sección define sus tokens de color; la barra y la guía heredan el mundo activo.
- **Ventana de prototipo** (`.win`): barra estilo «programa.exe», botón «?» que muestra el prompt que arma el prototipo, y botón para minimizar.
- **Ficha editorial** (`.ficha`): folio en mono, frase grande en serif itálica, texto y nota de la mascota.
- **Abre en un estado útil:** nada espera un clic para existir.
- **Guía con mascota:** dock fijo con paradas; la mascota cambia de sombrero por sección y tiene easter eggs (Konami, `sudo`).

## 3. Lo que más impresiona (y cómo)
- Simulaciones con física real: RK4, SIR, D'Hondt o Gallagher, Axelrod, Fourier.
- Render por trazado de rayos: océano con dispersión, voxeles por DDA, nubes volumétricas.
- Fluidos en GPU (stable fluids) para fuego o humo, con eventos dramáticos como explosión y apagón.
- Galería con scroll horizontal fijo: el año avanza, hay materiales procedurales por sala y luces de riel con temperatura de color en Kelvin.
- Estudio 3D con three.js: auto glTF con licencia abierta, variantes de pintura, hora del día, corte de sección y vista de alambre.

## 4. Reglas de oficio
- Un solo `requestAnimationFrame`; se dibuja solo lo que se ve (IntersectionObserver).
- Resolución adaptativa por FPS, con modos de calidad visibles para la persona.
- Respeta `prefers-reduced-motion`: sin destellos ni sacudidas y con animación mínima.
- Nunca más de 2 destellos por segundo.
- Cargas pesadas de forma diferida, con barra de progreso y un error que no tumba la página.
- Teléfono: un solo carril, sin scroll horizontal, controles de al menos 44 px.
- Créditos y licencias visibles. Las mascotas de terceros solo como homenaje claro y no oficial.

## 5. Verificar antes de entregar
1. `new Function(src)` para revisar la sintaxis de cada script.
2. Playwright con SwiftShader (`--use-gl=angle --use-angle=swiftshader`) y servidor local. Desvía los CDN a copias locales con `page.route`.
3. Recorre todas las secciones en 1440 y en 390 px: 0 errores de consola y `scrollWidth === clientWidth`.
4. Hoja de contactos con las capturas; revísala una vez y corrige solo lo roto.
5. Di con claridad qué no se pudo probar: GPU real, audio, gestos.

## 6. Entrega
- Publica y conserva el mismo link en cada versión.
- Repo con `src/` por partes, `build.sh`, README visual con capturas y GIF, y un `HANDOFF.md` al cerrar.
