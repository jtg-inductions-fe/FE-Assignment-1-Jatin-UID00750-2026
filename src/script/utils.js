/* function to trap focus of elements in the menu dialog */
export const trapFocus = (e, container, initiator, element = 'a') => {
    if (e.key !== 'Tab') return;
    const ELEMENTS = container.querySelectorAll(element);
    let lastElement = ELEMENTS[ELEMENTS.length - 1];
    if (document.activeElement === lastElement) {
        initiator.focus();
        e.preventDefault();
    }
};
