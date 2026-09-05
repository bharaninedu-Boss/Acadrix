/* ACADRIX UI enhancements — navigation, toggles and mobile UX */
(function () {
  'use strict';

  function setupMenu() {
    const button = document.getElementById('menuToggle');
    const nav = document.getElementById('navLinks');
    if (!button || !nav) return;

    const sync = () => {
      const open = nav.classList.contains('open');
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      button.textContent = open ? '✕' : '☰';
    };

    const originalToggle = window.toggleMenu;
    button.addEventListener('click', () => {
      // script.js already toggles the menu; sync after its listener runs.
      setTimeout(sync, 0);
    });

    document.addEventListener('click', (event) => {
      if (!nav.classList.contains('open')) return;
      if (!nav.contains(event.target) && !button.contains(event.target)) {
        nav.classList.remove('open');
        sync();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        sync();
        button.focus();
      }
    });

    nav.addEventListener('click', (event) => {
      if (event.target.closest('.nav-item')) {
        nav.classList.remove('open');
        sync();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        nav.classList.remove('open');
        sync();
      }
    });

    sync();
  }

  function setupThemeToggle() {
    const button = document.getElementById('themeToggle');
    if (!button) return;

    const sync = () => {
      const dark = document.body.classList.contains('dark-theme');
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
      button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    };

    button.addEventListener('click', () => setTimeout(sync, 0));
    sync();
  }

  function setupBackToTop() {
    if (document.getElementById('backToTop')) return;

    const button = document.createElement('button');
    button.id = 'backToTop';
    button.type = 'button';
    button.className = 'back-to-top';
    button.setAttribute('aria-label', 'Back to top');
    button.title = 'Back to top';
    button.textContent = '↑';
    document.body.appendChild(button);

    const update = () => {
      button.classList.toggle('visible', window.scrollY > 450);
    };
    window.addEventListener('scroll', update, { passive: true });
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    update();
  }

  function setupKeyboardCards() {
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const card = event.target.closest('.card[role="button"]');
      if (!card) return;
      event.preventDefault();
      card.click();
    });
  }

  function init() {
    setupMenu();
    setupThemeToggle();
    setupBackToTop();
    setupKeyboardCards();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
