/* Ardansyah Falah — portfolio v2. No dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme: light by default, "Dusk" on request (or system dark). */
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  function setTheme(name) {
    if (name === 'dusk') root.setAttribute('data-theme', 'dusk'); else root.removeAttribute('data-theme');
    try { localStorage.setItem('theme', name); } catch (e) {}
    if (toggle) {
      var dusk = name === 'dusk';
      toggle.setAttribute('aria-label', dusk ? 'Switch to light theme' : 'Switch to Dusk theme');
      toggle.title = dusk ? 'Light theme' : 'Dusk theme';
    }
  }
  if (toggle) {
    setTheme(root.getAttribute('data-theme') === 'dusk' ? 'dusk' : 'light');
    toggle.addEventListener('click', function () {
      setTheme(root.getAttribute('data-theme') === 'dusk' ? 'light' : 'dusk');
    });
  }

  /* Mobile menu */
  var nav = document.getElementById('nav');
  var menuBtn = document.getElementById('menuBtn');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.querySelectorAll('.mobile-menu a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* Systems board: rows check in one by one on load (the page's single orchestrated moment). */
  var board = document.getElementById('board');
  if (board) {
    if (reduceMotion) board.classList.add('ready');
    else requestAnimationFrame(function () { setTimeout(function () { board.classList.add('ready'); }, 250); });
  }

  /* Section reveal: a quiet fade only, no slide. */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* Current section in the nav */
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && targets.length) {
    var current = null;
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          current = en.target.id;
          links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + current ? 'true' : 'false'); });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* NOMAD tour: chapter tabs swap the screenshot. */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tour-steps [role="tab"]'));
  var img = document.getElementById('tourImg');
  var cap = document.getElementById('tourCap');
  var frame = document.getElementById('tourFrame');
  function pick(btn, focus) {
    tabs.forEach(function (b) { b.setAttribute('aria-selected', b === btn ? 'true' : 'false'); b.tabIndex = b === btn ? 0 : -1; });
    var title = btn.querySelector('b').textContent;
    var src = btn.getAttribute('data-img');
    if (img && src && img.getAttribute('src') !== src) {
      frame.classList.remove('fade'); void frame.offsetWidth;
      img.setAttribute('src', src);
      img.setAttribute('alt', 'NOMAD Pocket: ' + title);
      if (btn.getAttribute('data-fit') === 'contain') img.setAttribute('data-fit', 'contain'); else img.removeAttribute('data-fit');
      frame.classList.add('fade');
    }
    if (cap) cap.innerHTML = '<b>' + title + '.</b> ' + (btn.getAttribute('data-cap') || '');
    if (focus) btn.focus();
    if (window.innerWidth < 900 && btn.scrollIntoView) btn.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  if (tabs.length && img) {
    tabs.forEach(function (b, i) {
      b.tabIndex = i === 0 ? 0 : -1;
      b.addEventListener('click', function () { pick(b, false); });
      b.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); pick(n, true); }
      });
    });
    // Preload the other frames once the page is idle so switching is instant.
    var warm = function () { tabs.forEach(function (b) { var s = b.getAttribute('data-img'); if (s) { var im = new Image(); im.src = s; } }); };
    if ('requestIdleCallback' in window) requestIdleCallback(warm); else setTimeout(warm, 1500);
  }
})();
