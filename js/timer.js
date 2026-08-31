/* =============================================================
   TEMPORIZADOR — dos minutos por pregunta
   -------------------------------------------------------------
   La prueba oficial da 2 horas 20 minutos para 65 preguntas, o
   sea 2 minutos y 9 segundos por pregunta. El límite de 2:00 de
   esta plataforma es prácticamente el ritmo real de la PAES.

   Cuenta contra el reloj del sistema en vez de sumar ticks, para
   que no se atrase si el navegador pasa a segundo plano.
   ============================================================= */

const Temporizador = (function () {

  const DURACION = 120; // segundos

  let intervalo = null;
  let inicio = null;
  let alTerminar = null;
  let alAvanzar = null;

  function formatear(segundos) {
    const m = Math.floor(Math.max(segundos, 0) / 60);
    const s = Math.max(segundos, 0) % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function tick() {
    const restante = DURACION - transcurrido();

    if (alAvanzar) alAvanzar(Math.max(restante, 0));

    if (restante <= 0) {
      const fin = alTerminar;
      detener();
      if (fin) fin();
    }
  }

  function transcurrido() {
    if (inicio === null) return 0;
    return Math.floor((Date.now() - inicio) / 1000);
  }

  function iniciar(opciones) {
    detener();
    inicio = Date.now();
    alAvanzar = opciones.alAvanzar || null;
    alTerminar = opciones.alTerminar || null;
    if (alAvanzar) alAvanzar(DURACION);
    intervalo = setInterval(tick, 250);
  }

  function detener() {
    if (intervalo) clearInterval(intervalo);
    intervalo = null;
    alTerminar = null;
    alAvanzar = null;
  }

  /* Segundos usados en la pregunta, tope en la duración total. */
  function usados() {
    return Math.min(transcurrido(), DURACION);
  }

  return {
    DURACION: DURACION,
    iniciar: iniciar,
    detener: detener,
    usados: usados,
    formatear: formatear
  };

})();
