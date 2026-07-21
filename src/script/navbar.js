import { trapFocus } from './utils';
import { handlePromotions } from './modal';

const navbar = document.querySelector('.header__nav');
const navbarMenu = document.querySelector('.header__menu');
const navbarLinksMenu = document.querySelector('.header__links');
const navbarLinks = document.querySelectorAll('.header__link');
const navbarButtons = document.querySelectorAll('.header__button');
const headerBackdrop = document.querySelector('#header-backdrop');
const hamburgerIcon = document.querySelector('.header__hamburger-icon');
const specialDealsButton = document.querySelector('#special-deals-btn');
const modal = document.querySelector('.modal');

/**
 * Traps keyboard focus within the mobile navigation menu structure.
 *
 * @param {KeyboardEvent} e - The native keyboard event object.
 * @returns {void}
 */

const handleKeyDownForMobile = (e) => {
    trapFocus(e, navbarMenu, hamburgerIcon);
};

/**
 * Traps keyboard focus within the tablet navigation links structure.
 *
 * @param {KeyboardEvent} e - The native keyboard event object.
 * @returns {void}
 */

const handleKeyDownForTablet = (e) => {
    trapFocus(e, navbarLinksMenu, hamburgerIcon);
};

/**
 * Closes the navigation menu and resets layout and keyboard states.
 *
 * @returns {void}
 */

const closeMenu = () => {
    // Reset hamburger icon to default open state
    hamburgerIcon.classList.remove('icon-menu-close');
    hamburgerIcon.classList.add('icon-menu');

    // Remove active layout classes and backdrop
    navbarLinksMenu.classList.remove('header__links--active');
    navbarMenu.classList.remove('header__menu--active');
    document.body.style.overflowY = 'auto';
    headerBackdrop.classList.remove('header__backdrop');

    // Remove global keyboard trap listeners
    document.removeEventListener('keydown', handleKeyDownForTablet);
    document.removeEventListener('keydown', handleKeyDownForMobile);
};

document.addEventListener('click', (event) => {
    const isClickInside = navbar.contains(event.target);

    if (!isClickInside) {
        closeMenu();
    }
});

navbarLinks.forEach((link) => {
    link.addEventListener('click', () => {
        closeMenu();
    });
});

navbarButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
        closeMenu();
    });
});

/**
 * Toggles the navigation menu state, updating accessibility attributes and focus traps based on screen width.
 *
 * @returns {void}
 */

const handleMenu = () => {
    hamburgerIcon.classList.toggle('icon-menu-close');
    hamburgerIcon.classList.toggle('icon-menu');
    headerBackdrop.classList.toggle('header__backdrop');

    if (window.innerWidth >= 1024) {
        if (!navbarLinksMenu.classList.toggle('header__links--active')) {
            document.body.style.overflowY = 'auto';
            navbar.style.readingFlow = 'grid-columns';
            navbarLinks.forEach((link) => {
                link.setAttribute('tabindex', -1);
            });
            document.removeEventListener('keydown', handleKeyDownForTablet);
        } else {
            navbar.style.readingFlow = 'normal';
            document.body.style.overflowY = 'hidden';
            navbarLinks.forEach((link) => {
                link.setAttribute('tabindex', 0);
            });
            document.addEventListener('keydown', handleKeyDownForTablet);
        }
    } else {
        if (!navbarMenu.classList.toggle('header__menu--active')) {
            document.body.style.overflowY = 'auto';
            navbarLinks.forEach((link) => {
                link.setAttribute('tabindex', -1);
            });
            navbarButtons.forEach((btn) => {
                btn.setAttribute('tabindex', -1);
            });
            document.removeEventListener('keydown', handleKeyDownForMobile);
        } else {
            document.body.style.overflowY = 'hidden';
            navbarLinks.forEach((link) => {
                link.setAttribute('tabindex', 0);
            });
            navbarButtons.forEach((btn) => {
                btn.setAttribute('tabindex', 0);
            });
            document.addEventListener('keydown', handleKeyDownForMobile);
        }
    }
    event.stopPropagation();
};

hamburgerIcon.addEventListener('click', handleMenu);

/* close the menu if esc key is pressed */
document.addEventListener('keydown', (event) => {
    if (
        event.key === 'Escape' &&
        (navbarMenu.classList.contains('header__menu--active') ||
            navbarLinksMenu.classList.contains('header__links--active'))
    ) {
        handleMenu();
        hamburgerIcon.focus();
    }
});

/* open spinning wheel modal */

specialDealsButton.addEventListener('click', (e) => {
    e.preventDefault();
    modal.showModal();
    handlePromotions();
});

// CSS-matching breakpoints
const queries = {
    mobile: window.matchMedia('(max-width: 1023px)'),
    tablet: window.matchMedia('(min-width: 1024px) and (max-width: 1439px)'),
    desktop: window.matchMedia('(min-width: 1440px)'),
};

/**
 * Automatically resets the navigation menu and updates element focusability when the screen size changes.
 *
 * @returns {void}
 */

const handleScreenChange = () => {
    closeMenu();
    // Determine current device type dynamically
    const currentDevice = Object.keys(queries).find(
        (key) => queries[key].matches,
    );

    // Execute specific logic based on the device type
    const deviceActions = {
        mobile: () => {
            navbarLinks.forEach((link) => {
                link.setAttribute('tabindex', -1);
            });
            navbarButtons.forEach((btn) => {
                btn.setAttribute('tabindex', -1);
            });
        },
        tablet: () => {
            navbarLinks.forEach((link) => {
                link.setAttribute('tabindex', -1);
            });
            navbarButtons.forEach((btn) => {
                btn.setAttribute('tabindex', 0);
            });
        },
        desktop: () => {
            navbarLinks.forEach((link) => {
                link.setAttribute('tabindex', 0);
            });
            navbarButtons.forEach((btn) => {
                btn.setAttribute('tabindex', 0);
            });
        },
    };

    // Run the device specific action safely
    if (deviceActions[currentDevice]) {
        deviceActions[currentDevice]();
    }
};

// Bind the function with media query change events
Object.values(queries).forEach((mediaQuery) => {
    mediaQuery.addEventListener('change', handleScreenChange);
});

// Run once immediately to handle the screen state on initial page load
handleScreenChange();

let animationFrameId = null;

const resizeObserver = new ResizeObserver(() => {
    /* Immediately disable transitions on resize detection */
    navbarMenu.classList.add('header--no-transition');
    navbarLinksMenu.classList.add('header--no-transition');

    /* Cancel any pending frame requests */
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    /* Schedule the removal for the next idle render frame */
    animationFrameId = requestAnimationFrame(() => {
        animationFrameId = requestAnimationFrame(() => {
            navbarMenu.classList.remove('header--no-transition');
            navbarLinksMenu.classList.remove('header--no-transition');
        });
    });
});

/* Start observing the navbar-menu */
resizeObserver.observe(navbarMenu);
resizeObserver.observe(navbarLinksMenu);
