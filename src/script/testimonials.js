import Splide from '@splidejs/splide';
import '@splidejs/splide/css/core';
import data from '../data/testimonials.json';

const TESTIMONIALS_DATA = data.data;

/* Select testimonials list */

const testimonialsList = document.querySelector('.splide__list');

/* Append testimonial for each testimonials data */

TESTIMONIALS_DATA.forEach((testimonial) => {
    // Create the main list item container
    const NEW_TESTIMONIAL = document.createElement('li');
    NEW_TESTIMONIAL.className = 'splide__slide testimonials__card';

    // Create Avatar section
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'testimonials__avatar';

    const avatarImg = document.createElement('img');
    avatarImg.src = testimonial.avatar;
    avatarImg.alt = testimonial.alt;

    avatarDiv.append(avatarImg);

    // Create Info & Rating Layout section
    const layoutDiv = document.createElement('div');
    layoutDiv.className = 'testimonials__info-rating-layout';

    // Create Name and Role block
    const infoDiv = document.createElement('div');
    infoDiv.className = 'testimonials__info';

    const nameH4 = document.createElement('h4');
    nameH4.className = 'testimonials__name heading-4';
    nameH4.textContent = testimonial.name;

    const roleH5 = document.createElement('h5');
    roleH5.className = 'testimonials__role heading-5';
    roleH5.textContent = `/ ${testimonial.role}`;

    infoDiv.append(nameH4, roleH5);

    // Create Rating Stars block
    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'testimonials__rating';

    // Generate stars using a loop and append them directly
    for (let i = 0; i < testimonial.rating; i++) {
        const starSpan = document.createElement('span');
        starSpan.className = 'icon icon-star testimonials__rating-star';
        ratingDiv.append(starSpan);
    }

    // Assemble the layout section
    layoutDiv.append(infoDiv, ratingDiv);

    // Create Testimonial Text section
    const textDiv = document.createElement('div');
    textDiv.className = 'testimonials__text para-3';
    textDiv.textContent = testimonial.testimonial;

    // Append all main sections to the list item
    NEW_TESTIMONIAL.append(avatarDiv, layoutDiv, textDiv);

    // Append the complete list item to the main list container
    testimonialsList.appendChild(NEW_TESTIMONIAL);
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
