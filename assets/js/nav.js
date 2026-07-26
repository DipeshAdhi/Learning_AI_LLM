/* Mobile navigation. Small enough to stay inline-simple: the menu is real
 * markup that starts hidden, so it still exists if this script never runs. */

(function () {
  'use strict';

  var toggle = document.querySelector('[data-nav-toggle]');
  var menu   = document.getElementById('mobile-nav');
  if (!toggle || !menu) return;

  function setOpen(open) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  toggle.addEventListener('click', function () {
    setOpen(menu.hidden);
  });

  /* Jumping to an anchor with the menu covering the page is disorienting. */
  menu.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
})();
