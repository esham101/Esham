const openBtn = document.getElementById('openPopup');
const closeBtn = document.getElementById('closePopup');
const popup = document.getElementById('popup');
const overlay = document.getElementById('popupOverlay');

// Open popup
openBtn?.addEventListener('click', () => {
  popup.classList.add('active');
  overlay.classList.add('active');
});

// Close popup
closeBtn?.addEventListener('click', closePopup);

// Close popup when clicking outside
window.addEventListener('click', (event) => {
  if (event.target === overlay) {
    closePopup();
  }
});

function closePopup() {
  popup.classList.remove('active');
  overlay.classList.remove('active');
}

// Validate Land Image Upload
document.getElementById("addLandForm").addEventListener("submit", function (e) {
  const landImageInput = document.getElementById("landImage");

  if (landImageInput.files.length > 0) {
    const file = landImageInput.files[0];
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = function () {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const ratio = width / height;
      
        const isAcceptedRatio =
          (ratio >= 1.95 && ratio <= 2.05) ||   // 2:1 ratio
          (ratio >= 1.45 && ratio <= 1.55);     // 3:2 ratio
      
        if (!isAcceptedRatio) {
          e.preventDefault();
          alert("❌ Please upload an image with a 2:1 (1200×600) or 3:2 (1500×1000) ratio.");
        } else {
          // ✅ Instead of this.submit(), manually submit the form:
          document.getElementById("addLandForm").submit();
        }
      };
      

    img.onerror = function () {
      e.preventDefault();
      alert("❌ Error loading the image. Please try again.");
    };

    e.preventDefault(); // Pause submitting until image loads and is validated
  }
});
