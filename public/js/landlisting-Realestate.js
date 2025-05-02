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
                <h3 class="price-line">
  <span class="price-wrap">
    <span class="sar-symbol"></span>
    ${parseFloat(land.price_per_meter).toFixed(2)} 
  </span>&nbsp; per meter • ${land.land_size.toLocaleString()} Meter
</h3>


                <div class="tags">
                    ${land.purpose} • ${land.facing} • ${land.has_building === 1 || land.has_building === true ? "Yes" : "No"}
                </div>
                <p class="location">${land.city}, ${land.neighborhood}, ${land.street_name}</p>
<div class="owner">
  <img src="images/blank-profile-circle.png" alt="Owner">
  <span>${land.owner_name || "Unknown"}</span>

  <div class="proposal-actions">
    <a href="land-Realestate.html?id=${land.land_id}" class="view-link">View</a>
    <a href="MakeProposal.html?id=${land.land_id}" class="view-link">Make A Proposal</a>
  </div>
</div>

            </div>
        `;
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
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", handleSearch);
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSearch();
});

function handleSearch() {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        renderLands(allLands);
        return;
    }

    const filtered = allLands.filter(land => {
        return (
            (land.city || "").toLowerCase().includes(query) ||
            (land.neighborhood || "").toLowerCase().includes(query) ||
            (land.street_name || "").toLowerCase().includes(query)
        );
    });

    renderLands(filtered);
}


