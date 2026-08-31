/* =============================================================
   BANCO DE PREGUNTAS — M1 1000
   -------------------------------------------------------------
   Este archivo no contiene preguntas propias: junta los bancos de
   cada prueba (cada uno en su propio data/*.js) en un solo arreglo
   que usa el resto de la aplicación.

   Para agregar una prueba nueva:
     1. Crea data/nombre-prueba.js con window.BANCO_ALGO = [ ... ]
     2. Agrega su <script> en index.html, antes que este archivo.
     3. Súmalo al concat() de más abajo.
   ============================================================= */

window.BANCO_PREGUNTAS = [].concat(
  window.BANCO_INVIERNO_2026 || [],
  window.BANCO_REGULAR_2024 || [],
  window.BANCO_INVIERNO_2027 || [],
  window.BANCO_REGULAR_2025 || [],
  window.BANCO_REGULAR_2026 || []
);
