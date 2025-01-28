document.addEventListener('DOMContentLoaded', () => {
    const itemsPerRow = 3; // Number of items per row in the grid
    const rowsPerPage = 5; // Maximum rows per page
    const itemsPerPage = itemsPerRow * rowsPerPage; // Total items per page
    const propertyGrid = document.querySelector('.property-grid');
    const paginationContainer = document.getElementById('pagination');

    const properties = Array.from(propertyGrid.children); // List of all property containers
    const totalPages = Math.ceil(properties.length / itemsPerPage); // Total number of pages

    let currentPage = 1;

    // Function to show only the items for the current page
    function showPage(page) {
        properties.forEach((property, index) => {
            const start = (page - 1) * itemsPerPage;
            const end = page * itemsPerPage;

            // Show items within the range, hide others
            if (index >= start && index < end) {
                property.style.display = 'block'; // Show the item
            } else {
                property.style.display = 'none'; // Hide the item
            }
        });

        // Update active page button
        document.querySelectorAll('.pagination button').forEach((btn) => {
            btn.classList.remove('active');
        });
        document.querySelector(`.pagination button[data-page="${page}"]`).classList.add('active');
    }

    // Function to create pagination buttons with arrows
    function createPaginationButtons() {
        // Add left arrow
        const leftArrow = document.createElement('button');
        leftArrow.textContent = '‹'; // Left arrow symbol
        leftArrow.classList.add('arrow');
        leftArrow.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                showPage(currentPage);
            }
        });
        paginationContainer.appendChild(leftArrow);

        // Add numbered buttons
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.setAttribute('data-page', i);

            // Mark the first button as active by default
            if (i === currentPage) {
                button.classList.add('active');
            }

            // Add click event to switch pages
            button.addEventListener('click', () => {
                currentPage = i;
                showPage(currentPage);
            });

            paginationContainer.appendChild(button);
        }

        // Add right arrow
        const rightArrow = document.createElement('button');
        rightArrow.textContent = '›'; // Right arrow symbol
        rightArrow.classList.add('arrow');
        rightArrow.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                showPage(currentPage);
            }
        });
        paginationContainer.appendChild(rightArrow);
    }

    // Initialize pagination and display the first page
    createPaginationButtons();
    showPage(currentPage);
});
