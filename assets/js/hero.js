/* Landing page motion.
 *
 * Two things only, because one moving idea at a time is the whole trick:
 *   1. a token stream that flows toward the context window and mostly bounces off
 *   2. scroll reveals + counters
 *
 * Everything checks prefers-reduced-motion first and degrades to a static,
 * complete page — no content is hidden behind an animation.
 */

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. the token stream ──────────────────────────────────────── */

  var canvas = document.getElementById('lp-canvas');

  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var tokens = [];
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var gate = { x: 0, y: 0, h: 0 };     // the "context window" the tokens aim for
    var running = true;

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gate.x = w * 0.72;
      gate.h = Math.min(h * 0.42, 300);
      gate.y = h / 2 - gate.h / 2;
    }

    function spawn() {
      var accepted = Math.random() < 0.34;   // most of what you send is never read
      return {
        x: -20 - Math.random() * w * 0.5,
        y: Math.random() * h,
        v: 0.7 + Math.random() * 1.7,
        s: 2 + Math.random() * 3.5,
        accepted: accepted,
        a: 0.25 + Math.random() * 0.5,
        turned: false
      };
    }

    for (var i = 0; i < 130; i++) {
      var t = spawn();
      t.x = Math.random() * w;             // pre-fill so it never starts empty
      tokens.push(t);
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      // the window itself: a tall soft-edged slot
      var g = ctx.createLinearGradient(gate.x, gate.y, gate.x, gate.y + gate.h);
      g.addColorStop(0, 'rgba(197,202,251,0)');
      g.addColorStop(0.5, 'rgba(197,202,251,0.85)');
      g.addColorStop(1, 'rgba(197,202,251,0)');
      ctx.fillStyle = g;
      ctx.fillRect(gate.x, gate.y, 1.5, gate.h);

      for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i];
        t.x += t.v;

        // at the boundary, the ones that were never going to be read peel away
        if (!t.turned && t.x >= gate.x) {
          t.turned = true;
          if (!t.accepted) {
            t.vy = (t.y < h / 2 ? -1 : 1) * (0.5 + Math.random() * 1.2);
          }
        }
        if (t.turned && !t.accepted) {
          t.y += t.vy;
          t.a *= 0.982;
        }

        var inGate = t.y > gate.y && t.y < gate.y + gate.h;
        ctx.globalAlpha = t.a;
        ctx.fillStyle = t.accepted
          ? (t.turned && inGate ? '#C5CAFB' : '#6F79F5')
          : (t.turned ? '#D31F5C' : '#4B5270');
        ctx.fillRect(t.x, t.y, t.s * 2.4, t.s);

        if (t.x > w + 40 || t.a < 0.03) tokens[i] = spawn();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(frame);

    /* Stop painting when the hero is off-screen — no point burning battery
       animating something nobody is looking at. */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !running) { running = true; requestAnimationFrame(frame); }
          else if (!e.isIntersecting) { running = false; }
        });
      }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { running = false; }
      else if (!running) { running = true; requestAnimationFrame(frame); }
    });
  }

  /* ── 2. scroll reveals ────────────────────────────────────────── */

  var revealables = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) || reduce) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
        if (e.target.hasAttribute('data-count')) count(e.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ── 3. counters ──────────────────────────────────────────────── */

  function count(host) {
    var el = host.querySelector('[data-to]');
    if (!el) return;
    var to = parseFloat(el.dataset.to);
    var suffix = el.dataset.suffix || '';
    var dp = parseInt(el.dataset.dp || '0', 10);

    if (reduce) { el.textContent = to.toFixed(dp) + suffix; return; }

    var start = performance.now(), dur = 1250;
    (function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * eased).toFixed(dp) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }

  if (reduce) {
    document.querySelectorAll('[data-count] [data-to]').forEach(function (el) {
      el.textContent = parseFloat(el.dataset.to).toFixed(parseInt(el.dataset.dp || '0', 10)) + (el.dataset.suffix || '');
    });
  }
})();
