/* =============================================================
   APP — flujo de pantallas e interacción
   ============================================================= */

(function () {

  const $ = function (id) { return document.getElementById(id); };

  const LETRAS = ["A", "B", "C", "D"];

  const FRASES_CIERRE = [
    "Mañana te esperan otras cinco.",
    "Constancia antes que volumen.",
    "Nos vemos mañana.",
    "Cinco menos para llegar a 1000."
  ];

  /* Estado de la sesión en curso. */
  let sesion = [];
  let indice = 0;
  let elegida = null;
  let bloqueada = false;
  let resultados = [];

  /* true cuando la sesión es práctica libre por tema: no cuenta para
     la meta diaria, aunque sí se guarda en el historial. */
  let sesionLibre = false;

  /* ═══════════════════ navegación ═══════════════════ */

  function mostrarVista(id) {
    document.querySelectorAll(".vista").forEach(function (v) {
      v.classList.toggle("vista-activa", v.id === id);
    });

    const sinBarraInferior = (id === "vista-practica" || id === "vista-resultado" || id === "vista-perfil");
    $("barra-inferior").hidden = sinBarraInferior;

    document.querySelectorAll(".pestana").forEach(function (p) {
      p.classList.toggle("pestana-activa", p.dataset.vista === id);
    });

    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function aviso(texto, icono) {
    const caja = $("aviso");
    caja.innerHTML = icono ? Iconos.svg(icono, "icono-aviso") : "";
    caja.appendChild(document.createTextNode(texto));
    caja.hidden = false;
    clearTimeout(caja._t);
    caja._t = setTimeout(function () { caja.hidden = true; }, 3200);
  }

  /* Cambia de vista y refresca los datos de la vista de destino,
     usado tanto por la barra inferior como por accesos directos
     como la tarjeta de progreso del inicio. */
  function irA(destino) {
    if (destino === "vista-inicio") renderInicio();
    if (destino === "vista-estadisticas") renderEstadisticas();
    if (destino === "vista-progreso") renderProgreso();
    mostrarVista(destino);
  }

  /* ═══════════════════ inicio ═══════════════════ */

  function pintarHoja(contenedor, cantidad, marcas) {
    contenedor.innerHTML = "";
    for (let i = 0; i < cantidad; i++) {
      const b = document.createElement("div");
      b.className = "burbuja";
      b.textContent = i + 1;
      const marca = marcas ? marcas[i] : null;
      if (marca === true) b.classList.add("burbuja-acertada");
      else if (marca === false) b.classList.add("burbuja-fallada");
      else if (marca === "hecha") b.classList.add("burbuja-llena");
      else if (marca === "actual") b.classList.add("burbuja-actual");
      contenedor.appendChild(b);
    }
  }

  function renderInicio() {
    const meta = Progreso.metaDiaria();
    const r = Progreso.racha();
    const est = Progreso.estadisticas();
    const resumenBanco = Banco.resumen();
    const p = Progreso.puntaje();

    // Racha en la barra superior
    $("chip-racha").hidden = r.actual === 0;
    $("chip-racha-numero").textContent = r.actual;

    // Hero de competencia y progreso: lo primero que se ve al entrar
    $("hero-puntaje").textContent = p === null ? "—" : p;
    $("hero-barra-relleno").style.width = p === null ? "0%" : ((p - 100) / 900) * 100 + "%";
    $("hero-puntaje-nota").textContent = p === null
      ? `Faltan ${Progreso.faltanParaPuntaje()} preguntas para ver tu puntaje`
      : "de 1000, según tus últimas respuestas";

    $("hero-racha").textContent = r.actual;
    $("hero-icono-racha").innerHTML = Iconos.svg("flame");
    $("hero-bloque-racha").classList.toggle("hay-racha", r.actual > 0);

    const todosLogros = Progreso.logros();
    const cajaLogros = $("hero-logros");
    cajaLogros.innerHTML = "";
    todosLogros.forEach(function (l) {
      const insignia = document.createElement("span");
      insignia.className = "insignia" + (l.obtenido ? " insignia-obtenida" : "");
      insignia.title = l.nombre + (l.obtenido ? "" : " (pendiente)");
      insignia.innerHTML = Iconos.svg(l.icono);
      cajaLogros.appendChild(insignia);
    });

    // Hoja de respuestas del día
    const marcas = [];
    for (let i = 0; i < Progreso.META_DIARIA; i++) {
      if (i < meta.completadas) marcas.push("hecha");
      else if (i === meta.completadas) marcas.push("actual");
      else marcas.push(null);
    }
    pintarHoja($("hoja-respuestas"), Progreso.META_DIARIA, marcas);

    const faltan = Math.max(0, meta.total - meta.completadas);
    const cumplida = faltan === 0;

    if (resumenBanco.total === 0) {
      $("titulo-meta").textContent = "Banco vacío";
      $("subtitulo-meta").textContent = "Agrega preguntas en data/questions.js para empezar.";
      $("btn-comenzar").disabled = true;
    } else if (cumplida) {
      $("titulo-meta").textContent = "Meta cumplida";
      $("subtitulo-meta").textContent = "Ya hiciste tus cinco de hoy. Puedes seguir si quieres.";
      $("btn-comenzar").textContent = "Practicar más";
      $("btn-comenzar").disabled = false;
    } else {
      $("titulo-meta").textContent = faltan + (faltan === 1 ? " pregunta" : " preguntas");
      $("subtitulo-meta").textContent = meta.completadas === 0
        ? "Dos minutos cada una. Nada más."
        : "Te falta poco para cerrar el día.";
      $("btn-comenzar").textContent = meta.completadas === 0 ? "Comenzar" : "Continuar";
      $("btn-comenzar").disabled = false;
    }

    $("nota-meta").textContent = resumenBanco.total
      ? `${resumenBanco.total} preguntas en el banco`
      : "";

    // Tarjetas resumen
    $("mini-precision").textContent = est.precision === null ? "—" : est.precision + "%";
    $("mini-banco").textContent = `${resumenBanco.correctas + resumenBanco.conErrores}/${resumenBanco.total}`;
    $("mini-logros").textContent = `${todosLogros.filter(function (l) { return l.obtenido; }).length}/${todosLogros.length}`;

    // Aviso de repasos pendientes
    if (resumenBanco.paraHoy > 0 && !cumplida) {
      $("tarjeta-repaso").hidden = false;
      $("texto-repaso").textContent = resumenBanco.paraHoy === 1
        ? "Hay 1 pregunta lista para repasar. Aparecerá en tu sesión de hoy."
        : `Hay ${resumenBanco.paraHoy} preguntas listas para repasar. Aparecerán en tus próximas sesiones.`;
    } else {
      $("tarjeta-repaso").hidden = true;
    }
  }

  /* ═══════════════════ sesión de práctica ═══════════════════ */

  function iniciarSesion() {
    const meta = Progreso.metaDiaria();
    const cumplida = meta.completadas >= meta.total;
    const cantidad = cumplida ? meta.total : (meta.total - meta.completadas);

    sesion = Banco.construirSesion(cantidad);

    if (sesion.length === 0) {
      aviso("No hay preguntas disponibles en el banco.");
      return;
    }

    sesionLibre = false;
    indice = 0;
    resultados = [];
    mostrarVista("vista-practica");
    mostrarPregunta();
  }

  /* Práctica libre de un área específica, disponible desde el inicio.
     No avanza la meta diaria, pero cada respuesta sí se guarda
     (repetición espaciada, estadísticas, puntaje e historial). */
  function iniciarSesionTema(area) {
    sesion = Banco.construirSesion(5, area);

    if (sesion.length === 0) {
      aviso("Todavía no hay preguntas de esa área en el banco.");
      return;
    }

    sesionLibre = true;
    indice = 0;
    resultados = [];
    mostrarVista("vista-practica");
    mostrarPregunta();
  }

  function mostrarPregunta() {
    const p = sesion[indice];
    elegida = null;
    bloqueada = false;

    $("contador-sesion").textContent = `Pregunta ${indice + 1} de ${sesion.length}`;
    $("etiqueta-area").textContent = p.area || "M1";
    $("etiqueta-dificultad").textContent = p.dificultad || "media";
    $("etiqueta-repaso").hidden = !Progreso.registroDe(p.id);
    $("enunciado").textContent = p.pregunta;

    // Imagen o gráfico, si la pregunta lo necesita
    if (p.imagen) {
      $("imagen-pregunta").src = p.imagen;
      $("imagen-pregunta").alt = p.imagenAlt || "Figura de la pregunta";
      $("figura-pregunta").hidden = false;
    } else {
      $("figura-pregunta").hidden = true;
      $("imagen-pregunta").removeAttribute("src");
    }

    // Alternativas
    const caja = $("alternativas");
    caja.innerHTML = "";
    LETRAS.forEach(function (letra) {
      const texto = p.alternativas ? p.alternativas[letra] : null;
      if (texto === undefined || texto === null) return;

      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "alternativa";
      boton.dataset.letra = letra;
      boton.setAttribute("role", "radio");
      boton.setAttribute("aria-checked", "false");
      boton.innerHTML =
        `<span class="alternativa-letra">${letra}</span>` +
        `<span class="alternativa-texto"></span>`;
      boton.querySelector(".alternativa-texto").textContent = texto;
      boton.addEventListener("click", function () { elegir(letra); });
      caja.appendChild(boton);
    });

    $("btn-responder").disabled = true;
    $("btn-responder").textContent = "Responder";

    Temporizador.iniciar({
      alAvanzar: pintarReloj,
      alTerminar: seAcaboElTiempo
    });
  }

  function pintarReloj(restante) {
    $("reloj").textContent = Temporizador.formatear(restante);
    const porcentaje = (restante / Temporizador.DURACION) * 100;
    const barra = $("barra-tiempo-relleno");
    barra.style.width = porcentaje + "%";

    const reloj = $("reloj");
    reloj.classList.toggle("reloj-alerta", restante <= 30 && restante > 10);
    reloj.classList.toggle("reloj-critico", restante <= 10);
    barra.classList.toggle("alerta", restante <= 30 && restante > 10);
    barra.classList.toggle("critico", restante <= 10);
  }

  function elegir(letra) {
    if (bloqueada) return;
    elegida = letra;
    document.querySelectorAll(".alternativa").forEach(function (b) {
      const activa = b.dataset.letra === letra;
      b.classList.toggle("alternativa-elegida", activa);
      b.setAttribute("aria-checked", activa ? "true" : "false");
    });
    $("btn-responder").disabled = false;
  }

  function seAcaboElTiempo() {
    if (bloqueada) return;
    aviso("Se acabó el tiempo.");
    confirmarRespuesta();
  }

  function confirmarRespuesta() {
    if (bloqueada) return;
    bloqueada = true;

    const p = sesion[indice];
    const segundos = Temporizador.usados();
    Temporizador.detener();

    const correcta = elegida === p.correcta;
    const repeticion = Progreso.registrarRespuesta(p, correcta, segundos);
    const cerroMeta = sesionLibre ? false : Progreso.sumarAvanceDiario();
    const nuevosLogros = Progreso.revisarLogros();

    resultados.push({ correcta: correcta, segundos: segundos });

    mostrarResultado(p, correcta, segundos, repeticion, cerroMeta);

    if (nuevosLogros.length) {
      setTimeout(function () {
        aviso(`Logro: ${nuevosLogros[0].nombre}`, nuevosLogros[0].icono);
      }, 700);
    }
  }

  function mostrarResultado(p, correcta, segundos, repeticion, cerroMeta) {
    const tarjeta = $("tarjeta-veredicto");
    tarjeta.classList.toggle("es-correcto", correcta);
    tarjeta.classList.toggle("es-incorrecto", !correcta);

    $("veredicto").textContent = correcta
      ? "Correcto"
      : (elegida === null ? "Sin responder" : "Incorrecto");

    const tuya = $("burbuja-tuya");
    tuya.textContent = elegida || "—";
    tuya.className = "burbuja-resultado";
    if (elegida === null) tuya.classList.add("burbuja-vacia");
    else if (correcta) tuya.classList.add("burbuja-correcta");
    else tuya.classList.add("burbuja-errada");

    $("burbuja-correcta").textContent = p.correcta;
    $("tiempo-usado").textContent = Temporizador.formatear(segundos).replace(/^0/, "");
    $("explicacion").textContent = p.explicacion || "Esta pregunta todavía no tiene explicación cargada.";

    const dias = repeticion.dias;
    $("proximo-repaso").textContent = correcta
      ? (dias === 1
          ? "Vuelve a aparecer mañana."
          : `Vuelve a aparecer en ${dias} días.`)
      : "Queda marcada para repasar mañana.";

    const ultima = indice >= sesion.length - 1;
    $("btn-continuar").textContent = ultima
      ? (cerroMeta ? "Ver mi resumen" : "Terminar")
      : "Siguiente pregunta";

    mostrarVista("vista-resultado");
  }

  function continuar() {
    if (indice < sesion.length - 1) {
      indice += 1;
      mostrarVista("vista-practica");
      mostrarPregunta();
    } else {
      sesionLibre = false;
      renderResumen();
      mostrarVista("vista-resumen");
    }
  }

  function salirDeLaPractica() {
    Temporizador.detener();
    sesionLibre = false;
    renderInicio();
    mostrarVista("vista-inicio");
  }

  /* ═══════════════════ resumen de la sesión ═══════════════════ */

  function renderResumen() {
    const aciertos = resultados.filter(function (r) { return r.correcta; }).length;
    const total = resultados.length;
    const segundos = resultados.reduce(function (s, r) { return s + r.segundos; }, 0);
    const promedio = total ? Math.round(segundos / total) : 0;
    const meta = Progreso.metaDiaria();
    const cumplida = meta.completadas >= meta.total;
    const p = Progreso.puntaje();

    $("titulo-celebracion").textContent = `${aciertos} de ${total}`;
    document.querySelector("#vista-resumen .eyebrow").textContent =
      cumplida ? "Meta completada" : "Sesión terminada";

    pintarHoja($("hoja-resumen"), total, resultados.map(function (r) { return r.correcta; }));

    const r = Progreso.racha();
    $("frase-cierre").textContent = cumplida && r.actual > 1
      ? `Racha de ${r.actual} días. ${FRASES_CIERRE[0]}`
      : FRASES_CIERRE[Math.floor(Math.random() * FRASES_CIERRE.length)];

    $("resumen-aciertos").textContent = aciertos;
    $("resumen-aciertos").nextElementSibling.textContent = "de " + total;
    $("resumen-tiempo").textContent = Temporizador.formatear(promedio).replace(/^0/, "");
    $("resumen-puntaje").textContent = p === null ? "—" : p;
    $("resumen-delta").textContent = p === null
      ? `faltan ${Progreso.faltanParaPuntaje()}`
      : "de 1000";
  }

  /* ═══════════════════ estadísticas ═══════════════════ */

  function renderEstadisticas() {
    const areas = Progreso.porArea();
    const caja = $("lista-areas");
    caja.innerHTML = "";

    const nombres = Object.keys(areas);
    if (nombres.length === 0) {
      const vacio = document.createElement("p");
      vacio.className = "dato-pie";
      vacio.textContent = "Responde algunas preguntas y aquí verás en qué áreas estás más fuerte.";
      caja.appendChild(vacio);
    }

    nombres.sort().forEach(function (nombre) {
      const d = areas[nombre];
      const pct = Math.round((d.correctas / d.total) * 100);

      const fila = document.createElement("div");
      const nivel = pct >= 80 ? "alta" : pct >= 60 ? "media" : "baja";
      fila.innerHTML =
        `<div class="area-fila-cabecera">
           <span class="area-nombre"></span>
           <span class="area-cifra">${pct}% <span>· ${d.correctas}/${d.total}</span></span>
         </div>
         <div class="area-barra">
           <div class="area-barra-relleno ${nivel}" style="width:${pct}%"></div>
         </div>`;
      fila.querySelector(".area-nombre").textContent = nombre;
      caja.appendChild(fila);
    });

    const e = Progreso.estadisticas();
    const datos = [
      ["Preguntas respondidas", e.total],
      ["Correctas", e.correctas],
      ["Incorrectas", e.incorrectas],
      ["Precisión", e.precision === null ? "—" : e.precision + "%"],
      ["Tiempo promedio", e.tiempoPromedio === null ? "—" : e.tiempoPromedio + " s"],
      ["Preguntas distintas vistas", e.vistas],
      ["Metas diarias cumplidas", e.metasCumplidas],
      ["Mejor racha", e.mejorRacha + (e.mejorRacha === 1 ? " día" : " días")]
    ];

    const lista = $("lista-datos");
    lista.innerHTML = "";
    datos.forEach(function (par) {
      const fila = document.createElement("div");
      fila.className = "dato-fila";
      const dt = document.createElement("dt");
      dt.textContent = par[0];
      const dd = document.createElement("dd");
      dd.textContent = par[1];
      fila.append(dt, dd);
      lista.appendChild(fila);
    });

    const tira = $("tira-historial");
    tira.innerHTML = "";
    e.ultimas.forEach(function (r) {
      const m = document.createElement("span");
      m.className = "marca-historial " + (r.correcta ? "ok" : "mal");
      tira.appendChild(m);
    });
    $("nota-historial").textContent = e.ultimas.length
      ? "Verde: acierto. Rojo: error. De la más antigua a la más reciente."
      : "Todavía no has respondido preguntas.";
  }

  /* ═══════════════════ progreso ═══════════════════ */

  function renderProgreso() {
    const p = Progreso.puntaje();
    $("puntaje-grande").textContent = p === null ? "—" : p;
    $("barra-puntaje-relleno").style.width =
      p === null ? "0%" : ((p - 100) / 900) * 100 + "%";
    $("nota-puntaje").textContent = p === null
      ? `Responde ${Progreso.faltanParaPuntaje()} preguntas más para calcular tu puntaje.`
      : "Refleja tus últimas 40 respuestas, así que sube y baja. Es una referencia de práctica, no una conversión oficial del DEMRE.";

    const r = Progreso.racha();
    $("racha-actual").textContent = r.actual + (r.actual === 1 ? " día" : " días");
    $("mejor-racha").textContent = "Tu mejor racha: " + r.mejor + (r.mejor === 1 ? " día" : " días");

    const semana = $("semana");
    semana.innerHTML = "";
    Progreso.semanaActual().forEach(function (d) {
      const caja = document.createElement("div");
      caja.className = "dia";
      const marca = d.hecho ? "✓" : (d.futuro ? "" : "○");
      caja.innerHTML =
        `<span class="dia-letra">${d.letra}</span>
         <div class="dia-marca ${d.hecho ? "hecho" : ""} ${d.esHoy ? "hoy" : ""}">${marca}</div>`;
      semana.appendChild(caja);
    });

    const b = Banco.resumen();
    const filas = [
      ["#FFFFFF", "Nunca respondidas", b.nuevas],
      ["#0E7A55", "Respondidas bien", b.correctas],
      ["#C92A2A", "Con errores", b.conErrores],
      ["#E08700", "Listas para repasar", b.paraHoy]
    ];
    const contenedor = $("estados-banco");
    contenedor.innerHTML = "";
    filas.forEach(function (f) {
      const fila = document.createElement("div");
      fila.className = "estado-fila";
      fila.innerHTML =
        `<span class="estado-punto" style="background:${f[0]}"></span>
         <span class="estado-nombre"></span>
         <span class="estado-cifra">${f[2]}</span>`;
      fila.querySelector(".estado-nombre").textContent = f[1];
      contenedor.appendChild(fila);
    });

    const cajaLogros = $("lista-logros");
    cajaLogros.innerHTML = "";
    Progreso.logros().forEach(function (l) {
      const item = document.createElement("div");
      item.className = "logro" + (l.obtenido ? " logro-obtenido" : "");
      item.innerHTML =
        `<span class="logro-icono">${Iconos.svg(l.icono)}</span>
         <div><p class="logro-nombre"></p><p class="logro-detalle"></p></div>`;
      item.querySelector(".logro-nombre").textContent = l.nombre;
      item.querySelector(".logro-detalle").textContent = l.detalle;
      cajaLogros.appendChild(item);
    });
  }

  /* ═══════════════════ perfiles ═══════════════════ */

  function renderSelectorPerfil() {
    const caja = $("lista-perfiles");
    caja.innerHTML = "";

    const nombres = Perfiles.listar();
    if (nombres.length === 0) {
      const vacio = document.createElement("p");
      vacio.className = "dato-pie";
      vacio.textContent = "Todavía no hay perfiles guardados en este navegador.";
      caja.appendChild(vacio);
    }

    nombres.forEach(function (nombre) {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "boton boton-secundario boton-perfil";
      boton.textContent = nombre;
      boton.addEventListener("click", function () { elegirPerfil(nombre); });
      caja.appendChild(boton);
    });

    $("btn-cancelar-perfil").hidden = !Perfiles.activo();
  }

  function mostrarSelectorPerfil() {
    renderSelectorPerfil();
    mostrarVista("vista-perfil");
  }

  function elegirPerfil(nombre) {
    const limpio = Perfiles.establecerActivo(nombre);
    if (!limpio) {
      aviso("Escribe un nombre para crear tu perfil.");
      return;
    }
    $("chip-perfil-nombre").textContent = limpio;
    Progreso.cargar();
    renderInicio();
    mostrarVista("vista-inicio");
  }

  /* ═══════════════════ teclado ═══════════════════ */

  function atajos(evento) {
    const enPractica = $("vista-practica").classList.contains("vista-activa");
    const enResultado = $("vista-resultado").classList.contains("vista-activa");

    if (enResultado && (evento.key === "Enter" || evento.key === " ")) {
      evento.preventDefault();
      continuar();
      return;
    }

    if (!enPractica || bloqueada) return;

    const tecla = evento.key.toUpperCase();
    if (LETRAS.includes(tecla)) {
      const existe = document.querySelector(`.alternativa[data-letra="${tecla}"]`);
      if (existe) { evento.preventDefault(); elegir(tecla); }
    } else if (evento.key === "Enter" && elegida) {
      evento.preventDefault();
      confirmarRespuesta();
    }
  }

  /* ═══════════════════ arranque ═══════════════════ */

  function iniciar() {
    $("btn-comenzar").addEventListener("click", iniciarSesion);
    $("btn-responder").addEventListener("click", confirmarRespuesta);
    $("btn-continuar").addEventListener("click", continuar);
    $("btn-salir").addEventListener("click", salirDeLaPractica);

    $("btn-volver-inicio").addEventListener("click", function () { irA("vista-inicio"); });

    $("hero-progreso").addEventListener("click", function () { irA("vista-progreso"); });

    $("btn-seguir").addEventListener("click", iniciarSesion);

    $("btn-reiniciar").addEventListener("click", function () {
      const seguro = confirm("Esto borra tus respuestas, tu racha y tu puntaje. No se puede deshacer. ¿Continuar?");
      if (!seguro) return;
      Progreso.reiniciar();
      renderInicio();
      renderProgreso();
      renderEstadisticas();
      mostrarVista("vista-inicio");
      aviso("Progreso borrado.");
    });

    document.querySelectorAll(".pestana").forEach(function (p) {
      p.addEventListener("click", function () { irA(p.dataset.vista); });
    });

    document.querySelectorAll(".boton-tema").forEach(function (b) {
      b.addEventListener("click", function () { iniciarSesionTema(b.dataset.area); });
    });

    $("chip-perfil").addEventListener("click", mostrarSelectorPerfil);

    $("btn-crear-perfil").addEventListener("click", function () {
      elegirPerfil($("input-nuevo-perfil").value);
      $("input-nuevo-perfil").value = "";
    });

    $("input-nuevo-perfil").addEventListener("keydown", function (evento) {
      if (evento.key === "Enter") {
        evento.preventDefault();
        $("btn-crear-perfil").click();
      }
    });

    $("btn-cancelar-perfil").addEventListener("click", function () { irA("vista-inicio"); });

    document.addEventListener("keydown", atajos);

    const perfil = Perfiles.activo();
    if (perfil) {
      $("chip-perfil-nombre").textContent = perfil;
      Progreso.cargar();
      renderInicio();
    } else {
      mostrarSelectorPerfil();
    }
  }

  document.addEventListener("DOMContentLoaded", iniciar);

})();
