const ACCORDIAN = document.querySelectorAll('.footer__accordian');

const LARGE_SCREEN = window.matchMedia('(min-width: 1024px)');

function handleLargeScreenChange(e) {
    ACCORDIAN.forEach((accordion) => {
        if (e.matches) {
            // Add the open attribute on desktop screens
            accordion.setAttribute('open', '');
            accordion.removeAttribute('name');
        } else {
            // Remove the open attribute on mobile screens
            accordion.removeAttribute('open');
            accordion.setAttribute('name', 'footer-links');
        }
    });
}

// Register the listener to detect screen size changes
LARGE_SCREEN.addEventListener('change', handleLargeScreenChange);

// Run the function once on initial page load
handleLargeScreenChange(LARGE_SCREEN);
