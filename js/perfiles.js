/* =============================================================
   PERFILES — permite que varias personas usen la app en el mismo
   navegador sin cuentas ni backend. Cada perfil guarda su propio
   progreso bajo una clave distinta en LocalStorage (ver cómo
   Progreso arma su clave de guardado a partir de Perfiles.activo()).
   No hay contraseña: es solo para separar el progreso, no para
   proteger datos.
   ============================================================= */

const Perfiles = (function () {

  const CLAVE_LISTA = "m1-1000-perfiles-v1";
  const CLAVE_ACTIVO = "m1-1000-perfil-activo-v1";

  function normalizar(nombre) {
    return (nombre || "").trim().replace(/\s+/g, " ");
  }

  function listar() {
    try {
      const crudo = localStorage.getItem(CLAVE_LISTA);
      const lista = crudo ? JSON.parse(crudo) : [];
      return Array.isArray(lista) ? lista : [];
    } catch (e) {
      return [];
    }
  }

  function guardarLista(lista) {
    try {
      localStorage.setItem(CLAVE_LISTA, JSON.stringify(lista));
    } catch (e) {
      console.warn("No se pudo guardar la lista de perfiles:", e);
    }
  }

  function activo() {
    try {
      return localStorage.getItem(CLAVE_ACTIVO);
    } catch (e) {
      return null;
    }
  }

  /* Agrega el nombre a la lista de perfiles si no existía. */
  function crear(nombre) {
    const limpio = normalizar(nombre);
    if (!limpio) return null;
    const lista = listar();
    if (!lista.includes(limpio)) {
      lista.push(limpio);
      guardarLista(lista);
    }
    return limpio;
  }

  function establecerActivo(nombre) {
    const limpio = crear(nombre);
    if (!limpio) return null;
    try {
      localStorage.setItem(CLAVE_ACTIVO, limpio);
    } catch (e) {
      console.warn("No se pudo guardar el perfil activo:", e);
    }
    return limpio;
  }

  return {
    listar: listar,
    activo: activo,
    crear: crear,
    establecerActivo: establecerActivo
  };

})();
