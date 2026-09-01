/* =============================================================
   PROGRESO — guarda todo en LocalStorage
   -------------------------------------------------------------
   Aquí vive el estado del estudiante: qué preguntas respondió,
   cuándo le toca repasar cada una, su racha, su puntaje y sus
   logros. Ningún otro archivo escribe en LocalStorage.
   ============================================================= */

const Progreso = (function () {

  const PREFIJO_CLAVE = "m1-1000-v1";

  /* El progreso se guarda por perfil, para que varias personas puedan
     usar la app en el mismo navegador sin mezclar sus respuestas. */
  function clave() {
    return PREFIJO_CLAVE + "::" + (Perfiles.activo() || "_sin-perfil");
  }

  /* Cajas de repaso. El índice es el nivel y el valor son los días
     que pasan hasta que la pregunta vuelve a aparecer.
     Acertar sube un nivel. Fallar devuelve al nivel 0. */
  const INTERVALOS = [0, 1, 3, 7, 15, 30];

  /* Cuántas respuestas recientes pesan en el puntaje. */
  const VENTANA_PUNTAJE = 40;

  /* Mínimo de respuestas antes de mostrar un puntaje. */
  const MINIMO_PARA_PUNTAJE = 8;

  const META_DIARIA = 5;

  /* Cuánto vale acertar según la dificultad de la pregunta. */
  const PESO_DIFICULTAD = { baja: 0.85, media: 1.0, alta: 1.15 };

  const LOGROS = [
    { id: "primera",   icono: "award",      nombre: "Primera pregunta",  detalle: "Responder tu primera pregunta." },
    { id: "racha7",    icono: "flame",      nombre: "Racha de 7",         detalle: "Cumplir la meta siete días seguidos." },
    { id: "cien",      icono: "target",     nombre: "100 preguntas",      detalle: "Resolver 100 preguntas." },
    { id: "velocista", icono: "zap",        nombre: "Velocista",          detalle: "Acertar 10 preguntas en menos de 40 segundos." },
    { id: "precision", icono: "percent",    nombre: "Precisión",          detalle: "85% de aciertos en tus últimas 20 respuestas." },
    { id: "constante", icono: "book",       nombre: "Constante",          detalle: "Cumplir la meta diaria 10 veces." }
  ];

  let estado = null;

  /* ─────────────── fechas ─────────────── */

  function aTexto(fecha) {
    const y = fecha.getFullYear();
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const d = String(fecha.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function hoy() {
    return aTexto(new Date());
  }

  function aFecha(texto) {
    const [y, m, d] = texto.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function sumarDias(texto, dias) {
    const f = aFecha(texto);
    f.setDate(f.getDate() + dias);
    return aTexto(f);
  }

  function diasEntre(desde, hasta) {
    return Math.round((aFecha(hasta) - aFecha(desde)) / 86400000);
  }

  /* ─────────────── carga y guardado ─────────────── */

  function estadoInicial() {
    return {
      version: 1,
      preguntas: {},        // id → { nivel, proximo, correctas, incorrectas, ultima }
      historial: [],        // últimas respuestas, la más reciente al final
      meta: { fecha: hoy(), completadas: 0 },
      racha: { actual: 0, mejor: 0, ultima: null },
      diasCompletados: [],
      metasCumplidas: 0,
      logros: []
    };
  }

  function cargar() {
    try {
      const crudo = localStorage.getItem(clave());
      estado = crudo ? JSON.parse(crudo) : estadoInicial();
    } catch (e) {
      estado = estadoInicial();
    }

    // Campos que podrían faltar si el estado viene de una versión anterior.
    const base = estadoInicial();
    for (const campo in base) {
      if (estado[campo] === undefined) estado[campo] = base[campo];
    }

    // Nuevo día: la meta vuelve a cero.
    if (estado.meta.fecha !== hoy()) {
      estado.meta = { fecha: hoy(), completadas: 0 };
    }

    // La racha se rompe si el último día cumplido no fue hoy ni ayer.
    if (estado.racha.ultima && diasEntre(estado.racha.ultima, hoy()) > 1) {
      estado.racha.actual = 0;
    }

    guardar();
    return estado;
  }

  function guardar() {
    try {
      localStorage.setItem(clave(), JSON.stringify(estado));
    } catch (e) {
      // Sin espacio o en modo privado: la sesión sigue funcionando en memoria.
      console.warn("No se pudo guardar el progreso:", e);
    }
  }

  function reiniciar() {
    estado = estadoInicial();
    guardar();
  }

  /* ─────────────── registro de respuestas ─────────────── */

  function registroDe(id) {
    return estado.preguntas[id] || null;
  }

  function esRepaso(id) {
    const r = registroDe(id);
    return !!r && r.proximo <= hoy();
  }

  function registrarRespuesta(pregunta, correcta, segundos) {
    const previo = estado.preguntas[pregunta.id] || {
      nivel: 0, proximo: hoy(), correctas: 0, incorrectas: 0, ultima: null
    };

    const nivel = correcta
      ? Math.min(previo.nivel + 1, INTERVALOS.length - 1)
      : 0;

    const espera = correcta ? INTERVALOS[nivel] : 1;

    estado.preguntas[pregunta.id] = {
      nivel: nivel,
      proximo: sumarDias(hoy(), espera),
      correctas: previo.correctas + (correcta ? 1 : 0),
      incorrectas: previo.incorrectas + (correcta ? 0 : 1),
      ultima: hoy()
    };

    estado.historial.push({
      id: pregunta.id,
      area: pregunta.area,
      dificultad: pregunta.dificultad || "media",
      correcta: correcta,
      segundos: segundos,
      fecha: hoy()
    });
    if (estado.historial.length > 800) estado.historial.shift();

    guardar();

    return { nivel: nivel, dias: espera };
  }

  /* ─────────────── meta diaria y racha ─────────────── */

  function metaDiaria() {
    if (estado.meta.fecha !== hoy()) {
      estado.meta = { fecha: hoy(), completadas: 0 };
      guardar();
    }
    return { completadas: estado.meta.completadas, total: META_DIARIA };
  }

  /* Devuelve true si esta pregunta cerró la meta del día. */
  function sumarAvanceDiario() {
    metaDiaria();
    const yaCumplida = estado.meta.completadas >= META_DIARIA;
    estado.meta.completadas += 1;

    let reciénCumplida = false;

    if (!yaCumplida && estado.meta.completadas >= META_DIARIA) {
      reciénCumplida = true;
      estado.metasCumplidas += 1;

      if (!estado.diasCompletados.includes(hoy())) {
        estado.diasCompletados.push(hoy());
        if (estado.diasCompletados.length > 400) estado.diasCompletados.shift();
      }

      if (estado.racha.ultima === null || diasEntre(estado.racha.ultima, hoy()) > 1) {
        estado.racha.actual = 1;
      } else if (diasEntre(estado.racha.ultima, hoy()) === 1) {
        estado.racha.actual += 1;
      }
      estado.racha.ultima = hoy();
      estado.racha.mejor = Math.max(estado.racha.mejor, estado.racha.actual);
    }

    guardar();
    return reciénCumplida;
  }

  function racha() {
    return { actual: estado.racha.actual, mejor: estado.racha.mejor };
  }

  /* Los siete días de la semana en curso, de lunes a domingo. */
  function semanaActual() {
    const ahora = new Date();
    const diaSemana = (ahora.getDay() + 6) % 7; // 0 = lunes
    const lunes = new Date(ahora);
    lunes.setDate(ahora.getDate() - diaSemana);

    const letras = ["L", "M", "M", "J", "V", "S", "D"];
    const dias = [];

    for (let i = 0; i < 7; i++) {
      const f = new Date(lunes);
      f.setDate(lunes.getDate() + i);
      const texto = aTexto(f);
      dias.push({
        letra: letras[i],
        fecha: texto,
        hecho: estado.diasCompletados.includes(texto),
        esHoy: texto === hoy(),
        futuro: texto > hoy()
      });
    }
    return dias;
  }

  /* ─────────────── puntaje ─────────────── */

  /* El puntaje refleja el rendimiento reciente, no el volumen
     acumulado: es el promedio ponderado de las últimas respuestas
     llevado a la escala 100–1000. Puede subir y bajar. */
  function puntaje() {
    const recientes = estado.historial.slice(-VENTANA_PUNTAJE);
    if (recientes.length < MINIMO_PARA_PUNTAJE) return null;

    let suma = 0;
    recientes.forEach(function (r) {
      if (!r.correcta) return;
      const peso = PESO_DIFICULTAD[r.dificultad] || 1;
      let valor = peso;
      if (r.segundos <= 60) valor += 0.05; // pequeño premio al ritmo de prueba
      suma += Math.min(valor, 1.2);
    });

    const promedio = Math.min(suma / recientes.length, 1);
    return Math.round(100 + 900 * promedio);
  }

  function faltanParaPuntaje() {
    return Math.max(0, MINIMO_PARA_PUNTAJE - estado.historial.length);
  }

  /* ─────────────── estadísticas ─────────────── */

  function estadisticas() {
    const h = estado.historial;
    const total = h.length;
    const correctas = h.filter(function (r) { return r.correcta; }).length;
    const segundos = h.reduce(function (s, r) { return s + r.segundos; }, 0);

    return {
      total: total,
      correctas: correctas,
      incorrectas: total - correctas,
      precision: total ? Math.round((correctas / total) * 100) : null,
      tiempoPromedio: total ? Math.round(segundos / total) : null,
      vistas: Object.keys(estado.preguntas).length,
      metasCumplidas: estado.metasCumplidas,
      mejorRacha: estado.racha.mejor,
      ultimas: h.slice(-20)
    };
  }

  function porArea() {
    const mapa = {};
    estado.historial.forEach(function (r) {
      const a = r.area || "Sin área";
      if (!mapa[a]) mapa[a] = { total: 0, correctas: 0 };
      mapa[a].total += 1;
      if (r.correcta) mapa[a].correctas += 1;
    });
    return mapa;
  }

  /* El área más débil, para sesgar la selección de preguntas.
     Necesita al menos 4 respuestas en el área para tomarla en serio. */
  function areaMasDebil() {
    const mapa = porArea();
    let peor = null;
    for (const area in mapa) {
      const d = mapa[area];
      if (d.total < 4) continue;
      const tasa = d.correctas / d.total;
      if (tasa >= 0.8) continue;
      if (!peor || tasa < peor.tasa) peor = { area: area, tasa: tasa };
    }
    return peor ? peor.area : null;
  }

  /* ─────────────── logros ─────────────── */

  function revisarLogros() {
    const nuevos = [];
    const e = estadisticas();
    const ultimas20 = estado.historial.slice(-20);
    const rapidas = estado.historial.filter(function (r) {
      return r.correcta && r.segundos < 40;
    }).length;
    const aciertos20 = ultimas20.filter(function (r) { return r.correcta; }).length;

    const condiciones = {
      primera:   e.total >= 1,
      racha7:    estado.racha.actual >= 7,
      cien:      e.total >= 100,
      velocista: rapidas >= 10,
      precision: ultimas20.length >= 20 && aciertos20 / 20 >= 0.85,
      constante: estado.metasCumplidas >= 10
    };

    LOGROS.forEach(function (logro) {
      if (condiciones[logro.id] && !estado.logros.includes(logro.id)) {
        estado.logros.push(logro.id);
        nuevos.push(logro);
      }
    });

    if (nuevos.length) guardar();
    return nuevos;
  }

  function logros() {
    return LOGROS.map(function (l) {
      return Object.assign({}, l, { obtenido: estado.logros.includes(l.id) });
    });
  }

  /* ─────────────── interfaz pública ─────────────── */

  return {
    INTERVALOS: INTERVALOS,
    META_DIARIA: META_DIARIA,
    cargar: cargar,
    reiniciar: reiniciar,
    hoy: hoy,
    registroDe: registroDe,
    esRepaso: esRepaso,
    registrarRespuesta: registrarRespuesta,
    metaDiaria: metaDiaria,
    sumarAvanceDiario: sumarAvanceDiario,
    racha: racha,
    semanaActual: semanaActual,
    puntaje: puntaje,
    faltanParaPuntaje: faltanParaPuntaje,
    estadisticas: estadisticas,
    porArea: porArea,
    areaMasDebil: areaMasDebil,
    revisarLogros: revisarLogros,
    logros: logros
  };

})();
