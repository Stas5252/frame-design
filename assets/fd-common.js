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

    /* ---------- Счётчики, растущие вверх ---------- */
    var counters = [].slice.call(document.querySelectorAll('[data-fd-count]'));
    if (counters.length) {
      var runCounter = function (el) {
        var target = parseInt(el.getAttribute('data-fd-count'), 10) || 0;
        var started = null;
        var duration = 1600;
        var step = function (now) {
          if (started === null) started = now;
          var progress = Math.min((now - started) / duration, 1);
          // мягкое замедление к концу
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased).toLocaleString('ru-RU');
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };
      var inView = function (el) {
        var r = el.getBoundingClientRect();
        return r.top < window.innerHeight * 0.9 && r.bottom > 0;
      };
      var checkCounters = function () {
        counters = counters.filter(function (el) {
          if (!inView(el)) return true;
          runCounter(el);
          return false;
        });
        if (!counters.length) {
          window.removeEventListener('scroll', checkCounters);
          window.removeEventListener('resize', checkCounters);
        }
      };
      checkCounters();
      window.addEventListener('scroll', checkCounters, { passive: true });
      window.addEventListener('resize', checkCounters, { passive: true });
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

/* ============================================================
   ДОСТУПНОСТЬ (аудит 02.09.2026)
   Живёт здесь, а не в семи инлайновых скриптах: файл грузится
   на всех страницах и выполняется после них.
   ============================================================ */
(function () {
  'use strict';

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  onReady(function () {

    /* ---------- Бургер сообщает своё состояние ---------- */
    var burger = document.getElementById('burgerBtn');
    var drawer = document.getElementById('mobileDrawer');

    if (burger && drawer) {
      if (!drawer.id) drawer.id = 'mobileDrawer';
      burger.setAttribute('aria-controls', drawer.id);

      var syncBurger = function () {
        var open = drawer.classList.contains('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
      };
      syncBurger();

      if (window.MutationObserver) {
        new MutationObserver(syncBurger).observe(drawer, {
          attributes: true,
          attributeFilter: ['class']
        });
      } else {
        burger.addEventListener('click', function () { setTimeout(syncBurger, 0); });
      }

      /* Escape закрывает шторку и возвращает фокус на кнопку */
      document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape' && e.keyCode !== 27) return;
        if (!drawer.classList.contains('is-open')) return;
        if (typeof window.closeDrawer === 'function') {
          window.closeDrawer();
        } else {
          burger.classList.remove('is-active');
          drawer.classList.remove('is-open');
          document.body.style.overflow = '';
        }
        burger.focus();
      });
    }

    /* ---------- Страховка для блоков, появляющихся по скроллу ----------
       Если IntersectionObserver недоступен — показываем всё сразу.
       Иначе через 2,5 с открываем только то, что уже в зоне видимости,
       но почему-то осталось скрытым. Анимация ниже по странице сохраняется. */
    var revealAll = function (onlyVisible) {
      var hidden = document.querySelectorAll('.fd-fade:not(.is-visible)');
      Array.prototype.forEach.call(hidden, function (el) {
        if (!onlyVisible) { el.classList.add('is-visible'); return; }
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('is-visible');
      });
    };

    if (!('IntersectionObserver' in window)) {
      revealAll(false);
    } else {
      setTimeout(function () { revealAll(true); }, 2500);
    }

    /* ---------- Кнопки фильтра сообщают, какая нажата ---------- */
    var filterBtns = document.querySelectorAll('.fd-filter-btn');
    if (filterBtns.length) {
      Array.prototype.forEach.call(filterBtns, function (btn) {
        btn.addEventListener('click', function () {
          Array.prototype.forEach.call(filterBtns, function (b) {
            b.setAttribute('aria-pressed', b.classList.contains('is-active') ? 'true' : 'false');
          });
        });
      });
    }

    /* ---------- Модальное окно портфолио: клавиатура ---------- */
    var modal = document.getElementById('projectModal');
    if (modal) {
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-label', 'Карточка проекта');

      var lastFocused = null;

      var focusables = function () {
        return modal.querySelectorAll(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
      };

      var closeModal = function () {
        if (typeof window.closeModal === 'function') {
          window.closeModal();
        } else {
          modal.classList.remove('is-active');
          document.body.style.overflow = '';
        }
        if (lastFocused && lastFocused.focus) lastFocused.focus();
        lastFocused = null;
      };

      document.addEventListener('keydown', function (e) {
        if (!modal.classList.contains('is-active')) return;

        if (e.key === 'Escape' || e.keyCode === 27) {
          e.preventDefault();
          closeModal();
          return;
        }

        /* Фокус не убегает из открытого окна */
        if (e.key === 'Tab' || e.keyCode === 9) {
          var list = focusables();
          if (!list.length) return;
          var first = list[0];
          var last = list[list.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault(); last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault(); first.focus();
          }
        }
      });

      /* Запоминаем, откуда открыли, и уводим фокус внутрь окна */
      if (window.MutationObserver) {
        new MutationObserver(function () {
          if (!modal.classList.contains('is-active')) return;
          if (modal.contains(document.activeElement)) return;
          lastFocused = document.activeElement;
          var list = focusables();
          if (list.length) list[0].focus();
        }).observe(modal, { attributes: true, attributeFilter: ['class'] });
      }
    }
  });
})();
