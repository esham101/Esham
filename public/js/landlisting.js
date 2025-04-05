let allLands = []; // Global storage for all fetched lands

// Load all lands on page load
window.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/api/lands");
        allLands = await res.json();

        renderLands(allLands);        // show everything
        setupFilters();               // activate filters
        initializePagination();       // if using pagination
    } catch (error) {
        console.error("Failed to fetch lands:", error);
    }
});

// Render the list of lands
function renderLands(lands) {
    const container = document.querySelector(".property-grid");
    container.innerHTML = "";

    lands.forEach(land => {
        const div = document.createElement("div");
        div.className = "property-item";
        div.innerHTML = `
    <img src="${land.land_image}" alt="Land Image" />
    
    <div class="property-details">
        <h3>${land.price_per_meter} SAR per meter • ${land.land_size.toLocaleString()} Meter</h3>

        <div class="tags">Empty • New • To be assigned</div>

        <p class="location">${land.city}, ${land.neighborhood}, ${land.street_name}</p>

        <div class="owner">
            <img src="images/profile-placeholder.png" alt="Owner">
            <span>Personal owner</span>
            <a href="#" class="view-link">View</a>
        </div>
    </div>
`;


        // Add more details as needed
        container.appendChild(div);
    });

    initializePagination(); // reset pagination when list changes
}

// Setup facing filter buttons
function setupFilters() {
    const buttons = document.querySelectorAll('.filter-button');

    if (!buttons.length) {
        console.warn("No filter buttons found.");
        return;
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            console.log("Clicked:", button.textContent); // Debug

            // Update active style
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const selected = button.textContent.trim().toLowerCase();

            if (selected === 'all') {
                renderLands(allLands);
            } else {
                const filtered = allLands.filter(land =>
                    (land.facing || "").toLowerCase() === selected
                );
                renderLands(filtered);
            }
        });
    });
}
