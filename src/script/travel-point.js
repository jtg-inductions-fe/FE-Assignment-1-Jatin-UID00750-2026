import data from '../data/stats-cards.json';

const STATS_CARDS_DATA = data.data;

/* Select card-layout container */

const CARD_LAYOUT = document.querySelector('.travel-point__card-layout');

/* Append card for each stats card data */

STATS_CARDS_DATA.forEach((card) => {
    const NEW_CARD = document.createElement('div');
    NEW_CARD.className = 'stats-card';
    NEW_CARD.innerHTML = `<h4 class="stats-card__value heading-4">
                                    ${card.value}
                                </h4>
                                <div class="stats-card__name para-2">
                                    ${card.name}
                                </div>`;

    CARD_LAYOUT.appendChild(NEW_CARD);
});
