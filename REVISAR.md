# Preguntas para revisar

Ninguno de los 5 PDF de `pdfs/` trae la clave oficial de respuestas. Por eso
**todas** las preguntas del banco están marcadas con `revisar: true`: cada
`correcta` fue resuelta a mano por Claude, no tomada de una fuente oficial.

Esta lista no repite las ~285 preguntas una por una. Se enfoca en las que,
además de no tener clave oficial, tienen una razón adicional y específica
para desconfiar del resultado.

## PAES Invierno 2026 (Forma 111) — `data/invierno2026.js`

- **p03**: las alternativas son gráficas (círculos con distinta fracción
  sombreada), no texto. Transcribí una descripción de cada una en
  `alternativas`, pero la imagen es la fuente real — revisar que la
  descripción no induzca a error.
- **p07**: mismo caso, alternativas pictóricas (bandejas de huevos).
- **p38**: alternativas pictóricas (cuatro gráficos con quiebre de
  pendiente). Elegí la opción B por el quiebre en la hora 4 con pendiente
  creciente; conviene comparar visualmente con el PDF.
- **p45**: recorté el perímetro de la figura contando manualmente los 18
  lados del borde (no los 29 que dice el procedimiento del enunciado).
  Verificar el conteo si algo no cuadra.
- **p50** — **la más incierta de toda la prueba**: pregunta sobre
  composición de reflexión + reflexión + rotación de una figura curva
  abstracta, comparada contra 4 alternativas muy parecidas entre sí.
  Intenté un análisis geométrico y de píxeles y no logré confianza alta.
  Marqué la opción B, pero es un candidato fuerte a estar mal. Revisar
  directamente contra la página 40 del PDF.
- **p55**: gráfico radial (araña) de 5 ejes sin valores numéricos impresos;
  los valores se leyeron estimando la posición de cada punto respecto a
  los anillos de la escala (0-100). Usé Flores=60, Árboles=80, Semillas=80,
  Tierra=20, Arbustos=100 (suma 340). La lectura de Semillas y Tierra es
  la menos segura.
- **p58**: gráfico de puntos (dot plot) con las edades de futbolistas de
  4 países; elegí Irán por inspección visual de la distribución, sin
  contar cada punto uno por uno. Vale la pena verificar contando los
  puntos exactos si el estudiante falla esta.

## PAES Regular 2026, selección de 45 preguntas (Forma 113) — `data/regular2026.js`

Igual que el resto: sin clave oficial, las 45 preguntas están marcadas `revisar: true`.
El folleto es una "selección de 45 preguntas" del examen completo, así que el número
de pregunta que trae el PDF salta (por ejemplo, va del 5 al 11); el campo `numero` de
cada pregunta no es el número original del PDF, sino su posición dentro de esta
selección (1 a 45), para que coincida con el orden en que aparecen en el folleto.

- **p32** (pregunta de la hoja doblada y recortada, `¿Cuál de las siguientes figuras
  se obtendrá al desdoblarse...?`): las cuatro alternativas son figuras, no texto.
  Transcribí una descripción de cada una; conviene comparar visualmente contra la
  página 26 del PDF si el estudiante falla esta.
- **p33** (transformaciones isométricas sobre una flecha): resuelto analíticamente
  siguiendo el ángulo de la flecha paso a paso; conviene verificar contra la figura.
- **p34** (vectores u y v): la dirección de la flecha de u (hacia dónde apunta la
  punta) es la parte más fácil de leer mal en el PDF; ya se verificó con un recorte
  ampliado, pero vale la pena confirmar contra la página 28 si algo no cuadra.

## Pendiente

Con Regular 2026 completo, las 5 pruebas del banco (Invierno 2026, Regular 2024,
Invierno 2027, Regular 2025 y Regular 2026) ya tienen todas sus preguntas cargadas.
No queda ninguna prueba sin iniciar. Lo que sigue pendiente es la revisión manual
contra los PDF originales de las respuestas marcadas `revisar: true` — especialmente
los casos puntuales listados arriba — ya que ninguna trae clave oficial.
