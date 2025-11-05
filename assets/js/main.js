document.addEventListener("DOMContentLoaded", function () {
    const categoryButtons = document.querySelectorAll(".category");
    const menuItems = document.querySelectorAll(".menu-item");

    categoryButtons.forEach(button => {
        button.addEventListener("click", function () {

            categoryButtons.forEach(btn => btn.classList.remove("active"));


            this.classList.add("active");


            const filter = this.getAttribute("data-filter");

            menuItems.forEach(item => {
                if (filter === "all" || item.getAttribute("data-category") === filter) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    });
});
document.addEventListener("DOMContentLoaded", function () {
    const carouselInner = document.querySelector("#carouselExampleIndicators .carousel-inner");
    const carouselIndicators = document.getElementById("carouselIndicators");

    const openBtn = document.getElementById("openBtn");
    const doneBtn = document.getElementById("doneReview");
    const textArea = document.getElementById("messageBox");

    // hide textarea initially
    const showingText = document.getElementById("showingText");
    showingText.style.display = "none";

    // Show textarea on click
    openBtn.addEventListener("click", () => {
        if (showingText.style.display === 'none' ) {
            showingText.style.display = 'block';
        } else {
            showingText.style.display = 'none';
        }

    });

    doneBtn.addEventListener("click", () => {



        const reviewText = textArea.value.trim();


        if (!reviewText) {
            alert("Please write your review before submitting!");
            return;
        }

        showingText.style.display = "none";
        messageBox.value = '';

        // Create new carousel item
        const newItem = document.createElement("div");
        newItem.classList.add("carousel-item");
        newItem.innerHTML = `
            <div class="row justify-content-center">
                <div class="col-md-5 mb-3">
                    <div class="card bg-dark text-white">
                        <div class="card-body">
                            <p class="card-text">${escapeHtml(reviewText)}</p>
                            <h6>Anonymous</h6>
                            <p class="card-text">New Customer Review</p>
                        </div>
                    </div>
                    <div class="clintImage mt-3">
                        <img src="./assets/image/client1.jpg" alt="New Reviewer">
                    </div>
                </div>
            </div>
        `;

        // Remove 'active' from existing
        const activeItem = carouselInner.querySelector(".active");
        if (activeItem) activeItem.classList.remove("active");
        newItem.classList.add("active");

        // Add to carousel
        carouselInner.appendChild(newItem);


        updateIndicators();


        textArea.value = "";
        showingText.style.display = "none";


        const bootstrapCarousel = bootstrap.Carousel.getInstance(document.getElementById("carouselExampleIndicators")) || new bootstrap.Carousel(document.getElementById("carouselExampleIndicators"));
        bootstrapCarousel.to(carouselInner.children.length - 1);
    });

    function updateIndicators() {
        carouselIndicators.innerHTML = '';
        Array.from(carouselInner.children).forEach((item, index) => {
            const button = document.createElement("button");
            button.type = "button";
            button.setAttribute("data-bs-target", "#carouselExampleIndicators");
            button.setAttribute("data-bs-slide-to", index);
            if (item.classList.contains("active")) button.classList.add("active");
            carouselIndicators.appendChild(button);
        });
    }


    function escapeHtml(unsafe) {
        return unsafe
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }


    updateIndicators();
});
