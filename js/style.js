(function () {
    // 1. Обробка прозорості шапки при скролі
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 50) {
            header.classList.add('header_activ');
        } else {
            header.classList.remove('header_activ');
        }
    });

    // 2. Розумне приховування шапки біля відео (тільки для десктопа)
    const videoGid = document.querySelector('.video__element');
    let hideTimeout;

    if (videoGid) {
        function checkVideoGidInViewport() {
            const rect = videoGid.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        }

        window.addEventListener('scroll', () => {
            clearTimeout(hideTimeout);
            header.style.opacity = '1';
            header.style.pointerEvents = 'auto';

            if (checkVideoGidInViewport() && window.innerWidth > 800) {
                hideTimeout = setTimeout(() => {
                    header.style.opacity = '0';
                    header.style.pointerEvents = 'none';
                }, 3000);
            }
        });
    }

    // 3. ПРЕМІАЛЬНЕ БУРГЕР-МЕНЮ (Синхронізовано з CSS)
    const burgerItem = document.querySelector('.header__burger');
    const menu = document.querySelector('.header__nav');
    const menuLinks = document.querySelectorAll('.header__link');

    if (burgerItem) {
        burgerItem.addEventListener('click', () => {
            burgerItem.classList.toggle('active');
            menu.classList.toggle('active');

            if (menu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'visible';
            }
        });
    }

    // Закриття меню при кліку на посилання
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                burgerItem.classList.remove('active');
                menu.classList.remove('active');
                document.body.style.overflow = 'visible';
            }
        });
    });

    // 4. Швидкий та плавний скрол (З ОФСЕТОМ ДЛЯ "ПОСЛУГ")
    const scrollLinks = document.querySelectorAll('.js-scroll');

    scrollLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const headerHeight = header ? header.clientHeight : 0;
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                const offset = 100;
                const targetPosition = targetElement.offsetTop - headerHeight - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 5. МОДАЛЬНІ ВІКНА
    const modalLinks = document.querySelectorAll(".places__card-link, .places__view");

    modalLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const modalId = this.getAttribute("data-modal");
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = "flex";
                document.body.style.overflow = "hidden";
            }
        });
    });

    // Закриття модалок
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal__close") || e.target.classList.contains("modal")) {
            const activeModal = e.target.closest(".modal") || e.target;
            activeModal.style.display = "none";
            
            if (!menu.classList.contains('active')) {
                document.body.style.overflow = 'visible';
            }
        }
    });

}());