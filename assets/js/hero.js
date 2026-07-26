/* Landing page motion.
 *
 * The hero is the argument, not decoration: tokens stream toward the context
 * window, and at the boundary they resolve into the site's semantic colours —
 *   blue  = in flight, not yet judged
 *   green = read and used
 *   red   = sent, paid for, never read
 *
 * Everything checks prefers-reduced-motion first and degrades to a static,
 * complete page. No content is hidden behind an animation.
 */

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var COLOR = {
    inFlight: '#3C4470',   // base blue, muted
    ok:       '#2E8F62',   // green: read
    okBright: '#4FB183',
    bad:      '#C0224E',   // red: never read
    gate:     'rgba(169,179,242,0.75)'
  };

  /* ── 1. the token stream ──────────────────────────────────────── */

  var canvas = document.getElementById('lp-canvas');

  if (canvas && !reduce) {
    var ctx = canvas.getContext('2d');
    var tokens = [];
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var gate = { x: 0, y: 0, h: 0 };
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

    function spawn(prefill) {
      return {
        x: prefill ? Math.random() * w : -20 - Math.random() * w * 0.5,
        y: Math.random() * h,
        v: 0.7 + Math.random() * 1.7,
        s: 2 + Math.random() * 3.5,
        read: Math.random() < 0.34,   // most of what you send is never read
        a: 0.22 + Math.random() * 0.45,
        turned: false,
        vy: 0
      };
    }

    for (var i = 0; i < 130; i++) tokens.push(spawn(true));

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);

      // the window itself: a tall soft-edged slot
      var g = ctx.createLinearGradient(gate.x, gate.y, gate.x, gate.y + gate.h);
      g.addColorStop(0, 'rgba(169,179,242,0)');
      g.addColorStop(0.5, COLOR.gate);
      g.addColorStop(1, 'rgba(169,179,242,0)');
      ctx.fillStyle = g;
      ctx.fillRect(gate.x, gate.y, 1.5, gate.h);

      for (var i = 0; i < tokens.length; i++) {
        var t = tokens[i];
        t.x += t.v;

        // at the boundary each token resolves: read, or peeled away unread
        if (!t.turned && t.x >= gate.x) {
          t.turned = true;
          if (!t.read) t.vy = (t.y < h / 2 ? -1 : 1) * (0.5 + Math.random() * 1.2);
        }
        if (t.turned && !t.read) {
          t.y += t.vy;
          t.a *= 0.982;
        }

        var inGate = t.y > gate.y && t.y < gate.y + gate.h;
        ctx.globalAlpha = t.a;
        ctx.fillStyle = !t.turned ? COLOR.inFlight
                      : t.read    ? (inGate ? COLOR.okBright : COLOR.ok)
                                  : COLOR.bad;
        ctx.fillRect(t.x, t.y, t.s * 2.4, t.s);

        if (t.x > w + 40 || t.a < 0.03) tokens[i] = spawn(false);
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
      if (document.hidden) running = false;
      else if (!running) { running = true; requestAnimationFrame(frame); }
    });
  }

  /* ── 2. scroll reveals ────────────────────────────────────────── */

  var revealables = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window) || reduce) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
        if (e.target.hasAttribute('data-count')) count(e.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });

    /* Failsafe. IntersectionObserver callbacks are throttled in background
       tabs and can be missed entirely. Content must never depend on an
       animation firing, so anything still hidden gets shown regardless. */
    setTimeout(function () {
      Array.prototype.forEach.call(revealables, function (el) {
        if (!el.classList.contains('is-in')) {
          el.classList.add('is-in');
          if (el.hasAttribute('data-count')) count(el);
        }
      });
    }, 2600);
  }

  /* ── 3. counters ──────────────────────────────────────────────── */

  function finish(el) {
    var dp = parseInt(el.dataset.dp || '0', 10);
    el.textContent = parseFloat(el.dataset.to).toFixed(dp) + (el.dataset.suffix || '');
    el.dataset.done = '1';
  }

  function count(host) {
    var el = host.querySelector('[data-to]');
    if (!el || el.dataset.done) return;
    var to = parseFloat(el.dataset.to);
    var suffix = el.dataset.suffix || '';
    var dp = parseInt(el.dataset.dp || '0', 10);

    if (reduce) { finish(el); return; }

    var start = performance.now(), dur = 1250;
    (function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * eased).toFixed(dp) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else finish(el);
    })(start);

    /* rAF is paused in a hidden tab. Without this, a count interrupted
       part-way would sit on screen showing a wrong number forever — which
       on a page of statistics is a correctness bug, not a visual one. */
    setTimeout(function () { if (!el.dataset.done) finish(el); }, dur + 250);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    Array.prototype.forEach.call(document.querySelectorAll('[data-count] [data-to]'), function (el) {
      if (!el.dataset.done && el.closest('.reveal').classList.contains('is-in')) finish(el);
    });
  });

  if (reduce) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-count] [data-to]'), function (el) {
      finish(el);
    });
  }
})();
