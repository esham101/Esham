const openBtn = document.getElementById('openPopup');
const closeBtn = document.getElementById('closePopup');
const popup = document.getElementById('popup');
const overlay = document.getElementById('popupOverlay');

openBtn?.addEventListener('click', () => {
    popup.classList.add('active');
    overlay.classList.add('active');
});

closeBtn?.addEventListener('click', closePopup);

window.addEventListener('click', (event) => {
    if (event.target === overlay) {
        closePopup();
    }
});

function closePopup() {
    popup.classList.remove('active');
    overlay.classList.remove('active');
}
