import Splide from '@splidejs/splide';
import '@splidejs/splide/css/core';
import data from '../data/testimonials.json';

const TESTIMONIALS_DATA = data.data;

/* Select testimonials list */

const TESTIMONIALS_LIST = document.querySelector('.splide__list');

/* Append testimonial for each testimonials data */

TESTIMONIALS_DATA.forEach((testimonial) => {
    const ratingStars = Array.from(
        { length: testimonial.rating },
        () => `
    <span class="icon icon-star testimonials__rating-star"></span>
`,
    ).join('');
    const NEW_TESTIMONIAL = document.createElement('li');
    NEW_TESTIMONIAL.className = 'splide__slide testimonials__card';
    NEW_TESTIMONIAL.innerHTML = `<div class="testimonials__avatar"> <img
                                                src="${testimonial.avatar}"
                                                alt="${testimonial.alt}"
                                            />
                                        </div>
                                        <div
                                            class="testimonials__info-rating-layout"
                                        >
                                            <div class="testimonials__info">
                                                <h4 class="testimonials__name heading-4"
                                                >
                                                    ${testimonial.name}
                                                </h4> <h5 class="testimonials__role heading-5"
                                                >
                                                    / ${testimonial.role}
                                                </h5> </div> <div class="testimonials__rating">
                                                ${ratingStars}
                                            </div> </div> <div class="testimonials__text para-3">${testimonial.testimonial}</div>`;

    TESTIMONIALS_LIST.appendChild(NEW_TESTIMONIAL);
});

/* Apply testimonials carousel slider */

document.addEventListener('DOMContentLoaded', () => {
    const testimonialsSplide = new Splide('.testimonials__carousel-container', {
        type: 'loop',
        perPage: 1,
        gap: '2rem',
        // Customise class naming for generated pagination dots
        classes: {
            pagination: 'splide__pagination testimonials__navigation-dots',
            page: 'splide__pagination__page testimonials__dot',
        },
    });

    testimonialsSplide.mount();
});
