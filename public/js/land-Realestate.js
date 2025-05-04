const params = new URLSearchParams(window.location.search);
const landId = params.get("id");
console.log("✅ land.js is loaded");
console.log("🆔 Loaded land ID:", landId);

async function loadLand() {
  try {
    const res = await fetch(`/api/lands/${landId}`);
    const container = document.getElementById("landDetails");

    if (!res.ok) {
      container.innerHTML = "<p>Land not found.</p>";
      return;
    }

    const land = await res.json();

    
    document.getElementById("landTitle").textContent = `${land.city}, ${land.neighborhood}`;
    document.getElementById("landLocation").textContent = `${land.street_name}, Street Width: ${land.street_width}m`;
    document.getElementById("mainImage").src = land.land_image;

    
    document.getElementById("landPrice").innerHTML = `
  <img src="images/Saudi_riyal.png" alt="SAR" class="sar-symbol" />
  <span class="price-value">${parseFloat(land.price_per_meter).toFixed(2)}</span>
  <span class="price-unit">per meter</span> • 
  <span class="size-value">${parseFloat(land.land_size).toLocaleString()} Meter</span>
`;


    
    document.getElementById("landSpecs").innerHTML = `
      <li><strong>Size:</strong> ${land.land_size} m²</li>
      <li><strong>Dimensions:</strong> ${land.width}m × ${land.height}m</li>
      <li><strong>Purpose:</strong> ${land.purpose}</li>
      <li><strong>Facing:</strong> ${land.facing}</li>
      <li><strong>Has Building:</strong> ${land.has_building ? "Yes" : "No"}</li>
    `;

    
    document.getElementById("landDescription").textContent =
      "This land is located in a prime area and ready for development.";


const ownerName = document.createElement("p");
ownerName.textContent = `Listed by: ${land.owner_name || "Unknown"}`;
ownerName.classList.add("land-owner-name");
document.getElementById("landDescription").insertAdjacentElement("afterend", ownerName);


    
    document.getElementById("deedLink").addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("deedPopupImage").src = land.title_deed;
      document.getElementById("deedPopup").style.display = "block";
      document.getElementById("deedPopupOverlay").style.display = "block";
    });
    
    document.getElementById("closeDeedPopup").addEventListener("click", () => {
      document.getElementById("deedPopup").style.display = "none";
      document.getElementById("deedPopupOverlay").style.display = "none";
    });
    
  

  } catch (err) {
    document.getElementById("landDetails").innerHTML = "<p>Error loading land.</p>";
    console.error("Fetch error:", err);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  loadLand();
});
