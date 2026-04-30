(function () {
    // 1. Обробка прозорості шапки при скролі
    const header = document.querySelector('.header');

    if (header) {
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 50) {
                header.classList.add('header_activ');
            } else {
                header.classList.remove('header_activ');
            }
        });
    }

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
            if (header) {
                header.style.opacity = '1';
                header.style.pointerEvents = 'auto';

                if (checkVideoGidInViewport() && window.innerWidth > 800) {
                    hideTimeout = setTimeout(() => {
                        header.style.opacity = '0';
                        header.style.pointerEvents = 'none';
                    }, 3000);
                }
            }
        });
    }

    // 3. ПРЕМІАЛЬНЕ БУРГЕР-МЕНЮ
    const burgerItem = document.querySelector('.header__burger');
    const menu = document.querySelector('.header__nav');
    const menuLinks = document.querySelectorAll('.header__link');

    if (burgerItem && menu) {
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

    if (menuLinks) {
        menuLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 992 && burgerItem && menu) {
                    burgerItem.classList.remove('active');
                    menu.classList.remove('active');
                    document.body.style.overflow = 'visible';
                }
            });
        });
    }

    // 4. Швидкий та плавний скрол
    const scrollLinks = document.querySelectorAll('.js-scroll');

    if (scrollLinks) {
        scrollLinks.forEach(link => {
            link.addEventListener('click', function (e) {
                const targetId = this.getAttribute('href');
                
                // Перевіряємо, чи це дійсно якірне посилання, щоб скрипт не ламався
                if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                    e.preventDefault();
                    const headerHeight = header ? header.clientHeight : 0;
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        const offset = 100;
                        const targetPosition = targetElement.offsetTop - headerHeight - offset;

                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    // 5. МОДАЛЬНІ ВІКНА (ТІЛЬКИ СПРАВЖНІ ВІКНА)
    const modalLinks = document.querySelectorAll(".places__card-link, .places__view, .js-open-methods");

    if (modalLinks) {
        modalLinks.forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                
                let modalId = this.getAttribute("data-modal");
                
                // Якщо немає data-modal, безпечно дістаємо ID з href
                if (!modalId) {
                    const href = this.getAttribute("href");
                    if (href && href.startsWith("#") && href.length > 1) {
                        modalId = href.substring(1);
                    }
                }
                
                if (modalId) {
                    const modal = document.getElementById(modalId);
                    if (modal) {
                        modal.classList.add("active"); 
                        modal.style.display = "flex";  
                        document.body.style.overflow = "hidden";
                    }
                }
            });
        });
    }

    // 6. Закриття модалок
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal__close") || 
            e.target.classList.contains("modal") || 
            e.target.classList.contains("close-button")) {
            
            const activeModal = e.target.closest(".modal");
            if (activeModal) {
                activeModal.classList.remove("active");
                activeModal.style.display = "none";
                
                if (!menu || !menu.classList.contains('active')) {
                    document.body.style.overflow = 'visible';
                }
            }
        }
    });

}());