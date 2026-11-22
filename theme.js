/*! Meridian theme.js v0.6.2 · copia de ~/Meridian/css/theme.js · NO EDITAR (ESTANDAR §11)
 *
 * Elige el tema de la app. Se carga en el <head>, ANTES de la hoja de estilos, para no parpadear:
 *   <script src="/static/theme.js"></script>
 *
 * Modos (el selector de la interfaz los muestra en este orden):
 *   auto   sigue al sistema (es el valor por defecto)
 *   light  claro
 *   dark   oscuro
 *   time   claro de día y oscuro de noche (opcional; por defecto de 07:00 a 19:00)
 *
 * El modo se guarda en el navegador (localStorage). Para cambiar el horario de `time`, la app pone
 * <html data-theme-from="7" data-theme-to="19">.
 */
(() => {
  const KEY = "meridian-theme";
  const MODES = ["auto", "light", "dark", "time"];
  const root = document.documentElement;
  let timer = 0;

  const read = () => {
    try {
      const saved = localStorage.getItem(KEY);
      return MODES.includes(saved) ? saved : "auto";
    } catch {
      return "auto";
    }
  };

  const effective = (mode) => {
    if (mode !== "time") return mode;
    const from = Number(root.dataset.themeFrom) || 7;
    const to = Number(root.dataset.themeTo) || 19;
    const hour = new Date().getHours();
    return hour >= from && hour < to ? "light" : "dark";
  };

  const apply = (mode) => {
    const theme = effective(mode);
    if (theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    root.dataset.themeMode = mode;
    clearInterval(timer);
    if (mode === "time") timer = setInterval(() => apply("time"), 5 * 60 * 1000);
  };

  window.MeridianTheme = {
    modes: MODES,
    get: read,
    set(mode) {
      if (!MODES.includes(mode)) return;
      try {
        localStorage.setItem(KEY, mode);
      } catch {
        /* sin almacenamiento: el modo vale solo para esta página */
      }
      apply(mode);
    },
  };

  apply(read());
})();
