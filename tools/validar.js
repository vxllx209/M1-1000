/* =============================================================
   VALIDADOR — corre con: node tools/validar.js
   Revisa data/questions.js (y los data/*.js que carga) en busca
   de errores estructurales antes de que lleguen al navegador.
   ============================================================= */

const fs = require("fs");
const path = require("path");

const RAIZ = path.join(__dirname, "..");
const AREAS_VALIDAS = ["Números", "Álgebra y funciones", "Geometría", "Probabilidad y estadística"];
const DIFICULTADES_VALIDAS = ["baja", "media", "alta"];
const LETRAS = ["A", "B", "C", "D"];

function cargarBanco() {
  // Ejecuta los archivos de datos en un contexto aislado con un `window` falso,
  // igual que hace index.html al cargarlos como <script> en orden.
  const global_ = { BANCO_PREGUNTAS: null };
  const contextoWindow = {};
  global_.window = contextoWindow;

  const archivosData = fs
    .readdirSync(path.join(RAIZ, "data"))
    .filter((f) => f.endsWith(".js"))
    .sort((a, b) => (a === "questions.js" ? 1 : b === "questions.js" ? -1 : a.localeCompare(b)));

  archivosData.forEach((archivo) => {
    const codigo = fs.readFileSync(path.join(RAIZ, "data", archivo), "utf8");
    const fn = new Function("window", codigo);
    fn(contextoWindow);
  });

  return { banco: contextoWindow.BANCO_PREGUNTAS, archivos: archivosData };
}

function validar(banco) {
  const errores = [];

  if (!Array.isArray(banco)) {
    return ["window.BANCO_PREGUNTAS no es un arreglo (o no quedó definido)."];
  }

  const idsVistos = new Map();

  banco.forEach((p, i) => {
    const ref = `[${i}] id=${p && p.id ? p.id : "(sin id)"}`;

    if (!p || typeof p !== "object") {
      errores.push(`${ref}: la pregunta no es un objeto.`);
      return;
    }

    if (!p.id || typeof p.id !== "string") {
      errores.push(`${ref}: falta "id" o no es texto.`);
    } else if (idsVistos.has(p.id)) {
      errores.push(`${ref}: id duplicado, ya usado en [${idsVistos.get(p.id)}].`);
    } else {
      idsVistos.set(p.id, i);
    }

    if (!AREAS_VALIDAS.includes(p.area)) {
      errores.push(`${ref}: area "${p.area}" inválida. Debe ser una de: ${AREAS_VALIDAS.join(", ")}.`);
    }

    if (!DIFICULTADES_VALIDAS.includes(p.dificultad)) {
      errores.push(`${ref}: dificultad "${p.dificultad}" inválida. Debe ser baja | media | alta.`);
    }

    if (!p.pregunta || typeof p.pregunta !== "string" || !p.pregunta.trim()) {
      errores.push(`${ref}: falta el enunciado ("pregunta").`);
    }

    if (!p.alternativas || typeof p.alternativas !== "object") {
      errores.push(`${ref}: falta "alternativas".`);
    } else {
      LETRAS.forEach((letra) => {
        const texto = p.alternativas[letra];
        if (texto === undefined || texto === null || (typeof texto === "string" && !texto.trim())) {
          errores.push(`${ref}: la alternativa ${letra} falta o está vacía.`);
        }
      });
    }

    if (!LETRAS.includes(p.correcta)) {
      errores.push(`${ref}: "correcta" (${p.correcta}) debe ser A, B, C o D.`);
    } else if (p.alternativas && (p.alternativas[p.correcta] === undefined || p.alternativas[p.correcta] === null)) {
      errores.push(`${ref}: "correcta" apunta a la alternativa ${p.correcta}, que no existe.`);
    }

    if (p.imagen) {
      const rutaImagen = path.join(RAIZ, p.imagen);
      if (!fs.existsSync(rutaImagen)) {
        errores.push(`${ref}: "imagen" apunta a un archivo que no existe: ${p.imagen}`);
      }
    }
  });

  return errores;
}

function main() {
  const { banco, archivos } = cargarBanco();
  console.log(`Archivos de datos cargados: ${archivos.join(", ")}`);
  console.log(`Total de preguntas: ${Array.isArray(banco) ? banco.length : 0}\n`);

  const errores = validar(banco);

  if (errores.length === 0) {
    console.log("Sin problemas. Todo OK.");
    process.exit(0);
  } else {
    console.log(`Se encontraron ${errores.length} problema(s):\n`);
    errores.forEach((e) => console.log(" - " + e));
    process.exit(1);
  }
}

main();
