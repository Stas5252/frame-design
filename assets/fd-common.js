/* ============================================================
   FRAME DESIGN — общий скрипт для всех страниц
   Шапка без «прыжков», подсветка за курсором, форма записи.
   ============================================================ */
(function () {
  'use strict';

  var ready = function (fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  };

  ready(function () {
    /* ---------- Шапка: меняем только фон, высота постоянная ---------- */
    var header = document.querySelector('.fd-header');
    if (header) {
      // убираем инлайновые размеры, если их успел выставить старый скрипт
      header.style.padding = '';
      var syncHeader = function () {
        header.classList.toggle('is-scrolled', window.pageYOffset > 40);
        header.style.padding = '';
      };
      syncHeader();
      window.addEventListener('scroll', syncHeader, { passive: true });
      window.addEventListener('resize', syncHeader, { passive: true });
    }

    /* ---------- Плавная прокрутка к якорям с учётом шапки ---------- */
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var offset = header ? header.offsetHeight + 12 : 0;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
        if (typeof window.closeDrawer === 'function') window.closeDrawer();
      });
    });

    var coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;

    /* ---------- Подсветка, следующая за курсором (весь сайт) ---------- */
    if (!coarse) {
      var glow = document.createElement('div');
      glow.className = 'fd-cursor-glow';
      document.body.appendChild(glow);

      var tx = window.innerWidth / 2, ty = window.innerHeight / 2;
      var cx = tx, cy = ty, raf = null;

      var loop = function () {
        cx += (tx - cx) * 0.14;
        cy += (ty - cy) * 0.14;
        glow.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
        raf = Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4
          ? requestAnimationFrame(loop)
          : null;
      };

      document.addEventListener('mousemove', function (e) {
        tx = e.clientX;
        ty = e.clientY;
        glow.classList.add('is-active');
        if (!raf) raf = requestAnimationFrame(loop);
      }, { passive: true });

      document.addEventListener('mouseleave', function () {
        glow.classList.remove('is-active');
      });

      /* ---------- Пятно света внутри карточек ---------- */
      var cardSelector = [
        '.fd-category', '.fd-comp-card', '.fd-exhibit-card', '.fd-process__item',
        '.fd-pillar-card', '.fd-project-card', '.fd-tech-pillar', '.fd-card',
        '.fd-gallery-item', '.fd-contact-card', '.fd-info-block', '.fd-booking__form',
        '.fd-form-container', '.fd-visit__card', '.fd-invite__card', '.fd-about__img',
        '.fd-spec-card', '.fd-step-card'
      ].join(',');

      document.querySelectorAll(cardSelector).forEach(function (card) {
        if (card.querySelector(':scope > .fd-spotlight')) return;
        var layer = document.createElement('span');
        layer.className = 'fd-spotlight';
        card.insertBefore(layer, card.firstChild);
        card.classList.add('fd-has-spot');
        card.addEventListener('mousemove', function (e) {
          var r = card.getBoundingClientRect();
          card.style.setProperty('--fd-mx', (e.clientX - r.left) + 'px');
          card.style.setProperty('--fd-my', (e.clientY - r.top) + 'px');
        }, { passive: true });
      });
    }

    /* ---------- Формы записи в салон ---------- */
    document.querySelectorAll('.fd-booking__form').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var ok = true;
        form.querySelectorAll('[required]').forEach(function (field) {
          var empty = !String(field.value || '').trim();
          field.classList.toggle('is-invalid', empty);
          if (empty) ok = false;
        });
        if (!ok) return;
        form.classList.add('is-sent');
      });
      form.querySelectorAll('.fd-field').forEach(function (field) {
        field.addEventListener('input', function () {
          field.classList.remove('is-invalid');
        });
      });
    });
  });
})();
