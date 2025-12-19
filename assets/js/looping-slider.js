// Horizontal Looping Food Slider - Shows 3 meals at a time with infinite loop
console.log("🎠 Initializing looping food slider...");

document.addEventListener("DOMContentLoaded", function() {
    const menuContainer = document.querySelector(".menuContnts .row");
    if (!menuContainer) return;

    let allMeals = []; // Store meals globally for filtering

    // Fetch meals from database
    fetch("php/Meals.php?getMeals=1")
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch meals');
            return res.json();
        })
        .then(meals => {
            if (meals.length === 0) {
                menuContainer.innerHTML = '<p class="text-center text-white">No meals available</p>';
                return;
            }

            allMeals = meals; // Store for filtering
            initializeSlider(meals);
            setupCategoryFilters(); // Setup filters after loading meals
            console.log(`✅ Looping slider ready with ${meals.length} meals!`);
        })
        .catch(err => {
            console.error("❌ Failed to load meals:", err);
            menuContainer.innerHTML = '<p class="text-center text-white">Failed to load meals. Please try again later.</p>';
        });

    function createSliderHTML(meals) {
        return `
            <div class="food-slider-wrapper">
                <button class="slider-nav-btn prev-btn" id="prevBtn">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
                <div class="slider-viewport">
                    <div class="slider-track">
                        ${meals.map(meal => `
                            <div class="food-card menu-item" data-id="${meal.id}" data-category="${meal.category}">
                                <div class="food-card-image">
                                    <img src="${meal.image}" alt="${meal.name}">
                                </div>
                                <div class="food-card-content">
                                    <h3 class="food-card-title">${meal.name}</h3>
                                    <p class="food-card-description">${meal.description.substring(0, 60)}...</p>
                                    <div class="food-card-footer">
                                        <span class="food-card-price">$${meal.price}</span>
                                        <button class="food-card-cart add-to-cart-btn" data-id="${meal.id}">
                                            <i class="fa-solid fa-cart-shopping"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <button class="slider-nav-btn next-btn" id="nextBtn">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>
        `;
    }

    function setupSliderControls(meals) {
        const track = menuContainer.querySelector('.slider-track');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (!track || !prevBtn || !nextBtn) return;

        let currentIndex = 0;
        const cardsPerView = 3;
        const totalCards = meals.length;
        const totalGroups = Math.ceil(totalCards / cardsPerView);

        function updateSlider(instant = false) {
            const cardWidth = 320;
            const offset = -currentIndex * cardsPerView * cardWidth;

            if (instant) {
                track.style.transition = 'none';
            } else {
                track.style.transition = 'transform 0.8s ease';
            }

            track.style.transform = `translateX(${offset}px)`;

            if (instant) {
                track.offsetHeight;
            }
        }

        // Remove old event listeners by cloning buttons
        const newNextBtn = nextBtn.cloneNode(true);
        const newPrevBtn = prevBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);

        newNextBtn.addEventListener('click', () => {
            currentIndex++;
            if (currentIndex >= totalGroups) {
                currentIndex = 0;
            }
            updateSlider();
        });

        newPrevBtn.addEventListener('click', () => {
            currentIndex--;
            if (currentIndex < 0) {
                currentIndex = totalGroups - 1;
            }
            updateSlider();
        });

        updateSlider(true);
    }

    function initializeSlider(meals) {
        menuContainer.innerHTML = createSliderHTML(meals);
        setupSliderControls(meals);
        addSliderStyles();
    }

    function setupCategoryFilters() {
        const categoryButtons = document.querySelectorAll(".category");

        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');

                // Remove active class from all buttons
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                // Filter meals
                let filteredMeals = allMeals;
                if (filter !== 'all') {
                    filteredMeals = allMeals.filter(meal => meal.category === filter);
                }

                // Handle empty results
                if (filteredMeals.length === 0) {
                    menuContainer.innerHTML = '<p class="text-center text-white">No meals in this category</p>';
                    return;
                }

                // Rebuild slider with filtered meals
                initializeSlider(filteredMeals);
            });
        });
    }

    function addSliderStyles() {
        // Check if styles already exist
        if (document.getElementById('slider-styles')) return;

        const style = document.createElement('style');
        style.id = 'slider-styles';
        style.textContent = `
            .food-slider-wrapper {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 40px 0;
                max-width: 100%;
                width: 100%;
                flex: 0 0 100%;
                margin: 0 auto;
            }

            .slider-viewport {
                overflow: hidden;
                width: 100%;
                max-width: 960px;
            }

            .slider-track {
                display: flex;
                gap: 20px;
                transition: transform 0.8s ease;
                padding: 0 10px;
            }

            .food-card {
                flex: 0 0 300px;
                width: 300px;
                height: 420px;
                background: white;
                border-radius: 20px;
                box-shadow: 0 8px 20px rgba(0,0,0,0.15);
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .food-card-image {
                flex: 0 0 200px;
                background: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .food-card-image img {
                max-width: 100%;
                max-height: 160px;
                object-fit: contain;
            }

            .food-card-content {
                flex: 1;
                background: #111;
                color: white;
                padding: 20px;
                display: flex;
                flex-direction: column;
            }

            .food-card-title {
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 10px 0;
                color: white;
            }

            .food-card-description {
                font-size: 13px;
                color: #aaa;
                margin: 0 0 auto 0;
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }

            .food-card-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-top: 15px;
            }

            .food-card-price {
                font-size: 20px;
                font-weight: 700;
                color: white;
            }

            .food-card-cart {
                width: 45px;
                height: 45px;
                border-radius: 50%;
                background: #ffbe33;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s ease, background 0.2s ease;
            }

            .food-card-cart:hover {
                background: #ff9800;
                transform: scale(1.1);
            }

            .slider-nav-btn {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: rgba(0,0,0,0.6);
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                z-index: 10;
                transition: background 0.3s ease;
            }

            .slider-nav-btn:hover {
                background: rgba(0,0,0,0.8);
            }

            .slider-nav-btn.prev-btn {
                left: -25px;
            }

            .slider-nav-btn.next-btn {
                right: -25px;
            }
        `;
        document.head.appendChild(style);
    }
});