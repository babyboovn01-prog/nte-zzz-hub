// PityHub nav — dropdowns (one open at a time) + mobile hamburger menu.
// The NTE and ZZZ header menus are <details class="navdrop"> elements.
// Native <details> elements open independently, so both could be open at
// once and overlap on screen (bug reported 8 Nov 2026). This script:
//  - closes all other .navdrop elements when one opens (toggle event);
//  - closes any open dropdown on a click outside the header nav;
//  - closes any open dropdown on Esc.
// Mobile (<=640px, added 8 Nov 2026): the header shows a hamburger button
// (.nav-toggle) instead of the full nav. Tapping it toggles .nav-open on
// header.site, which CSS uses to show/hide the nav. The toggle:
//  - updates aria-expanded so screen readers know the menu state;
//  - closes any open dropdown when the menu is closed;
//  - closes the menu when a nav link is tapped, on Esc, on a click outside
//    the header, and automatically when the viewport grows past 640px.
// Desktop layout is untouched: .nav-toggle is display:none above 640px.
(function () {
  var header = document.querySelector('header.site');
  var toggle = document.querySelector('.nav-toggle');

  // --- Hamburger menu (mobile only; button is hidden by CSS on desktop) ---
  function closeMenu() {
    if (!header || !header.classList.contains('nav-open')) return;
    header.classList.remove('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
  function openMenu() {
    if (!header) return;
    header.classList.add('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
  }
  if (header && toggle) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (header.classList.contains('nav-open')) {
        closeMenu();
        closeAll(null);
      } else {
        openMenu();
      }
    });
    // Tapping a nav link closes the mobile menu.
    header.querySelectorAll('nav a').forEach(function (a) {
      a.addEventListener('click', function () { closeMenu(); });
    });
    // Widening past the mobile breakpoint clears the mobile state.
    window.addEventListener('resize', function () {
      if (window.innerWidth > 640) closeMenu();
    });
  }

  // --- Dropdowns: one open at a time ---
  var drops = Array.prototype.slice.call(
    document.querySelectorAll('details.navdrop')
  );
  if (!drops.length) return;

  function closeAll(except) {
    drops.forEach(function (d) {
      if (d !== except && d.open) d.removeAttribute('open');
    });
  }

  drops.forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (d.open) closeAll(d);
    });
  });

  // Click outside the header nav closes any open dropdown; a click outside
  // the whole header also closes the mobile menu.
  document.addEventListener('click', function (e) {
    var nav = document.querySelector('header.site nav');
    if (nav && !nav.contains(e.target)) closeAll(null);
    if (header && !header.contains(e.target)) closeMenu();
  });

  // Esc closes any open dropdown and the mobile menu.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeAll(null); closeMenu(); }
  });
})();
