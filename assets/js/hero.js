/* Landing page motion — hairline convergence field.
 *
 * Everything a model is given converges on one point: the context window.
 * Rays fan out to the left; tokens travel inward along them. At the boundary
 * each one resolves into the site's semantic colours —
 *   white/blue = in flight, not yet judged
 *   green      = read and used
 *   red        = sent, paid for, never read
 *
 * Drawn as 1px strokes and small dots on pure black. No blur, no fills.
 * Respects prefers-reduced-motion by painting a single static frame.
 */

(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var C = {
    ray:    'rgba(255,255,255,0.10)',
    rayLit: 'rgba(255,255,255,0.26)',
    orbit:  'rgba(255,255,255,0.13)',
    label:  'rgba(255,255,255,0.20)',
    flight: 'rgba(190,198,255,0.75)',
    ok:     '#3FA277',
    bad:    '#C0224E',
    core:   'rgba(120,132,255,0.95)'
  };

  var GLYPHS = ['0','1','d','o','s','a','1','0','t','k','n','e'];

  var canvas = document.getElementById('lp-canvas');

  if (canvas) {
    var ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var focal = { x: 0, y: 0 };
    var rays = [], dots = [], labels = [];
    var rafId = null, visible = true, t0 = performance.now();

    function start() {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(frame);
    }
    function stop() {
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    }

    function build() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      focal.x = w * 0.80;
      focal.y = h * 0.5;

      // rays fan leftward from the focal point, off the left edge
      rays = [];
      var n = Math.max(26, Math.round(w / 26));
      for (var i = 0; i < n; i++) {
        var spread = 0.78;                       // radians, total fan
        var a = Math.PI + (i / (n - 1) - 0.5) * spread;
        rays.push({ a: a, lit: Math.random() < 0.16 });
      }

      // tokens travelling inward along a ray
      dots = [];
      for (var j = 0; j < 150; j++) dots.push(spawn(true));

      // sparse mono glyphs, the way a technical plot is annotated
      labels = [];
      for (var k = 0; k < 10; k++) {
        labels.push({
          x: w * 0.42 + Math.random() * w * 0.58,
          y: Math.random() * h,
          g: GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
        });
      }
    }

    function spawn(prefill) {
      var ray = rays[Math.floor(Math.random() * rays.length)];
      return {
        ray: ray,
        d: prefill ? Math.random() : 1,          // 1 = far out, 0 = at focal
        v: 0.0011 + Math.random() * 0.0026,
        r: 0.6 + Math.random() * 1.5,
        read: Math.random() < 0.34,              // most is never read
        past: 0                                   // travel after the boundary
      };
    }

    function draw(now) {
      var spin = (now - t0) * 0.00004;
      ctx.clearRect(0, 0, w, h);

      var reach = Math.max(w, h) * 1.15;

      // ── rays ───────────────────────────────────────────────
      ctx.lineWidth = 1;
      for (var i = 0; i < rays.length; i++) {
        var ry = rays[i];
        var ex = focal.x + Math.cos(ry.a) * reach;
        var ey = focal.y + Math.sin(ry.a) * reach;
        /* Bright at the window, fading to nothing outward — keeps the
           headline readable and reads as convergence rather than noise. */
        var grad = ctx.createLinearGradient(focal.x, focal.y, ex, ey);
        grad.addColorStop(0, ry.lit ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.16)');
        grad.addColorStop(0.45, ry.lit ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.05)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(focal.x, focal.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      }

      // ── orbit ellipses around the window ───────────────────
      ctx.strokeStyle = C.orbit;
      for (var o = 0; o < 3; o++) {
        ctx.save();
        ctx.translate(focal.x, focal.y);
        ctx.rotate(spin + o * Math.PI / 3);
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.min(w, h) * 0.30, Math.min(w, h) * 0.115, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // ── the window itself: a small bright core ─────────────
      ctx.fillStyle = C.core;
      ctx.beginPath();
      ctx.arc(focal.x, focal.y, 2.4, 0, Math.PI * 2);
      ctx.fill();

      // ── tokens ─────────────────────────────────────────────
      for (var j = 0; j < dots.length; j++) {
        var p = dots[j];
        var x, y, col, alpha;

        if (p.d > 0) {
          p.d -= p.v;
          var dist = p.d * reach;
          x = focal.x + Math.cos(p.ray.a) * dist;
          y = focal.y + Math.sin(p.ray.a) * dist;
          col = C.flight;
          alpha = 0.25 + (1 - p.d) * 0.6;
        } else {
          // resolved: read tokens pass through, unread ones scatter back out
          p.past += p.read ? 0.9 : 1.5;
          if (p.read) {
            x = focal.x + p.past * 0.5;
            y = focal.y + Math.sin(p.past * 0.05) * 2;
            col = C.ok;
          } else {
            var away = p.ray.a + Math.PI + (p.ray.a > Math.PI ? 0.5 : -0.5);
            x = focal.x + Math.cos(away) * p.past;
            y = focal.y + Math.sin(away) * p.past;
            col = C.bad;
          }
          alpha = Math.max(0, 1 - p.past / 110);
        }

        if (alpha <= 0.02 || x > w + 30 || x < -30 || y < -30 || y > h + 30) {
          dots[j] = spawn(false);
          continue;
        }

        ctx.globalAlpha = alpha;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ── annotations ────────────────────────────────────────
      ctx.fillStyle = C.label;
      ctx.font = '11px "JetBrains Mono", monospace';
      for (var k = 0; k < labels.length; k++) {
        ctx.fillText(labels[k].g, labels[k].x, labels[k].y);
      }
    }

    function frame(now) {
      rafId = null;
      if (!visible) return;
      draw(now);
      rafId = requestAnimationFrame(frame);
    }

    build();
    if (reduce) {
      draw(performance.now());                   // one static frame, no loop
    } else {
      window.addEventListener('resize', function () { build(); start(); });
      start();

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            visible = e.isIntersecting;
            if (visible) start(); else stop();
          });
        }, { threshold: 0 }).observe(canvas);
      }

      /* rAF handles issued while hidden are never delivered, so resuming has
         to cancel the stale one and schedule fresh — otherwise the loop dies
         permanently the first time the tab is backgrounded. */
      document.addEventListener('visibilitychange', function () {
        if (document.hidden) stop();
        else if (visible) start();
      });
    }
  }

  /* ── scroll reveals ───────────────────────────────────────────── */

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

    /* Content must never depend on an animation firing. */
    setTimeout(function () {
      Array.prototype.forEach.call(revealables, function (el) {
        if (!el.classList.contains('is-in')) {
          el.classList.add('is-in');
          if (el.hasAttribute('data-count')) count(el);
        }
      });
    }, 2600);
  }

  /* ── counters ─────────────────────────────────────────────────── */

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

    var began = performance.now(), dur = 1250;
    (function step(now) {
      var p = Math.min((now - began) / dur, 1);
      el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(dp) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else finish(el);
    })(began);

    /* A count frozen part-way would display a wrong statistic forever. */
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
