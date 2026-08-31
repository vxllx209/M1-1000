/* =============================================================
   BANCO — decide qué preguntas tocan en la sesión de hoy
   -------------------------------------------------------------
   Lee window.BANCO_PREGUNTAS (definido en data/*.js) y usa
   Progreso para saber qué está pendiente de repaso, qué es nuevo
   y en qué área conviene insistir.
   ============================================================= */

const Banco = (function () {

  /* Como máximo, esta cantidad de preguntas de repaso entran en
     una misma sesión, para no convertir el estudio en repetir
     siempre los mismos errores. */
  const MAX_REPASOS_POR_SESION = 2;

  function preguntas() {
    return window.BANCO_PREGUNTAS || [];
  }

  function mezclar(arreglo) {
    const copia = arreglo.slice();
    for (let i = copia.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copia[i];
      copia[i] = copia[j];
      copia[j] = tmp;
    }
    return copia;
  }

  function resumen() {
    const todas = preguntas();
    let correctas = 0, conErrores = 0, nuevas = 0, paraHoy = 0;

    todas.forEach(function (p) {
      const r = Progreso.registroDe(p.id);
      if (!r) {
        nuevas += 1;
      } else if (r.incorrectas > 0) {
        conErrores += 1;
      } else {
        correctas += 1;
      }
      if (Progreso.esRepaso(p.id)) paraHoy += 1;
    });

    return { total: todas.length, correctas: correctas, conErrores: conErrores, nuevas: nuevas, paraHoy: paraHoy };
  }

  /* Arma una sesión de `cantidad` preguntas: primero los repasos
     pendientes (con tope), luego preguntas nunca vistas —con
     preferencia por el área más débil—, y si falta relleno, las ya
     vistas que no están en repaso todavía.

     Si se pasa `area`, la sesión se arma solo con preguntas de esa
     área (práctica libre por tema), sin priorizar el área más débil
     porque ya está fija. */
  function construirSesion(cantidad, area) {
    const todas = area ? preguntas().filter(function (p) { return p.area === area; }) : preguntas();
    if (todas.length === 0) return [];

    const repasos = mezclar(todas.filter(function (p) { return Progreso.esRepaso(p.id); }))
      .slice(0, MAX_REPASOS_POR_SESION);
    const usados = new Set(repasos.map(function (p) { return p.id; }));

    const nuevas = mezclar(todas.filter(function (p) {
      return !usados.has(p.id) && !Progreso.registroDe(p.id);
    }));

    const vistas = mezclar(todas.filter(function (p) {
      return !usados.has(p.id) && !!Progreso.registroDe(p.id) && !Progreso.esRepaso(p.id);
    }));

    if (!area) {
      const areaDebil = Progreso.areaMasDebil();
      if (areaDebil) {
        nuevas.sort(function (a, b) {
          const pa = a.area === areaDebil ? 0 : 1;
          const pb = b.area === areaDebil ? 0 : 1;
          return pa - pb;
        });
      }
    }

    return repasos.concat(nuevas, vistas).slice(0, cantidad);
  }

  /* Cantidad de preguntas disponibles por área, para saber si vale la
     pena ofrecer el botón de práctica libre de esa área. */
  function totalPorArea(area) {
    return preguntas().filter(function (p) { return p.area === area; }).length;
  }

  return {
    MAX_REPASOS_POR_SESION: MAX_REPASOS_POR_SESION,
    resumen: resumen,
    construirSesion: construirSesion,
    totalPorArea: totalPorArea
  };

})();
