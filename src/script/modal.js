const canvas = document.getElementById('wheelCanvas');
const ctx = canvas.getContext('2d');
const spinBtn = document.getElementById('spinBtn');
const winningCouponContainer = document.querySelector('#winning-deal');
const unlockedCouponsContainer = document.querySelector('#unlocked-deals');
const viewAllBtn = document.querySelector('#view-all-btn');
const couponsCounter = document.querySelector('.modal__counter');
const goBackBtn = document.querySelector('#back-btn');
const panel1 = document.querySelector('#panel-1');
const panel2 = document.querySelector('#panel-2');
const modal = document.querySelector('.modal');
const modalCloseBtn = document.querySelector('.modal__close-btn');
const panelDescription = document.querySelector('#panel1-description');

// Setup Canvas Configuration
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 230;
let arcSize = 0;

let currentAngle = -Math.PI / 2;
let velocity = 0;
let isSpinning = false;
const friction = 0.985;

// Visual configurations mapped to wheel slots
const designTemplate = [
    { color: '#7B3AF2', textColor: '#FFFFFF' },
    { color: '#FBBF24', textColor: '#000000' },
    { color: '#06B6D4', textColor: '#FFFFFF' },
    { color: '#F43F5E', textColor: '#FFFFFF' },
];

const PROMOTIONS_API =
    'https://gist.githubusercontent.com/ameer-wajid-ali/1f29ebee4295cede36f8d74b45e576df/raw/122966c9a123861249f173911d8d93a76dc06d7a/';

let unlockedCouponsData = [];
let promotions = [];
let wheelSectors = [];

/**
 * Retrieves the base promotions list, loading from local storage if cached,
 * or fetching from the API and calculating expiration dates if uncached.
 *
 * @async
 * @function getBasePromotions
 * @returns {Promise<Object[]>} A promise that resolves to an array of processed promotion objects.
 */

const getBasePromotions = async () => {
    const localPromos = localStorage.getItem('promotions');

    if (localPromos) {
        return JSON.parse(localPromos);
    }

    try {
        const response = await fetch(PROMOTIONS_API);
        if (!response.ok) throw new Error('Failed to fetch promotions');

        const rawData = await response.json();

        const processedPromos = rawData.map((item) => {
            const daysToAdd = item.validFor !== null ? item.validFor : 7;
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + daysToAdd);

            return {
                label: item.label,
                promoCode: item.promoCode,
                validTill: targetDate.toISOString(),
            };
        });

        localStorage.setItem('promotions', JSON.stringify(processedPromos));
        return processedPromos;
    } catch (err) {
        panelDescription.style.color = 'red';
        panelDescription.style.color = 'red';
        if (err instanceof Error) {
            panelDescription.textContent = `Error: ${err.message}`;
        } else {
            panelDescription.textContent = 'Error fetching promo data';
        }
        return [];
    }
};

/**
 * Retrieves the collection of unlocked coupons from browser local storage.
 * Returns an empty array if no saved data is found or available.
 *
 * @function getUnlockedPromotions
 * @returns {Object[]} An array of previously unlocked coupon data objects.
 */

const getUnlockedPromotions = () => {
    const localUnlocked = localStorage.getItem('unlockedPromotions');
    return localUnlocked ? JSON.parse(localUnlocked) : [];
};

/**
 * Orchestrates the promotion data flow by showing a loading screen, loading records,
 * and initializing the spinning wheel user interface upon success.
 *
 * @async
 * @function handlePromotions
 * @returns {Promise<void>}
 */

export const handlePromotions = async () => {
    spinBtn.style.display = 'none';
    drawLoading();
    try {
        promotions = await getBasePromotions();
        unlockedCouponsData = getUnlockedPromotions();
        if (promotions.length > 0) {
            initializeWheel(promotions);
            spinBtn.style.display = 'block';
        }
    } catch (err) {
        panelDescription.style.color = 'red';
        if (err instanceof Error) {
            panelDescription.textContent = `Error: ${err.message}`;
        } else {
            panelDescription.textContent = 'Error fetching promo data';
        }
    }
};

/**
 * Initializes the spinning wheel by selecting and formatting promotion data.
 * Filters out already unlocked coupons, shuffles the remainder, picks 4 items,
 * automatically splits labels into two lines, applies design variables, and redraws the canvas.
 *
 * @function initializeWheel
 * @param {Object[]} apiData - The complete collection of available promotional item objects.
 * @returns {void}
 */

function initializeWheel(apiData) {
    // Filter and Shuffle original API array
    const shuffled = [...apiData]
        .filter(
            (data) =>
                !unlockedCouponsData.some(
                    (coupon) => coupon.promoCode === data.promoCode,
                ),
        )
        .sort(() => 0.5 - Math.random());

    if (shuffled.length < 4) {
        alert('no more spins left!');
        spinBtn.disabled = true;
        return;
    }

    // Take the top 4 items
    const selectedItems = shuffled.slice(0, 4);

    // Pair dynamic data items up with structural layout designs
    wheelSectors = selectedItems.map((item, index) => {
        // Split label strings in half automatically to add line spacing
        const words = item.label.split(' ');
        const midPoint = Math.ceil(words.length / 2);
        const line1 = words.slice(0, midPoint).join(' ');
        const line2 = words.slice(midPoint).join(' ');

        return {
            ...item, // Keeps promoCode and validFor metadata intact inside the sector object
            textLines: [line1, line2],
            color: designTemplate[index].color,
            textColor: designTemplate[index].textColor,
        };
    });

    arcSize = (2 * Math.PI) / wheelSectors.length;
    drawWheel();
}

/**
 * Draws the spinning wheel and its animated text sectors on the canvas.
 * Clears the canvas, draws the outer border, and rotates text elements.
 *
 * @function drawWheel
 * @returns {void}
 */

function drawWheel() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();

    wheelSectors.forEach((sector, i) => {
        const angleStart = currentAngle + i * arcSize;
        const angleEnd = angleStart + arcSize;

        ctx.beginPath();
        ctx.fillStyle = sector.color;
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, angleStart, angleEnd);
        ctx.lineTo(centerX, centerY);
        ctx.fill();

        ctx.lineWidth = 10;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angleStart + arcSize / 2);
        ctx.rotate(Math.PI / 2);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = sector.textColor;
        ctx.font = 'bold 22px roboto';

        const radiusPlacement = -radius * 0.55;
        const lineHeight = 26;

        ctx.fillText(sector.textLines[0], 0, radiusPlacement - lineHeight / 2);
        ctx.fillText(sector.textLines[1], 0, radiusPlacement + lineHeight / 2);

        ctx.restore();
    });
}

/**
 * Draws a placeholder loading screen on the canvas.
 * Clears the canvas and renders a centered "Loading..." text inside a circular frame.
 *
 * @function drawLoading
 * @returns {void}
 */

function drawLoading() {
    // Clear the canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the outer light-gray circle/ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#E5E7EB';
    ctx.fill();

    // Draw the inner white base circle (matching your drawWheel layout)
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#dcdcdc';
    ctx.fill();

    // Draw the centered "Loading..." text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px roboto';
    ctx.fillText('Loading...', centerX, centerY);
}

/**
 * Updates the wheel rotation physics and handles the animation frame loop.
 * Simulates deceleration using friction and triggers the win calculation when stopped.
 *
 * @function updateAnimation
 * @returns {void}
 */

function updateAnimation() {
    if (!isSpinning) return;

    velocity *= friction;
    currentAngle += velocity;

    if (velocity < 0.001) {
        isSpinning = false;
        velocity = 0;
        spinBtn.disabled = false;
        calculateWinner();
        return;
    }

    drawWheel();
    requestAnimationFrame(updateAnimation);
}

/**
 * Initiates the wheel spin sequence if the wheel is not already active.
 * Resets the UI state, calculates a random starting velocity, and starts the animation loop.
 *
 * @function spin
 * @returns {void}
 */

function spin() {
    if (isSpinning) return;
    winningCouponContainer.textContent = '';
    spinBtn.disabled = true;
    velocity = Math.random() * 0.4 + 0.3;
    isSpinning = true;
    updateAnimation();
}

function createCouponCard(couponData, couponContainer) {
    const expiryDate = new Date(couponData.validTill); // Expects ISO string (like "2026-07-20T12:00:00Z")
    const currentDate = new Date();

    // Calculate difference in milliseconds
    const timeDiff = expiryDate.getTime() - currentDate.getTime();

    // Convert to remaining days (rounded up to nearest whole day)
    const daysRemaining = Math.max(
        0,
        Math.ceil(timeDiff / (1000 * 60 * 60 * 24)),
    );
    const isExpired = daysRemaining <= 0;
    const couponCard = document.createElement('div');
    couponCard.className = isExpired
        ? 'card card--secondary card--disabled'
        : 'card card--secondary';

    couponCard.innerHTML = `
        <div class="card__details">
            <h3 class="card__title">${couponData.label}</h3>
            <p class="card__warning ${isExpired ? 'card__warning--disabled' : ''}">
                ${isExpired ? 'Deal Expired' : `Expires in ${daysRemaining}d`}
            </p>
        </div>
        <div class="card__code-wrapper">
            <span class="card__code mono-code">${couponData.promoCode}</span>
            <button class="card__copy-btn ${isExpired ? 'card__copy-btn--disabled' : ''}" ${isExpired ? 'disabled' : ''}>
                <span class="icon icon-copy"></span>
            </button>
        </div>
    `;

    couponContainer.appendChild(couponCard);

    const copyBtn = couponCard.querySelector('.card__copy-btn');
    const couponCode = couponCard.querySelector('.card__code');

    copyBtn.addEventListener('click', async () => {
        await navigator.clipboard.writeText(couponCode.textContent);
    });

    return couponCard;
}

/**
 * Persists the array of unlocked coupons to browser local storage.
 * Serializes the data into a JSON string before saving.
 *
 * @param {Object[]} coupons - The collection of unlocked coupon data objects to save.
 * @returns {void}
 */

const saveUnlockedCoupons = (coupons) => {
    localStorage.setItem('unlockedPromotions', JSON.stringify(coupons));
};

/**
 * Calculates the winning sector based on the final rotation angle.
 * Filters the winner data, saves it to local storage, and updates the prize UI.
 *
 * @function calculateWinner
 * @returns {void}
 */

function calculateWinner() {
    let normalizedAngle = (1.5 * Math.PI - currentAngle) % (2 * Math.PI);
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

    const winningIndex = Math.floor(normalizedAngle / arcSize);
    const winnerData = wheelSectors[winningIndex];
    const filterPromo = ({ label, promoCode, validTill }) => ({
        label,
        promoCode,
        validTill,
    });

    unlockedCouponsData.push(filterPromo(winnerData));

    // Sync the updated array to Local Storage immediately
    saveUnlockedCoupons(unlockedCouponsData);

    const WIN_TEXT = document.createElement('div');
    WIN_TEXT.className = 'modal__alert';
    WIN_TEXT.textContent = 'You won!';
    winningCouponContainer.appendChild(WIN_TEXT);

    createCouponCard(winnerData, winningCouponContainer);
    couponsCounter.textContent = unlockedCouponsData.length;
}

/**
 * Event listener for the spin button click event.
 * Initializes the wheel with the latest promotions and triggers the spin sequence.
 *
 * @listens Theater/UI~click
 */

spinBtn.addEventListener('click', () => {
    initializeWheel(promotions);
    spin();
});

/**
 * Event listener for the 'View All' button click event.
 * Switches to the secondary panel, clears previous lists, and renders unlocked
 * coupons sorted by validity status (active first, soonest to expire first).
 *
 * @listens Theater/UI~click
 */

viewAllBtn.addEventListener('click', () => {
    panel1.classList.remove('modal__panel--active');
    panel2.classList.add('modal__panel--active');

    unlockedCouponsContainer.textContent = '';

    const now = new Date();

    [...unlockedCouponsData]
        .sort((a, b) => {
            // Check if coupons are expired (true if validTill is in the past)
            const aExpired = new Date(a.validTill) < now;
            const bExpired = new Date(b.validTill) < now;

            // Push expired coupons to the bottom
            if (aExpired !== bExpired) {
                return aExpired - bExpired;
            }

            // ort active coupons by soonest to expire
            return new Date(a.validTill) - new Date(b.validTill);
        })
        .forEach((coupon) => {
            createCouponCard(coupon, unlockedCouponsContainer);
        });
});

/**
 * Event listener for the back button click event.
 * Returns the user to the primary wheel panel and updates the counter display.
 *
 * @listens Theater/UI~click
 */

goBackBtn.addEventListener('click', () => {
    panel2.classList.remove('modal__panel--active');
    panel1.classList.add('modal__panel--active');
    couponsCounter.textContent = unlockedCouponsData.length;
});

/**
 * Event listener for the modal close button click event.
 * Closes the modal component and resets panels back to their initial state.
 *
 * @listens Theater/UI~click
 */

modalCloseBtn.addEventListener('click', () => {
    modal.close();
    winningCouponContainer.textContent = '';
    panel2.classList.remove('modal__panel--active');
    panel1.classList.add('modal__panel--active');
});
