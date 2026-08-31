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

## Pendiente

- PAES Regular 2024 (Forma 113) — `data/regular2024.js` — **no iniciado**.
- PAES Regular 2025, selección de 45 preguntas (Forma 113) —
  `data/regular2025.js` — **no iniciado**.
- PAES Regular 2026, selección de 45 preguntas (Forma 113) —
  `data/regular2026.js` — **no iniciado**.
- PAES Invierno 2027 (Forma 111) — `data/invierno2027.js` — **no iniciado**.
