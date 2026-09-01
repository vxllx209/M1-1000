/* =============================================================
   ICONOS — set propio de iconos en línea, estilo Lucide (trazo
   2px, grid 24x24, terminaciones redondeadas), sin dependencias
   externas para que la app siga funcionando abriendo index.html
   directamente, sin conexión.
   ============================================================= */

const Iconos = (function () {

  /* Solo el contenido interno del <svg> (sin la etiqueta), para
     poder envolverlo con atributos distintos según el caso. */
  const TRAZOS = {
    "user": '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8"/>',
    "user-plus": '<circle cx="9" cy="8" r="4"/><path d="M2 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/><path d="M19 8v6M16 11h6"/>',
    "home": '<path d="M3.5 11.5 12 4l8.5 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1h4v-6h3v6h4a1 1 0 0 0 1-1v-9"/>',
    "bar-chart": '<line x1="6" y1="20" x2="6" y2="12"/><line x1="12" y1="20" x2="12" y2="6"/><line x1="18" y1="20" x2="18" y2="14"/>',
    "trending-up": '<polyline points="4,17 10,11 14,15 20,6"/><polyline points="15,6 20,6 20,11"/>',
    "settings": '<circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    "book": '<path d="M12 6.5c-1.9-1.3-4.7-1.7-7.5-.9v12.5c2.8-.8 5.6-.4 7.5.9 1.9-1.3 4.7-1.7 7.5-.9V4.6c-2.8-.8-5.6-.4-7.5.9V19"/>',
    "target": '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    "zap": '<path d="M12.5 2 4.5 13.5h6l-1 8.5 8-11.5h-6l1-8.5z" stroke-linejoin="round"/>',
    "award": '<circle cx="12" cy="8" r="5"/><path d="M8.2 12.4 6 21l6-3 6 3-2.2-8.6"/>',
    "percent": '<circle cx="7.5" cy="7.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/><line x1="19" y1="5" x2="5" y2="19"/>',
    "flame": '<path d="M12 21.5c4 0 7-2.8 7-6.8 0-3.3-2.2-5.6-3.4-7.8-.3 2.2-1.6 3.3-1.6 3.3.3-2.7-1.1-4.4-3.3-6.1C9.2 6.9 7.5 9.2 7.5 12c0 .8.2 1.6.5 2.2C6.9 13.4 6.3 12 6.3 10.4 5 12 4.3 14.1 4.3 15.2c0 3.9 3.7 6.3 7.7 6.3z" stroke-linejoin="round"/>',
    "check": '<polyline points="4,12.5 9,17.5 20,6"/>',
    "chevron-right": '<polyline points="9,5 16,12 9,19"/>'
  };

  /* Iconos que se ven mejor sólidos (relleno) en vez de sólo trazo,
     para dar un pequeño acento de color — como el fuego de la racha
     o el trofeo de un logro recién obtenido. */
  const SOLIDOS = { "flame": true };

  function svg(nombre, claseExtra) {
    const interior = TRAZOS[nombre];
    if (!interior) return "";
    const relleno = SOLIDOS[nombre] ? "currentColor" : "none";
    const clase = "icono icono-" + nombre + (claseExtra ? " " + claseExtra : "");
    return (
      `<svg class="${clase}" viewBox="0 0 24 24" fill="${relleno}" stroke="currentColor" ` +
      `stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">` +
      interior +
      `</svg>`
    );
  }

  return { svg: svg };

})();
