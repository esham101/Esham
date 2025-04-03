// Popup functionality to show and hide it with animation
document.getElementById('openPopup').addEventListener('click', () => {
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('popupOverlay');

    // Make the overlay and popup visible, add animation
    overlay.classList.add('show');
    setTimeout(() => {
        popup.classList.add('show');
    }, 10); // Ensure the overlay shows before popup to trigger animation
});

document.getElementById('closePopup').addEventListener('click', () => {
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('popupOverlay');

    // Remove popup and overlay visibility with animation
    popup.classList.remove('show');
    overlay.classList.remove('show');
});

window.addEventListener('click', (event) => {
    if (event.target === document.getElementById('popupOverlay')) {
        const popup = document.getElementById('popup');
        const overlay = document.getElementById('popupOverlay');

        popup.classList.remove('show');
        overlay.classList.remove('show');
    }
});
