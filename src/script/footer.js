const accordian = document.querySelectorAll('.footer__accordian');
const accordianTitle = document.querySelectorAll('.footer__accordian-title');

const isTabletOrLarger = window.matchMedia('(min-width: 1024px)');

/**
 * Toggles accordion open states and grouping attributes based on tablet and desktop screen matching.
 *
 * @param {MediaQueryListEvent} e - The media query list change event object.
 * @returns {void}
 */

const handleLargeScreenChange = (e) => {
    accordian.forEach((accordion) => {
        if (e.matches) {
            // Add the open attribute on desktop screens
            accordion.setAttribute('open', '');
            accordion.removeAttribute('name');
            accordianTitle.forEach((title) =>
                title.setAttribute('tabindex', -1),
            );
        } else {
            // Remove the open attribute on mobile screens
            accordion.removeAttribute('open');
            accordion.setAttribute('name', 'footer-links');
            accordianTitle.forEach((title) =>
                title.setAttribute('tabindex', 0),
            );
        }
    });
};

// Register the listener to detect screen size changes
isTabletOrLarger.addEventListener('change', handleLargeScreenChange);

// Run the function once on initial page load
handleLargeScreenChange(isTabletOrLarger);
