/*! Meridian theme.js v0.8.0 · copia de ~/Meridian/css/theme.js · NO EDITAR (ESTANDAR §11)
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
 *
 * Para lo que se dibuja en JavaScript (gráficos, canvas, librerías como Cytoscape):
 *   MeridianTheme.color("--surface")   → "#rrggbb" ya resuelto para el tema actual
 *   MeridianTheme.onChange(() => ...)  → se llama cuando cambia el tema (por el usuario, por el sistema o por
 *                                        la hora); ahí se vuelve a pintar
 * No se lee un token con getComputedStyle(root).getPropertyValue("--surface"): devuelve el texto sin resolver
 * (`light-dark(oklch(…), oklch(…))`) y no un color.
 */
(() => {
  const KEY = "meridian-theme";
  const MODES = ["auto", "light", "dark", "time"];
  const root = document.documentElement;
  const listeners = [];
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

  const emit = () => listeners.forEach((fn) => fn());

  const apply = (mode) => {
    const theme = effective(mode);
    const before = root.getAttribute("data-theme");
    if (theme === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    root.dataset.themeMode = mode;
    clearInterval(timer);
    if (mode === "time") timer = setInterval(() => apply("time"), 5 * 60 * 1000);
    if (before !== root.getAttribute("data-theme")) emit();
  };

  let canvas2d = null;
  const toHex = (css) => {
    canvas2d ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    canvas2d.canvas.width = canvas2d.canvas.height = 1;
    canvas2d.clearRect(0, 0, 1, 1);
    canvas2d.fillStyle = "#000";
    canvas2d.fillStyle = css;
    canvas2d.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = canvas2d.getImageData(0, 0, 1, 1).data;
    const hex = (n) => n.toString(16).padStart(2, "0");
    return a === 255 ? `#${hex(r)}${hex(g)}${hex(b)}` : `rgba(${r}, ${g}, ${b}, ${+(a / 255).toFixed(3)})`;
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
    /** Un token (`--surface`) o un color CSS, ya resuelto para el tema de ahora, como "#rrggbb". */
    color(name) {
      const probe = document.createElement("span");
      probe.style.cssText = "position:absolute;visibility:hidden;color:" + (name.startsWith("--") ? `var(${name})` : name);
      root.appendChild(probe);
      const resolved = getComputedStyle(probe).color;
      probe.remove();
      return toHex(resolved);
    },
    onChange(fn) {
      if (typeof fn === "function") listeners.push(fn);
    },
  };

  // En modo auto el sistema puede cambiar de tema sin que la página haga nada.
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (read() === "auto") emit();
  });

  apply(read());
})();
