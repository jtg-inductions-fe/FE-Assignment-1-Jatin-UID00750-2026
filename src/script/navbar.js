import { trapFocus } from './utils';
import { handlePromotions } from './modal';

const NAVBAR = document.querySelector('.header__nav');
const NAVBAR_MENU = document.querySelector('.header__menu');
const NAVBAR_LINKS_MENU = document.querySelector('.header__links');
const NAVBAR_LINKS = document.querySelectorAll('.header__link');
const NAVBAR_BUTTONS = document.querySelectorAll('.header__button');
const HAMBURGER_ICON = document.querySelector('.header__hamburger-icon');
const SPECIAL_DEALS_BTN = document.querySelector('#special-deals-btn');
const MODAL = document.querySelector('.modal');

// Device-specific handlers for handling keyboard focus traps

const handleKeyDownForMobile = (e) => {
    trapFocus(e, NAVBAR_MENU, HAMBURGER_ICON);
};

const handleKeyDownForTablet = (e) => {
    trapFocus(e, NAVBAR_LINKS_MENU, HAMBURGER_ICON);
};

// Explicitly close the menu and reset all states on viewport change
const closeMenu = () => {
    // Reset hamburger icon to default open state
    HAMBURGER_ICON.classList.remove('icon-menu-close');
    HAMBURGER_ICON.classList.add('icon-menu');

    // Remove active layout classes
    NAVBAR_LINKS_MENU.classList.remove('header__links--active');
    NAVBAR_MENU.classList.remove('header__menu--active');

    // Reset layout styles
    NAVBAR.style.readingFlow = 'grid-columns';

    // Remove global keyboard trap listeners
    document.removeEventListener('keydown', handleKeyDownForTablet);
    document.removeEventListener('keydown', handleKeyDownForMobile);
};

/**
 * Toggles visibility, keyboard accessibility, and focus trapping rules
 * depending on whether the user is on a mobile or tablet viewport.
 */
const handleMenu = () => {
    HAMBURGER_ICON.classList.toggle('icon-menu-close');
    HAMBURGER_ICON.classList.toggle('icon-menu');
    if (window.innerWidth > 1024) {
        if (!NAVBAR_LINKS_MENU.classList.toggle('header__links--active')) {
            NAVBAR.style.readingFlow = 'grid-columns';
            NAVBAR_LINKS.forEach((link) => {
                link.setAttribute('tabindex', -1);
            });
            document.removeEventListener('keydown', handleKeyDownForTablet);
        } else {
            NAVBAR.style.readingFlow = 'normal';
            NAVBAR_LINKS.forEach((link) => {
                link.setAttribute('tabindex', 0);
            });
            document.addEventListener('keydown', handleKeyDownForTablet);
        }
    } else {
        if (!NAVBAR_MENU.classList.toggle('header__menu--active')) {
            NAVBAR_LINKS.forEach((link) => {
                link.setAttribute('tabindex', -1);
            });
            NAVBAR_BUTTONS.forEach((btn) => {
                btn.setAttribute('tabindex', -1);
            });
            document.removeEventListener('keydown', handleKeyDownForMobile);
        } else {
            NAVBAR_LINKS.forEach((link) => {
                link.setAttribute('tabindex', 0);
            });
            NAVBAR_BUTTONS.forEach((btn) => {
                btn.setAttribute('tabindex', 0);
            });
            document.addEventListener('keydown', handleKeyDownForMobile);
        }
    }
};

HAMBURGER_ICON.addEventListener('click', handleMenu);

/* close the menu if esc key is pressed */
document.addEventListener('keydown', (event) => {
    if (
        event.key === 'Escape' &&
        (NAVBAR_MENU.classList.contains('header__menu--active') ||
            NAVBAR_LINKS_MENU.classList.contains('header__links--active'))
    ) {
        handleMenu();
        HAMBURGER_ICON.focus();
    }
});

/* open spinning wheel modal */

SPECIAL_DEALS_BTN.addEventListener('click', (e) => {
    e.preventDefault();
    MODAL.showModal();
    handlePromotions();
});

/* constants for mobile and tablet screens */

const IS_MOBILE = window.matchMedia('(max-width: 1023px)');
const IS_TABLET = window.matchMedia(
    '(min-width: 1024px) and (max-width: 1440px)',
);

const handleScreenChangeForMobile = (e) => {
    closeMenu();
    if (e.matches) {
        NAVBAR_LINKS.forEach((link) => {
            link.setAttribute('tabindex', -1);
        });
        NAVBAR_BUTTONS.forEach((btn) => {
            btn.setAttribute('tabindex', -1);
        });
    } else {
        NAVBAR_LINKS.forEach((link) => {
            link.setAttribute('tabindex', 0);
        });
        NAVBAR_BUTTONS.forEach((btn) => {
            btn.setAttribute('tabindex', 0);
        });
    }
};

const handleScreenChangeForTablet = (e) => {
    closeMenu();
    if (e.matches) {
        NAVBAR_LINKS.forEach((link) => {
            link.setAttribute('tabindex', -1);
        });
    } else {
        if (!IS_MOBILE.matches) {
            NAVBAR_LINKS.forEach((link) => {
                link.setAttribute('tabindex', 0);
            });
        }
    }
};

IS_MOBILE.addEventListener('change', handleScreenChangeForMobile);
IS_TABLET.addEventListener('change', handleScreenChangeForTablet);

handleScreenChangeForMobile(IS_MOBILE);
handleScreenChangeForTablet(IS_TABLET);

let animationFrameId = null;

const resizeObserver = new ResizeObserver(() => {
    /* Immediately disable transitions on resize detection */
    NAVBAR_MENU.classList.add('header--no-transition');
    NAVBAR_LINKS_MENU.classList.add('header--no-transition');

    /* Cancel any pending frame requests */
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    /* Schedule the removal for the next idle render frame */
    animationFrameId = requestAnimationFrame(() => {
        animationFrameId = requestAnimationFrame(() => {
            NAVBAR_MENU.classList.remove('header--no-transition');
            NAVBAR_LINKS_MENU.classList.remove('header--no-transition');
        });
    });
});

/* Start observing the navbar-menu */
resizeObserver.observe(NAVBAR_MENU);
resizeObserver.observe(NAVBAR_LINKS_MENU);
