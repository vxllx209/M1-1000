# M1 1000

Práctica diaria para la PAES de Competencia Matemática 1.
Cinco preguntas al día, dos minutos cada una.

---

## Cómo abrirla

Abre `index.html` con doble clic. No necesita servidor ni instalación.

Si usas VS Code, la extensión **Live Server** es cómoda para recargar
mientras editas, pero no es obligatoria.

El progreso se guarda en el navegador (LocalStorage). Es decir: se
mantiene entre sesiones en el mismo computador y el mismo navegador,
pero no se sincroniza entre dispositivos. Para eso hace falta un backend,
que viene después.

---

## Cómo agregar las preguntas reales

Todas las preguntas viven en un solo archivo: **`data/questions.js`**.
No hay que tocar ningún otro archivo para agregar una prueba nueva.

Borra las 14 preguntas de ejemplo y pega las tuyas siguiendo esta forma:

```js
{
  id: "inv2026-m1-f111-p01",
  prueba: "PAES Invierno 2026",
  anio: 2026,
  aplicacion: "Invierno",
  forma: "111",
  numero: 1,
  area: "Números",
  subtema: "Porcentajes",
  dificultad: "media",
  pregunta: "Enunciado de la pregunta...",
  imagen: null,
  imagenAlt: null,
  alternativas: { A: "...", B: "...", C: "...", D: "..." },
  correcta: "D",
  explicacion: "Resolución paso a paso..."
}
```

Reglas que conviene respetar:

- **`id` único y estable.** Si cambias el id de una pregunta ya
  respondida, el sistema la tratará como nueva y perderás su historial
  de repaso. Formato sugerido: `inv2026-m1-f111-p01`.
- **`area`** debe escribirse siempre igual, porque agrupa las
  estadísticas. Usa exactamente: `Números`, `Álgebra y funciones`,
  `Geometría`, `Probabilidad y estadística`.
- **`dificultad`** acepta `baja`, `media` o `alta`. Afecta el puntaje.
- **`correcta`** es la letra, en mayúscula.
- Los saltos de línea dentro de un texto se escriben `\n`.

### Preguntas con gráficos, tablas o figuras

Recorta la imagen del PDF, guárdala en `assets/images/` y apunta a ella:

```js
imagen: "assets/images/inv2026-m1-f111-p23.png",
imagenAlt: "Gráfico de barras con las ventas de cuatro meses",
```

Usa el mismo nombre que el `id` de la pregunta. Así, cuando algo se vea
mal, sabes de inmediato qué archivo revisar. El campo `imagenAlt`
describe la figura para quien use lector de pantalla; si no lo llenas,
la app pone un texto genérico.

Las tablas también conviene guardarlas como imagen en esta primera
versión. Reconstruirlas en HTML es más prolijo, pero mucho más lento de
cargar.

---

## Cómo funciona por dentro

| Archivo | De qué se encarga |
|---|---|
| `data/questions.js` | Junta los bancos de cada prueba (`data/*.js`) en uno solo. |
| `js/perfiles.js` | Perfiles locales: quién eres, sin contraseña ni backend. |
| `js/progress.js` | LocalStorage (por perfil), repetición espaciada, puntaje, racha, logros. |
| `js/questions.js` | Decide qué preguntas tocan hoy, o filtradas por área. |
| `js/timer.js` | El temporizador de dos minutos. |
| `js/iconos.js` | Set propio de iconos en línea (estilo Lucide), sin depender de internet. |
| `js/fondo.js` | Dibuja la animación de símbolos matemáticos de fondo en `<canvas>`. |
| `js/app.js` | Las pantallas y la interacción. |

### Perfiles

No hay cuentas ni contraseñas: al abrir la app por primera vez eliges o
escribes un nombre, y desde ahí todo tu progreso (respuestas, racha,
puntaje, logros) se guarda bajo ese nombre en el `localStorage` de ese
mismo navegador. Para cambiar de perfil, toca el nombre junto a
"M1 • 1000" en la barra superior. Como no sincroniza entre dispositivos
ni navegadores, dos personas que usan el mismo computador pueden tener
cada una su propio progreso, pero no sirve para seguir tu progreso desde
el celular y el computador a la vez.

### Práctica por tema

Desde el inicio, la tarjeta "Practicar por tema" arma una sesión de 5
preguntas de una sola área (Números, Álgebra y funciones, Geometría o
Probabilidad y estadística). Esas respuestas se guardan igual que
cualquier otra (repetición espaciada, estadísticas, puntaje), pero no
cuentan para la meta diaria de 5 preguntas, que se sigue armando al
azar entre todo el banco.

### Repetición espaciada

Cada pregunta tiene un nivel del 0 al 5. Acertar la sube un nivel,
fallar la devuelve al 0. El nivel determina cuántos días pasan hasta
que vuelve a aparecer:

| Nivel | 0 | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|---|
| Días | hoy | 1 | 3 | 7 | 15 | 30 |

Para cambiar el ritmo, edita `INTERVALOS` al inicio de `progress.js`.

Cada sesión trae como máximo 2 preguntas de repaso, para que estudiar no
se convierta en repetir siempre los mismos errores. Ese tope está en
`MAX_REPASOS_POR_SESION`, en `questions.js`.

### El puntaje

El puntaje es el promedio de tus últimas 40 respuestas llevado a la
escala 100–1000, con un ajuste por dificultad y un premio pequeño si
respondes en menos de 60 segundos.

Lo importante: **sube y baja**. No es un contador de preguntas
acumuladas, sino una foto de cómo estás rindiendo ahora. Aparece recién
después de 8 respuestas.

Es un número interno de práctica, no una conversión oficial del DEMRE.
Cuando tengas datos reales de cómo se relaciona tu porcentaje de
aciertos con tu puntaje efectivo, ajusta la función `puntaje()` en
`progress.js`.

### La racha

Se cuenta un día cuando cumples la meta de 5 preguntas. Si dejas pasar
un día completo sin cumplirla, vuelve a cero.

---

## Qué falta

Las 5 pruebas (Invierno 2026, Regular 2024, Invierno 2027, Regular 2025 y
Regular 2026) ya están cargadas completas. Por orden de utilidad, lo que
sigue pendiente:

1. Revisar contra los PDF originales las respuestas marcadas `revisar: true`
   (ver `REVISAR.md`), ya que ninguna prueba trae clave oficial.
2. Cuentas de usuario y base de datos, para conservar el progreso entre
   dispositivos.
3. Ajustar la fórmula del puntaje con datos reales.
