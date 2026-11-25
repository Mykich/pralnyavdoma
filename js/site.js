// Pralnya Vdoma: шапка, мобільне меню, модальні вікна, мобільна панель замовлення.
(function () {
    var header = document.querySelector('.header');
    var burger = document.getElementById('burger');
    var nav = document.getElementById('nav');
    var bar = document.querySelector('.mobile-bar');
    var hero = document.querySelector('.hero');
    var openModal = null;
    var lastFocus = null;

    function lockScroll() {
        var locked = (nav && nav.classList.contains('is-open')) || openModal;
        document.body.classList.toggle('no-scroll', !!locked);
    }

    // Шапка з тонкою лінією після прокрутки + мобільна панель після першого екрана
    function onScroll() {
        var y = window.scrollY;
        if (header) header.classList.toggle('is-scrolled', y > 10);
        if (bar && hero) bar.classList.toggle('is-visible', y > hero.offsetHeight * 0.6);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Мобільне меню
    function setMenu(open) {
        if (!nav || !burger) return;
        nav.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
        lockScroll();
    }
    if (burger) burger.addEventListener('click', function () {
        setMenu(!nav.classList.contains('is-open'));
    });
    if (nav) nav.addEventListener('click', function (e) {
        if (e.target.closest('a')) setMenu(false);
    });

    // Модальні вікна: будь-який елемент з data-modal="id"
    function closeModal() {
        if (!openModal) return;
        openModal.hidden = true;
        openModal = null;
        lockScroll();
        if (lastFocus) lastFocus.focus();
    }
    function showModal(id, trigger) {
        var m = document.getElementById(id);
        if (!m) return;
        if (openModal) { openModal.hidden = true; } else { lastFocus = trigger || document.activeElement; }
        setMenu(false);
        m.hidden = false;
        openModal = m;
        lockScroll();
        var close = m.querySelector('.modal__close');
        if (close) close.focus();
    }
    document.addEventListener('click', function (e) {
        var t = e.target.closest('[data-modal]');
        if (t) { e.preventDefault(); showModal(t.getAttribute('data-modal'), t); return; }
        if (e.target.classList.contains('modal') || e.target.closest('.modal__close')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            if (openModal) closeModal();
            else if (nav && nav.classList.contains('is-open')) setMenu(false);
        }
    });
}());
