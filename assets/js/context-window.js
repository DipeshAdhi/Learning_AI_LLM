/* Contextbook — the context-window strip.
 *
 * One task ("refactor this PDF parser") assembled two ways, drawn to scale
 * inside a 200k window. The point of the visual is the hatched band: tokens
 * that were paid for on every single turn and never once read.
 *
 * Figures are modelled, not measured. Level 3 replaces them with real counts.
 */

(function () {
  'use strict';

  var WINDOW_TOKENS = 200000;
  var USD_PER_MTOK  = 3;

  var SCENARIOS = {
    monolithic: {
      segments: [
        { key: 'system',       label: 'System prompt and tool definitions',        tokens: 2400 },
        { key: 'skills-warm',  label: 'The one skill this task actually needed',   tokens: 3600 },
        { key: 'skills-cold',  label: 'Thirteen other skills, loaded regardless',  tokens: 47600, waste: true },
        { key: 'memory-warm',  label: 'Memory the model referred to',              tokens: 5200 },
        { key: 'memory-cold',  label: 'The rest of the memory bank',               tokens: 11600, waste: true },
        { key: 'convo',        label: 'Conversation and tool output so far',       tokens: 28400 }
      ],
      note: 'Every rule, every skill, every note in the bank — concatenated into the system ' +
            'prompt and resent on all forty turns of this session. Three fifths of that payload ' +
            'is never read. You are billed for it anyway, and the instructions that did matter ' +
            'sat buried in the middle, which is exactly where attention is weakest.'
    },
    progressive: {
      segments: [
        { key: 'system',       label: 'System prompt and tool definitions',        tokens: 2400 },
        { key: 'skill-index',  label: 'Skill index — name and description only',   tokens: 1260 },
        { key: 'skills-warm',  label: 'One skill body, opened on a match',         tokens: 3600 },
        { key: 'memory-warm',  label: 'Static memory files, cached at the front',  tokens: 5200 },
        { key: 'convo',        label: 'Conversation and tool output so far',       tokens: 28400 }
      ],
      note: 'The agent reads ninety tokens of metadata per skill, decides that one of them ' +
            'applies, and opens only that file. Static memory leads the payload so the cache ' +
            'holds it; the volatile turn goes last. Same task, same model, same answer — ' +
            'fifty-nine percent less window, and nothing important is buried.'
    }
  };

  var SWATCH = {
    'system':      'var(--ink)',
    'skills-warm': 'var(--sig)',
    'skill-index': 'var(--sig-pale)',
    'memory-warm': 'var(--mem)',
    'convo':       'var(--convo)',
    'skills-cold': 'repeating-linear-gradient(-45deg, var(--waste) 0 4px, var(--waste-pale) 4px 8px)',
    'memory-cold': 'repeating-linear-gradient(-45deg, var(--waste) 0 4px, var(--waste-pale) 4px 8px)'
  };

  var strip   = document.querySelector('[data-strip]');
  var legend  = document.querySelector('[data-legend]');
  var noteEl  = document.querySelector('[data-note]');
  var buttons = Array.prototype.slice.call(document.querySelectorAll('.mode-btn'));

  if (!strip || !legend || !noteEl) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var readoutTimers = {};

  function commas(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function total(segments) {
    return segments.reduce(function (sum, s) { return sum + s.tokens; }, 0);
  }

  function wasted(segments) {
    return segments.reduce(function (sum, s) { return s.waste ? sum + s.tokens : sum; }, 0);
  }

  /* Count between two values so the difference between architectures is felt,
     not just read. Skipped entirely when the visitor asked for less motion. */
  function setReadout(name, to, format) {
    var el = document.querySelector('[data-readout="' + name + '"]');
    if (!el) return;

    var from = parseFloat(el.dataset.value || '0');
    el.dataset.value = String(to);

    if (reduceMotion) { el.textContent = format(to); return; }

    if (readoutTimers[name]) cancelAnimationFrame(readoutTimers[name]);

    var start = performance.now();
    var span  = 620;

    function step(now) {
      var t = Math.min((now - start) / span, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(from + (to - from) * eased);
      if (t < 1) readoutTimers[name] = requestAnimationFrame(step);
    }
    readoutTimers[name] = requestAnimationFrame(step);
  }

  function light(key, on) {
    var seg = strip.querySelector('[data-key="' + key + '"]');
    if (seg) seg.classList.toggle('is-lit', on);
  }

  function render(mode) {
    var data     = SCENARIOS[mode];
    var used     = total(data.segments);
    var unread   = wasted(data.segments);

    /* strip ------------------------------------------------------- */
    strip.innerHTML = '';
    data.segments.forEach(function (s) {
      var el = document.createElement('div');
      el.className = 'seg seg-' + s.key;
      el.dataset.key = s.key;
      el.style.width = (s.tokens / WINDOW_TOKENS * 100) + '%';
      el.title = s.label + ' — ' + commas(s.tokens) + ' tokens';
      strip.appendChild(el);
    });

    strip.setAttribute(
      'aria-label',
      'Context window: ' + commas(used) + ' of ' + commas(WINDOW_TOKENS) +
      ' tokens used, of which ' + commas(unread) + ' are never read.'
    );

    /* readouts ---------------------------------------------------- */
    setReadout('used',   used,   function (v) { return commas(v); });
    setReadout('wasted', unread, function (v) { return commas(v); });
    setReadout('cost',   used / 1e6 * USD_PER_MTOK, function (v) { return '$' + v.toFixed(3); });

    var wastedEl = document.querySelector('[data-readout="wasted"]');
    if (wastedEl) wastedEl.style.color = unread > 0 ? 'var(--waste)' : 'var(--sig)';

    /* legend ------------------------------------------------------ */
    legend.innerHTML = '';
    data.segments.forEach(function (s) {
      var row = document.createElement('li');
      row.className = 'legend-row' + (s.waste ? ' is-waste' : '');
      row.tabIndex = 0;

      var pct = (s.tokens / WINDOW_TOKENS * 100).toFixed(1);
      row.innerHTML =
        '<span class="legend-swatch" style="background:' + SWATCH[s.key] + '"></span>' +
        '<span class="legend-label">' + s.label + (s.waste ? ' — never read' : '') + '</span>' +
        '<span class="legend-val">' + commas(s.tokens) + ' · ' + pct + '%</span>';

      ['mouseenter', 'focus'].forEach(function (evt) {
        row.addEventListener(evt, function () { light(s.key, true); });
      });
      ['mouseleave', 'blur'].forEach(function (evt) {
        row.addEventListener(evt, function () { light(s.key, false); });
      });

      legend.appendChild(row);
    });

    noteEl.textContent = data.note;
  }

  buttons.forEach(function (btn) {
    btn.setAttribute('aria-pressed', btn.classList.contains('is-active') ? 'true' : 'false');

    btn.addEventListener('click', function () {
      buttons.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      render(btn.dataset.mode);
    });
  });

  render('monolithic');
})();
