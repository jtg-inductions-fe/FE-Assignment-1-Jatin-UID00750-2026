import data from '../data/stats-cards.json';

const STATS_CARDS_DATA = data.data;

/* Select card-layout container */

const CARD_LAYOUT = document.querySelector('.travel-point__card-layout');

/* Append card for each stats card data */

STATS_CARDS_DATA.forEach((card) => {
    // Create the main card container
    const NEW_CARD = document.createElement('div');
    NEW_CARD.className = 'card card--primary';

    // Create the value heading element
    const valueH4 = document.createElement('h4');
    valueH4.className = 'card__value heading-4';
    valueH4.textContent = card.value;

    // Create the card name description element
    const nameDiv = document.createElement('div');
    nameDiv.className = 'card__name para-2';
    nameDiv.textContent = card.name;

    // Append both children directly into the new card element
    NEW_CARD.append(valueH4, nameDiv);

    // Append the completed card into parent container layout
    CARD_LAYOUT.appendChild(NEW_CARD);
});
