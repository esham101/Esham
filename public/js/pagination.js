// Make initializePagination global
window.initializePagination = function () {
    const itemsPerRow = 3; // Number of items per row in the grid
    const rowsPerPage = 5; // Maximum rows per page
    const itemsPerPage = itemsPerRow * rowsPerPage; // Total items per page
    const paginationContainer = document.getElementById('pagination');

    let leftArrow, rightArrow;
    let currentPage = 1;

    const properties = Array.from(document.querySelectorAll('.property-item'));
    const totalPages = Math.ceil(properties.length / itemsPerPage);

    function showPage(page) {
        properties.forEach((property, index) => {
            const start = (page - 1) * itemsPerPage;
            const end = page * itemsPerPage;
            property.style.display = index >= start && index < end ? 'block' : 'none';
        });

        // Update active button state
        document.querySelectorAll('.pagination button').forEach((btn) => {
            btn.classList.remove('active');
        });
        document.querySelector(`.pagination button[data-page="${page}"]`)?.classList.add('active');

        leftArrow.disabled = (page === 1);
        rightArrow.disabled = (page === totalPages);
    }

    function createPaginationButtons() {
        paginationContainer.innerHTML = ""; // Clear existing

        // Left Arrow
        leftArrow = document.createElement('button');
        leftArrow.textContent = '‹';
        leftArrow.classList.add('arrow');
        leftArrow.disabled = true;
        leftArrow.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                showPage(currentPage);
            }
        });
        paginationContainer.appendChild(leftArrow);

        // Page Numbers
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.setAttribute('data-page', i);
            if (i === currentPage) button.classList.add('active');

            button.addEventListener('click', () => {
                currentPage = i;
                showPage(currentPage);
            });

            paginationContainer.appendChild(button);
        }

        // Right Arrow
        rightArrow = document.createElement('button');
        rightArrow.textContent = '›';
        rightArrow.classList.add('arrow');
        rightArrow.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                showPage(currentPage);
            }
        });
        paginationContainer.appendChild(rightArrow);
    }

    // Run pagination setup
    createPaginationButtons();
    showPage(currentPage);
};
