/* JustiXia theme controller.
   Loaded synchronously in <head> to avoid FOUC.
   Storage key: jx_theme = "light" | "dark" | "auto" (default = auto). */

(function () {
  var KEY = 'jx_theme';
  var root = document.documentElement;

  function read() {
    try { return localStorage.getItem(KEY) || 'auto'; }
    catch (_) { return 'auto'; }
  }

  function apply(mode) {
    if (mode === 'light' || mode === 'dark') {
      root.setAttribute('data-theme', mode);
    } else {
      root.removeAttribute('data-theme');
    }
  }

  function set(mode) {
    try { localStorage.setItem(KEY, mode); } catch (_) {}
    apply(mode);
    document.dispatchEvent(new CustomEvent('jx:themechange', { detail: { mode: mode } }));
  }

  // 1. Apply immediately to avoid flash.
  apply(read());

  // 2. Public API.
  window.JxTheme = {
    get: read,
    set: set,
    cycle: function () {
      var current = read();
      // auto -> light -> dark -> auto
      var next = current === 'auto' ? 'light' : current === 'light' ? 'dark' : 'auto';
      set(next);
      return next;
    },
    toggle: function () {
      // Decide effective theme right now, then flip it (and persist).
      var current = read();
      var effective;
      if (current === 'light' || current === 'dark') {
        effective = current;
      } else {
        effective = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      set(effective === 'dark' ? 'light' : 'dark');
    }
  };

  // 3. Wire up any existing toggle buttons after DOM ready.
  function bind() {
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () { window.JxTheme.toggle(); });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }

  // 4. Reusable HTML snippet for the toggle button (sun + moon SVGs).
  window.JxTheme.buttonHTML = function () {
    return '<button type="button" class="theme-toggle" data-theme-toggle aria-label="Changer de thème">'
      + '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
      + '<svg class="icon-sun"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>'
      + '</button>';
  };
})();
