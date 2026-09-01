/* =============================================================
   FONDO — animación matemática de fondo.
   -------------------------------------------------------------
   Reemplaza la hoja cuadriculada estática por símbolos, fórmulas
   reales y frases de matemáticos famosos flotando muy lento
   detrás de las tarjetas. Sigue siendo discreto (opacidad baja,
   movimiento lento), pero más presente que un simple patrón:
   la idea es que se puedan leer si uno se detiene a mirar.
   No interactúa con el resto de la app: solo dibuja.
   ============================================================= */

(function () {

  const canvas = document.getElementById("fondo-matematico");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  const SIMBOLOS = ["∑", "π", "√", "∞", "±", "Δ", "×", "÷", "=", "∫", "%", "θ", "∝"];

  /* Fórmulas reales, no solo símbolos sueltos. Unicode simple
     (sin diacríticos combinados) para que se vean bien en
     cualquier fuente monoespaciada del sistema. */
  const FORMULAS = [
    "σ = √( Σ(x - μ)² / N )",
    "x = (-b ± √(b² - 4ac)) / 2a",
    "a² + b² = c²",
    "A = π r²",
    "y = mx + b",
    "P(A) = casos favorables / casos posibles",
    "e^(iπ) + 1 = 0",
    "V = (4/3) π r³",
    "Sn = n (a1 + an) / 2"
  ];

  /* Frases de matemáticos, pensadas para motivar el camino a
     los 1000 puntos, no solo para decorar. */
  const FRASES = [
    { texto: "La matemática es la reina de las ciencias.", autor: "Gauss" },
    { texto: "Todo es número.", autor: "Pitágoras" },
    { texto: "La matemática es la ciencia del orden y la medida.", autor: "Descartes" },
    { texto: "La esencia de las matemáticas radica en su libertad.", autor: "Cantor" },
    { texto: "Es imposible ser matemático sin tener alma de poeta.", autor: "Kovalévskaya" },
    { texto: "Un matemático es una máquina que convierte café en teoremas.", autor: "Erdős" },
    { texto: "Una ecuación no significa nada para mí, a menos que exprese un pensamiento de Dios.", autor: "Ramanujan" },
    { texto: "Las matemáticas son tan serias que conviene no perder ocasión de hacerlas más entretenidas.", autor: "Pascal" }
  ];

  const prefiereMenosMovimiento =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const MARGEN = 240;

  let particulas = [];
  let ancho = 0, alto = 0, dpr = 1;
  let colorTinta = "#56617A";
  let colorLapiz = "#2743E8";
  let colorRacha = "#E08700";
  let fondoBase = "#EEF1F6";
  let corriendo = false;
  let cuadro = null;

  function leerColores() {
    const estilos = getComputedStyle(document.documentElement);
    colorTinta = (estilos.getPropertyValue("--tinta") || colorTinta).trim();
    colorLapiz = (estilos.getPropertyValue("--lapiz") || colorLapiz).trim();
    colorRacha = (estilos.getPropertyValue("--racha") || colorRacha).trim();
    fondoBase = (estilos.getPropertyValue("--papel") || fondoBase).trim();
  }

  /* Parte un texto en líneas que quepan en maxWidth, usando la
     fuente ya asignada a ctx.font en ese momento. */
  function envolverTexto(texto, maxWidth) {
    const palabras = texto.split(" ");
    const lineas = [];
    let actual = "";
    palabras.forEach(function (palabra) {
      const prueba = actual ? actual + " " + palabra : palabra;
      if (actual && ctx.measureText(prueba).width > maxWidth) {
        lineas.push(actual);
        actual = palabra;
      } else {
        actual = prueba;
      }
    });
    if (actual) lineas.push(actual);
    return lineas;
  }

  function elegirTipo() {
    const r = Math.random();
    if (r < 0.45) return "simbolo";
    if (r < 0.80) return "formula";
    return "frase";
  }

  function crearParticula(w, h, yInicial) {
    const tipo = elegirTipo();
    const base = {
      tipo: tipo,
      x: Math.random() * w,
      y: yInicial === undefined ? Math.random() * h : yInicial,
      vx: (Math.random() - 0.5) * 0.06,
      vy: -0.05 - Math.random() * 0.10,
      fase: Math.random() * Math.PI * 2,
      frecuencia: 0.0006 + Math.random() * 0.0006,
      amplitud: 6 + Math.random() * 10
    };

    if (tipo === "simbolo") {
      return Object.assign(base, {
        simbolo: SIMBOLOS[Math.floor(Math.random() * SIMBOLOS.length)],
        tamaño: 22 + Math.random() * 36,
        color: Math.random() < 0.3 ? colorLapiz : colorTinta,
        opacidad: 0.14 + Math.random() * 0.12,
        altoAprox: 60
      });
    }

    if (tipo === "formula") {
      return Object.assign(base, {
        texto: FORMULAS[Math.floor(Math.random() * FORMULAS.length)],
        tamaño: 15 + Math.random() * 7,
        color: Math.random() < 0.55 ? colorLapiz : colorTinta,
        opacidad: 0.17 + Math.random() * 0.12,
        altoAprox: 60
      });
    }

    // frase
    const frase = FRASES[Math.floor(Math.random() * FRASES.length)];
    const tamaño = 13 + Math.random() * 3;
    const maxWidth = Math.min(300, Math.max(190, w * 0.42));
    ctx.font = "italic " + tamaño + "px 'IBM Plex Sans', system-ui, sans-serif";
    const lineas = envolverTexto("“" + frase.texto + "”", maxWidth);
    return Object.assign(base, {
      lineas: lineas,
      autor: frase.autor,
      tamaño: tamaño,
      color: colorRacha,
      opacidad: 0.13 + Math.random() * 0.08,
      altoAprox: (lineas.length + 1) * (tamaño + 5) + 20
    });
  }

  function poblar() {
    const cantidad = Math.max(12, Math.min(26, Math.round((ancho * alto) / 50000)));
    particulas = [];
    for (let i = 0; i < cantidad; i++) {
      particulas.push(crearParticula(ancho, alto));
    }
  }

  function ajustarTamaño() {
    ancho = window.innerWidth;
    alto = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);
    canvas.style.width = ancho + "px";
    canvas.style.height = alto + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    poblar();
  }

  function dibujarParticula(p, bamboleo) {
    const x = p.x + bamboleo;
    ctx.textBaseline = "middle";

    if (p.tipo === "simbolo") {
      ctx.globalAlpha = p.opacidad;
      ctx.fillStyle = p.color;
      ctx.font = p.tamaño + "px 'IBM Plex Mono', ui-monospace, monospace";
      ctx.fillText(p.simbolo, x, p.y);
      return;
    }

    if (p.tipo === "formula") {
      ctx.globalAlpha = p.opacidad;
      ctx.fillStyle = p.color;
      ctx.font = "italic " + p.tamaño + "px 'IBM Plex Mono', ui-monospace, monospace";
      ctx.fillText(p.texto, x, p.y);
      return;
    }

    // frase: varias líneas + autor
    ctx.fillStyle = p.color;
    ctx.font = "italic " + p.tamaño + "px 'IBM Plex Sans', system-ui, sans-serif";
    ctx.globalAlpha = p.opacidad;
    p.lineas.forEach(function (linea, i) {
      ctx.fillText(linea, x, p.y + i * (p.tamaño + 5));
    });
    ctx.font = (p.tamaño - 2) + "px 'IBM Plex Mono', ui-monospace, monospace";
    ctx.globalAlpha = p.opacidad * 0.8;
    ctx.fillText("— " + p.autor, x, p.y + p.lineas.length * (p.tamaño + 5));
  }

  function dibujar(marca) {
    ctx.clearRect(0, 0, ancho, alto);
    ctx.fillStyle = fondoBase;
    ctx.fillRect(0, 0, ancho, alto);

    particulas.forEach(function (p, indice) {
      if (!prefiereMenosMovimiento) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.y < -p.altoAprox) {
          particulas[indice] = crearParticula(ancho, alto, alto + 40);
          return;
        }
        if (p.x < -MARGEN) p.x = ancho + MARGEN;
        if (p.x > ancho + MARGEN) p.x = -MARGEN;
      }

      const bamboleo = prefiereMenosMovimiento ? 0 : Math.sin(marca * p.frecuencia + p.fase) * p.amplitud;

      ctx.save();
      dibujarParticula(particulas[indice], bamboleo);
      ctx.restore();
    });
  }

  function paso(marca) {
    dibujar(marca);
    if (!prefiereMenosMovimiento) {
      cuadro = requestAnimationFrame(paso);
    }
  }

  function iniciar() {
    if (corriendo) return;
    corriendo = true;
    leerColores();
    ajustarTamaño();
    if (prefiereMenosMovimiento) {
      dibujar(0);
    } else {
      cuadro = requestAnimationFrame(paso);
    }
  }

  function detener() {
    corriendo = false;
    if (cuadro) cancelAnimationFrame(cuadro);
    cuadro = null;
  }

  window.addEventListener("resize", function () {
    ajustarTamaño();
    if (!corriendo || prefiereMenosMovimiento) dibujar(0);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) detener();
    else iniciar();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }

})();
