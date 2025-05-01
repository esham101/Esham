document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/session")
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn) {
        const nav = document.getElementById("nav-right");
        if (!nav) return;

        const role = data.user.role;
        const name = data.user.name;
        const dashboardLink = role === "landowner"
          ? "/Dashboard-Land-Owner.html"
          : "/Dashboard-Real-estate.html";

        nav.innerHTML = `
          <li class="nav-user">
            <button class="nav-user-btn" onclick="toggleUserMenu()">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" stroke-linejoin="round" stroke-linecap="round" viewBox="0 0 24 24" stroke-width="2" fill="none" stroke="currentColor">
                <circle cx="12" cy="7" r="4"></circle>
                <path d="M5.5 21a9 9 0 0 1 13 0"></path>
              </svg>
            </button>
            <div id="nav-user-dropdown" class="nav-user-dropdown">
              <div class="nav-user-name">${name}</div>
              <a href="${dashboardLink}">Dashboard</a>
              <a href="/update-account">Update Account</a>
              <a href="/logout">Logout</a>
            </div>
          </li>
        `;
      }
    });
});

function toggleUserMenu() {
  const dropdown = document.getElementById("nav-user-dropdown");
  if (dropdown) {
    dropdown.classList.toggle("show-dropdown");
  }
}
