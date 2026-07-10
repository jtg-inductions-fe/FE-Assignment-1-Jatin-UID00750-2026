const MENU_BTN = document.querySelector('.icon-menu');
const MENU_CLOSE_BTN = document.querySelector('.icon-menu-close');
const NAVBAR = document.querySelector('.navbar');
const NAVBAR_MENU = document.querySelector('.navbar__menu');
const NAVBAR_LINKS = document.querySelectorAll('.navbar__link');
const NAVBAR_LOGO = document.querySelector('.navbar__logo');

// function to trap focus of elements in the menu dialog
const trapFocus = (e) => {
    if (e.key !== 'Tab') return;
    let lastElement = document.querySelector('.navbar__menu > *:last-child');
    if (lastElement.classList.contains('navbar__buttons-layout')) {
        lastElement = lastElement.querySelectorAll('.btn')[1];
    } else {
        lastElement = lastElement.querySelector('.navbar__link');
    }
    // If Tab on the last element, wrap around to the first
    if (document.activeElement === lastElement) {
        MENU_CLOSE_BTN.focus();
        e.preventDefault();
    }
};

// function to open menu
const openMenu = () => {
    NAVBAR_MENU.classList.add('navbar__menu--active');
    MENU_BTN.classList.add('icon-menu--hidden');
    MENU_CLOSE_BTN.classList.remove('icon-menu-close--hidden');
    NAVBAR_LINKS.forEach((link) => {
        link.setAttribute('tabindex', 0);
    });
    const NAVBAR_MENU_AUTH_BUTTONS =
        document.querySelectorAll('.navbar__menu .btn');
    NAVBAR_MENU_AUTH_BUTTONS.forEach((btn) => {
        btn.setAttribute('tabindex', 0);
    });

    // trap focus inside the menu dialog
    document.addEventListener('keydown', trapFocus);
};

//function to close menu
const closeMenu = () => {
    NAVBAR_MENU.classList.remove('navbar__menu--active');
    MENU_CLOSE_BTN.classList.add('icon-menu-close--hidden');
    MENU_BTN.classList.remove('icon-menu--hidden');
    NAVBAR_LINKS.forEach((link) => {
        link.setAttribute('tabindex', -1);
    });
    const NAVBAR_MENU_AUTH_BUTTONS =
        document.querySelectorAll('.navbar__menu .btn');
    NAVBAR_MENU_AUTH_BUTTONS.forEach((btn) => {
        btn.setAttribute('tabindex', -1);
    });

    // trap focus inside the menu dialog
    document.removeEventListener('keydown', trapFocus);
};

MENU_BTN.addEventListener('click', openMenu);
MENU_CLOSE_BTN.addEventListener('click', closeMenu);

// close the menu if esc key is pressed
document.addEventListener('keydown', (event) => {
    if (
        event.key === 'Escape' &&
        NAVBAR_MENU.classList.contains('navbar__menu--active')
    ) {
        closeMenu();
    }
});

/* constants for mobile and tablet screens */

const IS_MOBILE = window.matchMedia('(max-width: 1023px)');
const IS_TABLET = window.matchMedia(
    '(min-width: 1024px) and (max-width: 1440px)',
);
const IS_MOBILE_AND_TABLET = window.matchMedia('(max-width: 1440px)');

// function to handle navbar-buttons dynamic appearance in the navbar
const handleScreenChangeForMobile = (e) => {
    const EXISTING_BUTTONS = document.querySelector('.navbar__buttons-layout');
    // Remove existing buttons if they exist
    if (EXISTING_BUTTONS) {
        EXISTING_BUTTONS.remove();
    }

    const NAVBAR_BUTTONS = document.createElement('div');
    NAVBAR_BUTTONS.classList.add('navbar__buttons-layout');
    const authButtons = (tabIndex = 0) => {
        return `<button class="btn btn--ghost" aria-label="login button" title="login button"
                                    tabindex="${tabIndex}"
                                >
                                    Login
                                </button>
                                <button
                                    class="btn"
                                    aria-label="sign up button"
                                    title="sign up button"
                                    tabindex="${tabIndex}"
                                >
                                    Sign Up
                                </button>`;
    };

    if (e.matches) {
        // Screen is 430px wide or less (Mobile)
        NAVBAR_BUTTONS.innerHTML = authButtons(-1);
        NAVBAR_MENU.appendChild(NAVBAR_BUTTONS);
    } else {
        // Screen is wider than 430px (Tablet and Desktop)
        NAVBAR_BUTTONS.innerHTML = authButtons(0);
        NAVBAR.appendChild(NAVBAR_BUTTONS);
    }
};

// function to handle dynamic tab focus on navlinks
const handleScreenChangeForMobileAndTablet = (e) => {
    if (e.matches) {
        if (NAVBAR_MENU.classList.contains('navbar__menu--active')) {
            NAVBAR_LINKS.forEach((link) => {
                link.setAttribute('tabindex', 0);
            });
        } else {
            NAVBAR_LINKS.forEach((link) => {
                link.setAttribute('tabindex', -1);
            });
        }
    } else {
        NAVBAR_LINKS.forEach((link) => {
            link.setAttribute('tabindex', 0);
        });
    }
};

// function to handle dynamic positions of elements in the navbar layout
const handleScreenChangeForTablet = (e) => {
    if (e.matches) {
        NAVBAR_LOGO.remove();
        NAVBAR.insertBefore(NAVBAR_LOGO, NAVBAR.children[1]);
    } else {
        NAVBAR_LOGO.remove();
        NAVBAR.insertBefore(NAVBAR_LOGO, NAVBAR.children[0]);
    }
};

IS_MOBILE.addEventListener('change', handleScreenChangeForMobile);
IS_TABLET.addEventListener('change', handleScreenChangeForTablet);
IS_MOBILE_AND_TABLET.addEventListener(
    'change',
    handleScreenChangeForMobileAndTablet,
);

handleScreenChangeForMobile(IS_MOBILE);
handleScreenChangeForTablet(IS_TABLET);
handleScreenChangeForMobileAndTablet(IS_MOBILE_AND_TABLET);

let animationFrameId = null;

const resizeObserver = new ResizeObserver(() => {
    // Immediately disable transitions on resize detection
    NAVBAR_MENU.classList.add('no-transition');

    // Cancel any pending frame requests
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    // Schedule the removal for the next idle render frame
    animationFrameId = requestAnimationFrame(() => {
        animationFrameId = requestAnimationFrame(() => {
            NAVBAR_MENU.classList.remove('no-transition');
        });
    });
});

// Start observing the navbar-menu
resizeObserver.observe(NAVBAR_MENU);
