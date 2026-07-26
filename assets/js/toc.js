/* Table-of-contents scroll spy.
 *
 * The complaint this solves: on a long page you lose track of where you are.
 * The sidebar link for the section you are reading stays highlighted, so the
 * page always answers "where am I" without you having to work it out.
 */

(function () {
  'use strict';

  var toc = document.querySelector('[data-toc]');
  if (!toc) return;

  var links = Array.prototype.slice.call(toc.querySelectorAll('a[href^="#"]'));
  if (!links.length) return;

  var sections = links
    .map(function (link) {
      var el = document.querySelector(link.getAttribute('href'));
      return el ? { link: link, el: el } : null;
    })
    .filter(Boolean);

  if (!sections.length) return;

  var current = null;

  function setCurrent(entry) {
    if (entry === current) return;
    if (current) current.link.classList.remove('is-current');
    entry.link.classList.add('is-current');
    entry.link.setAttribute('aria-current', 'true');
    if (current) current.link.removeAttribute('aria-current');
    current = entry;
  }

  /* Whichever section heading is highest on screen while still above the
     reading line wins. Simpler and steadier than IntersectionObserver
     thresholds when sections are wildly different heights. */
  function update() {
    var line = window.scrollY + 140;
    var active = sections[0];

    for (var i = 0; i < sections.length; i++) {
      if (sections[i].el.offsetTop <= line) active = sections[i];
    }

    /* At the very bottom the last section may never reach the line. */
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 4) {
      active = sections[sections.length - 1];
    }

    setCurrent(active);
  }

  /* Time-based throttle rather than requestAnimationFrame: rAF is paused in
     hidden tabs, and a scroll during that pause would leave a "pending" flag
     stuck forever, killing the spy even after the tab came back. */
  var last = 0;
  function onScroll() {
    var now = Date.now();
    if (now - last < 80) return;
    last = now;
    update();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
