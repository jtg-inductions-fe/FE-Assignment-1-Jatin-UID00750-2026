/**
 * Traps the keyboard focus loop inside a specified menu dialog container.
 * Prevents tab-navigation from escaping the menu context by redirecting
 * the focus back to the initiator element when hitting the boundaries.
 *
 * @param {KeyboardEvent} e - The native browser keyboard event object.
 * @param {HTMLElement} container - The wrapper element containing the focusable menu items.
 * @param {HTMLElement} initiator - The element that opens/triggers the menu (e.g., hamburger button).
 * @param {string} [element='a'] - A CSS selector string to query focusable targets inside the container.
 * @returns {void}
 */

export const trapFocus = (e, container, initiator, element = 'a') => {
    if (e.key !== 'Tab') return;
    const elements = container.querySelectorAll(element);
    if (elements.length === 0) return;
    let lastElement = elements[elements.length - 1];
    if (document.activeElement === lastElement) {
        initiator.focus();
        e.preventDefault();
    }
};
