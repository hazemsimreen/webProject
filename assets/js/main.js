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
