// PityHub nav dropdowns — only one open at a time.
// The NTE and ZZZ header menus are <details class="navdrop"> elements.
// Native <details> elements open independently, so both could be open at
// once and overlap on screen (bug reported 8 Nov 2026). This script:
//  - closes all other .navdrop elements when one opens (toggle event);
//  - closes any open dropdown on a click outside the header nav;
//  - closes any open dropdown on Esc.
// It does not intercept clicks on links inside a dropdown, and does not
// touch the mobile CSS (<=640px the dropdowns render static in-flow).
(function () {
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

  // Click outside the header nav closes any open dropdown.
  document.addEventListener('click', function (e) {
    var nav = document.querySelector('header.site nav');
    if (nav && !nav.contains(e.target)) closeAll(null);
  });

  // Esc closes any open dropdown.
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });
})();
