let allProperties = []; // Global storage for all properties

// Load all properties on page load
window.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/api/properties"); // <-- update API endpoint if needed
        allProperties = await res.json();

        renderProperties(allProperties);        // show everything
        setupFilters();                         // activate filters if used
        initializePagination();                 // if using pagination
    } catch (error) {
        console.error("Failed to fetch properties:", error);
    }
});

// Render the list of properties
function renderProperties(properties) {
    const container = document.querySelector(".property-grid");
    container.innerHTML = "";

    properties.forEach(property => {
        const div = document.createElement("div");
        div.className = "property-item";
        div.innerHTML = `
            <div class="property-details">
                <h3 class="price-line">
                    <span class="price-wrap">
                        ${property.property_name}
                    </span> • ${property.property_type}
                </h3>

                <div class="tags">
                    Owner: ${property.owner_name} • Status: ${property.status} • Monthly Rent: ${parseFloat(property.monthly_rent).toFixed(2)} SAR
                </div>

                <p class="description">${property.description}</p>

                <div class="action-buttons">
                    <button class="edit-btn">Edit</button>
                    <button class="remove-btn">Remove</button>
                    <button class="view-tenants-btn">View Tenants</button>
                </div>

                <button class="show-details-btn">Show more details</button>
            </div>
        `;
        container.appendChild(div);
    });

    initializePagination(); // reset pagination when list changes
}

// Optional: Setup filters (like by type, status, etc.)
function setupFilters() {
    const buttons = document.querySelectorAll('.filter-button');

    if (!buttons.length) {
        console.warn("No filter buttons found.");
        return;
    }

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const selected = button.textContent.trim().toLowerCase();

            if (selected === 'all') {
                renderProperties(allProperties);
            } else {
                const filtered = allProperties.filter(property =>
                    (property.status || "").toLowerCase() === selected
                );
                renderProperties(filtered);
            }
        });
    });
}

// Search functionality
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

searchBtn?.addEventListener("click", handleSearch);
searchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
});

function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        renderProperties(allProperties);
        return;
    }

    const filtered = allProperties.filter(property => {
        return (
            (property.property_name || "").toLowerCase().includes(query) ||
            (property.owner_name || "").toLowerCase().includes(query)
        );
    });

    renderProperties(filtered);
}
