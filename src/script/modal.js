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
const CENTER_X = canvas.width / 2;
const CENTER_Y = canvas.height / 2;
const RADIUS = 230;
let arcSize = 0;

let currentAngle = -Math.PI / 2;
let velocity = 0;
let isSpinning = false;
const FRICTION = 0.985;
const VELOCITY_THRESHOLD = 0.001;
const BASE_SPIN_VELOCITY = 0.3;
const RANDOM_VELOCITY_RANGE = 0.4;
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DEFAULT_VALID_DAYS = 7;
const SHUFFLE_PIVOT = 0.5;
const TEXT_PLACEMENT_RATIO = 0.55;
const LINE_HEIGHT = 26;
const SECTOR_COUNT = 4;

// Visual configurations mapped to wheel slots
const DESIGN_TEMPLATE = [
    { color: '#7B3AF2', textColor: '#FFFFFF' },
    { color: '#FBBF24', textColor: '#000000' },
    { color: '#06B6D4', textColor: '#FFFFFF' },
    { color: '#F43F5E', textColor: '#FFFFFF' },
];

const WHEEL_THEME = {
    base: '#FFFFFF',
    placeholderBgOuter: '#E5E7EB',
    placeholderBgInner: '#DCDCDC',
    textSystem: '#000000',
    textError: '#DC2626',
};

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
    if (promotions.length > 0) return promotions;

    try {
        const response = await fetch(PROMOTIONS_API);
        if (!response.ok) throw new Error('Failed to fetch promotions');

        const rawData = await response.json();

        return rawData;
    } catch (err) {
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
            if (initializeWheel(promotions)) {
                spinBtn.style.display = 'block';
            }
            couponsCounter.textContent = unlockedCouponsData.length;
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

const initializeWheel = (apiData) => {
    // Filter and Shuffle original API array
    const shuffled = [...apiData]
        .filter(
            (data) =>
                !unlockedCouponsData.some(
                    (coupon) => coupon.promoCode === data.promoCode,
                ),
        )
        .sort(() => SHUFFLE_PIVOT - Math.random());

    if (shuffled.length < SECTOR_COUNT) {
        spinBtn.style.display = 'none';
        spinBtn.disabled = true;
        drawNoSpins();
        return false;
    }

    // Pick the top 4 items
    const selectedItems = shuffled.slice(0, SECTOR_COUNT);

    // Pair dynamic data items up with structural layout designs
    wheelSectors = selectedItems.map((item, index) => {
        // Split label strings in half to add line spacing
        const words = item.label.split(' ');
        const midPoint = Math.ceil(words.length / 2);
        const line1 = words.slice(0, midPoint).join(' ');
        const line2 = words.slice(midPoint).join(' ');

        return {
            ...item,
            textLines: [line1, line2],
            color: DESIGN_TEMPLATE[index].color,
            textColor: DESIGN_TEMPLATE[index].textColor,
        };
    });

    arcSize = (2 * Math.PI) / wheelSectors.length;
    drawWheel();
    return true;
};

/**
 * Draws the spinning wheel and its animated text sectors on the canvas.
 * Clears the canvas, draws the outer border, and rotates text elements.
 *
 * @function drawWheel
 * @returns {void}
 */

const drawWheel = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, RADIUS + 8, 0, 2 * Math.PI);
    ctx.fillStyle = WHEEL_THEME.base;
    ctx.fill();

    wheelSectors.forEach((sector, i) => {
        const angleStart = currentAngle + i * arcSize;
        const angleEnd = angleStart + arcSize;

        ctx.beginPath();
        ctx.fillStyle = sector.color;
        ctx.moveTo(CENTER_X, CENTER_Y);
        ctx.arc(CENTER_X, CENTER_Y, RADIUS, angleStart, angleEnd);
        ctx.lineTo(CENTER_X, CENTER_Y);
        ctx.fill();

        ctx.lineWidth = 10;
        ctx.strokeStyle = WHEEL_THEME.base;
        ctx.stroke();

        ctx.save();
        ctx.translate(CENTER_X, CENTER_Y);
        ctx.rotate(angleStart + arcSize / 2);
        ctx.rotate(Math.PI / 2);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = sector.textColor;
        ctx.font = 'bold 22px roboto';

        const radiusPlacement = -RADIUS * TEXT_PLACEMENT_RATIO;
        const lineHeight = LINE_HEIGHT;

        ctx.fillText(sector.textLines[0], 0, radiusPlacement - lineHeight / 2);
        ctx.fillText(sector.textLines[1], 0, radiusPlacement + lineHeight / 2);

        ctx.restore();
    });
};

/**
 * Draws a placeholder loading screen on the canvas.
 * Clears the canvas and renders a centered "Loading..." text inside a circular frame.
 *
 * @function drawLoading
 * @returns {void}
 */

const drawLoading = () => {
    // Clear the canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the outer light-gray circle/ring
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, RADIUS + 8, 0, 2 * Math.PI);
    ctx.fillStyle = WHEEL_THEME.placeholderBgOuter;
    ctx.fill();

    // Draw the inner white base circle
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = WHEEL_THEME.placeholderBgInner;
    ctx.fill();

    // Draw the centered "Loading..." text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = WHEEL_THEME.textSystem;
    ctx.font = 'bold 32px roboto';
    ctx.fillText('Loading...', CENTER_X, CENTER_Y);
};

/**
 * Draws the "No more spins left" message on the canvas.
 * Clears the canvas and renders a centered "No more spins left" text inside a circular frame.
 *
 * @function drawLoading
 * @returns {void}
 */

const drawNoSpins = () => {
    // Clear the canvas completely
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the outer light-gray circle/ring
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, RADIUS + 8, 0, 2 * Math.PI);
    ctx.fillStyle = WHEEL_THEME.placeholderBgOuter;
    ctx.fill();

    // Draw the inner white base circle
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = WHEEL_THEME.placeholderBgInner;
    ctx.fill();

    // Draw the centered "No more spins left." text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#DC2626';
    ctx.font = 'bold 32px roboto';
    ctx.fillText('No more spins left.', CENTER_X, CENTER_Y);
};

/**
 * Updates the wheel rotation physics and handles the animation frame loop.
 * Simulates deceleration using friction and triggers the win calculation when stopped.
 *
 * @function updateAnimation
 * @returns {void}
 */

const updateAnimation = () => {
    if (!isSpinning) return;

    velocity *= FRICTION;
    currentAngle += velocity;

    if (velocity < VELOCITY_THRESHOLD) {
        isSpinning = false;
        velocity = 0;
        spinBtn.disabled = false;
        calculateWinner();
        return;
    }

    drawWheel();
    requestAnimationFrame(updateAnimation);
};

/**
 * Initiates the wheel spin sequence if the wheel is not already active.
 * Resets the UI state, calculates a random starting velocity, and starts the animation loop.
 *
 * @function spin
 * @returns {void}
 */

const spin = () => {
    if (isSpinning) return;
    winningCouponContainer.textContent = '';
    spinBtn.disabled = true;
    velocity = Math.random() * RANDOM_VELOCITY_RANGE + BASE_SPIN_VELOCITY;
    isSpinning = true;
    updateAnimation();
};

/**
 * Creates and appends a coupon card element to the DOM.
 * @param {Object} couponData - The structural data for the coupon.
 * @param {HTMLElement} couponContainer - The DOM container to append the card to.
 * @returns {HTMLDivElement} The generated outer coupon card element.
 */

const createCouponCard = (couponData, couponContainer) => {
    const expiryDate = new Date(couponData.validTill); // Expects ISO string (like "2026-07-20T12:00:00Z")
    const currentDate = new Date();

    // Calculate difference in milliseconds
    const timeDiff = expiryDate.getTime() - currentDate.getTime();

    // Convert to remaining days (rounded up to nearest whole day)
    const daysRemaining = Math.max(0, Math.ceil(timeDiff / MS_PER_DAY));
    const isExpired = daysRemaining <= 0;

    // Create the top-level outer wrapper
    const couponCard = document.createElement('div');
    couponCard.className = isExpired
        ? 'card card--secondary card--disabled'
        : 'card card--secondary';

    // Create the Details section
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'card__details';

    const cardTitle = document.createElement('h3');
    cardTitle.className = 'card__title';
    cardTitle.textContent = couponData.label;

    const cardWarning = document.createElement('p');
    cardWarning.className =
        `card__warning ${isExpired ? 'card__warning--disabled' : ''}`.trim();
    cardWarning.textContent = isExpired
        ? 'Deal Expired'
        : `Expires in ${daysRemaining}d`;

    detailsDiv.append(cardTitle, cardWarning);

    // Create the Code Wrapper section
    const codeWrapperDiv = document.createElement('div');
    codeWrapperDiv.className = 'card__code-wrapper';

    const couponCode = document.createElement('span');
    couponCode.className = 'card__code';
    couponCode.textContent = couponData.promoCode;

    const copyBtn = document.createElement('button');
    copyBtn.className =
        `card__copy-btn ${isExpired ? 'card__copy-btn--disabled' : ''}`.trim();

    if (isExpired) {
        copyBtn.disabled = true;
    } else {
        // Copy feature binding on click event
        copyBtn.addEventListener('click', async () => {
            await navigator.clipboard.writeText(couponCode.textContent);
        });
    }

    const copyIcon = document.createElement('span');
    copyIcon.className = 'icon icon-copy';
    copyBtn.append(copyIcon);

    codeWrapperDiv.append(couponCode, copyBtn);

    // Assemble the whole card and add it to the DOM
    couponCard.append(detailsDiv, codeWrapperDiv);
    couponContainer.appendChild(couponCard);

    return couponCard;
};

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

const calculateWinner = () => {
    let normalizedAngle = (1.5 * Math.PI - currentAngle) % (2 * Math.PI);
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;

    const winningIndex = Math.floor(normalizedAngle / arcSize);
    const winnerData = wheelSectors[winningIndex];

    const filterPromo = ({ label, promoCode, validFor }) => {
        const daysToAdd = validFor !== null ? validFor : DEFAULT_VALID_DAYS;
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + daysToAdd);
        return {
            label,
            promoCode,
            validTill: targetDate.toISOString(),
        };
    };
    const processedPromo = filterPromo(winnerData);

    unlockedCouponsData.push(processedPromo);

    // Sync the updated array to Local Storage immediately
    saveUnlockedCoupons(unlockedCouponsData);

    const winText = document.createElement('div');
    winText.className = 'modal__alert';
    winText.textContent = 'You won!';
    winningCouponContainer.appendChild(winText);

    createCouponCard(processedPromo, winningCouponContainer);
    couponsCounter.textContent = unlockedCouponsData.length;
};

spinBtn.addEventListener('click', () => {
    if (initializeWheel(promotions)) {
        spin();
    }
});

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

            // sort active coupons by soonest to expire
            return new Date(a.validTill) - new Date(b.validTill);
        })
        .forEach((coupon) => {
            createCouponCard(coupon, unlockedCouponsContainer);
        });
});

goBackBtn.addEventListener('click', () => {
    panel2.classList.remove('modal__panel--active');
    panel1.classList.add('modal__panel--active');
    couponsCounter.textContent = unlockedCouponsData.length;
});

modalCloseBtn.addEventListener('click', () => {
    modal.close();
    winningCouponContainer.textContent = '';
    panel2.classList.remove('modal__panel--active');
    panel1.classList.add('modal__panel--active');
});
