let userId;
let currentUser;
let notifications = [];

const toggleButton = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

// 🔵 DOMContentLoaded (only one)
document.addEventListener("DOMContentLoaded", function () {
  fetch("http://localhost:3000/api/session")
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn) {
        userId = data.user.id;
        currentUser = data.user;
        updateWelcomeMessage(currentUser.name);

        closeModal(); 
        loadUserProfile();
        loadNotifications();
        loadProposals();
        loadLands(); 
        
        const savedMode = localStorage.getItem("darkMode");
        if (savedMode === "enabled") {
          document.body.classList.add("dark-mode");
        }
      } else {
        window.location.href = "/login"; // Not logged in, redirect
      }
    })
    .catch(err => console.error("Session load error:", err));
});

// 🔵 Sidebar
function toggleSidebar() {
  sidebar.classList.toggle('close');
  document.querySelector('.main-content').classList.toggle('expanded');
  toggleButton.classList.toggle('rotate');
  closeAllSubMenus();

  setTimeout(() => {
    if (window.revenueChart) window.revenueChart.resize();
    if (window.proposalsSentChart) window.proposalsSentChart.resize();
    if (window.proposalsAcceptedChart) window.proposalsAcceptedChart.resize();
  }, 300);
}
window.toggleSidebar = toggleSidebar;

function toggleSubMenu(button) {
  if (!button.nextElementSibling.classList.contains('show')) closeAllSubMenus();
  button.nextElementSibling.classList.toggle('show');
  button.classList.toggle('rotate');
  if (sidebar.classList.contains('close')) toggleSidebar();
}

function closeAllSubMenus() {
  Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
    ul.classList.remove('show');
    ul.previousElementSibling.classList.remove('rotate');
  });
}

// 🔵 Dashboard sections
function updateWelcomeMessage(name) {
  const welcomeTitle = document.getElementById("welcomeTitle");
  if (welcomeTitle) welcomeTitle.innerHTML = `Welcome ${name}! 👋`;
}

function loadUserProfile() {
  fetch(`http://localhost:3000/api/landowner/user/${userId}`)
    .then(res => res.json())
    .then(user => {
      window.currentUser = user;
      const welcomeTitle = document.querySelector(".welcome-title");
      if (welcomeTitle && user.name) welcomeTitle.innerHTML = `Welcome ${user.name}!`;
    })
    .catch(err => console.error("Error loading user profile:", err));
}




// 🔵 Proposals
function loadProposals() {
  fetch("http://localhost:3000/api/landowner/proposals")
    .then(res => res.json())
    .then(data => {
      const sent = data.filter(p => p.status === 'Pending' || p.status === 'Rejected');
      const accepted = data.filter(p => p.status === 'Accepted');

      populateTable(sent, "proposalsSentData");
      populateTable(accepted, "proposalsAcceptedData");

      renderProposalsSentChart(sent);
      renderProposalsAcceptedChart(accepted);

      if (accepted.length > 0) loadProjectProgress(accepted[0].id);
    })
    .catch(err => console.error("Error loading proposals:", err));
}

function populateTable(data, tableId) {
  const tableBody = document.getElementById(tableId);
  tableBody.innerHTML = "";
  data.forEach(item => {
    tableBody.innerHTML += `<tr><td>${item.name}</td><td>${item.date}</td><td>${item.status}</td></tr>`;
  });
}

function renderProposalsSentChart(data) {
  const ctx = document.getElementById("proposalsSentChart").getContext("2d");
  const monthLabels = [...new Set(data.map(p => p.date.slice(0, 7)))];
  const countMap = {};

  monthLabels.forEach(month => {
    countMap[month] = data.filter(p => p.date.startsWith(month)).length;
  });

  window.proposalsSentChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: Object.keys(countMap),
      datasets: [{
        label: "Sent",
        data: Object.values(countMap),
        borderColor: "#43A047",
        backgroundColor: "transparent",
        borderWidth: 2,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true }, x: {} }
    }
  });
}

function renderProposalsAcceptedChart(data) {
  const ctx = document.getElementById("proposalsAcceptedChart").getContext("2d");
  const monthLabels = [...new Set(data.map(p => p.date.slice(0, 7)))];
  const countMap = {};

  monthLabels.forEach(month => {
    countMap[month] = data.filter(p => p.date.startsWith(month)).length;
  });

  window.proposalsAcceptedChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: Object.keys(countMap),
      datasets: [{
        label: "Accepted",
        data: Object.values(countMap),
        borderColor: "#43A047",
        backgroundColor: "transparent",
        borderWidth: 2,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: { legend: { display: false } }
    }
  });
}

// 🔵 Lands Listing
function loadLands() {
  fetch("http://localhost:3000/api/landowner/lands")
    .then(res => res.json())
    .then(data => {
      populateLandListingTable(data, "revenueData"); // ✅
      renderRevenueChart(data);
    })
    .catch(err => console.error("Error loading lands:", err));
}

function populateLandListingTable(data, tableId) {
  const tableBody = document.getElementById(tableId);
  tableBody.innerHTML = "";

  data.forEach(item => {
    const row = `
      <tr>
        <td>Land #${item.land_id}</td>
        <td>${item.land_size} sqm</td>
        <td><div class="sar-symbol"></div> ${item.price_per_meter} </td>

        <td style="text-align: right;">
          <a href="land.html?id=${item.land_id}" class="more-link">More</a>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}







function renderRevenueChart(data) {
  const ctx = document.getElementById("revenueChart").getContext("2d");
  const labels = data.map(item => `Land #${item.land_id}`);
  const values = data.map(item => item.price_per_meter);

  window.revenueChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Price per Meter",
        data: values,
        backgroundColor: "#43A047",
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true }, x: {} }
    }
  });
}

// 🔵 Notifications
function loadNotifications() {
  fetch(`http://localhost:3000/api/notifications/${userId}`)
    .then(res => res.json())
    .then(data => {
      notifications = data;
      updateNotificationBadge();
    });
}

function updateNotificationBadge() {
  const badge = document.getElementById('notif-badge');
  const count = notifications.length;
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = 'inline-block';
  } else {
    badge.style.display = 'none';
  }
}

// 🔵 Modal
function openModal(type) {
  const modal = document.getElementById("modal");
  const body = document.getElementById("modal-body");
  modal.style.display = "flex";

  if (type === 'profile') {
    body.innerHTML = `<p>Edit Profile (to be implemented)</p>`;
  }
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function loadProjectProgress(proposalId) {
  fetch(`http://localhost:3000/api/progress/${proposalId}`)
    .then(res => res.json())
    .then(data => {
      renderProgressTimeline(data);
    })
    .catch(err => console.error("Error loading project progress:", err));
}

function renderProgressTimeline(data) {
  const container = document.getElementById("progressTimeline");
  container.innerHTML = "";

  if (data.length === 0) {
    container.innerHTML = "<p>No progress updates found.</p>";
    return;
  }

  data.forEach(item => {
    const block = document.createElement("div");
    block.className = "progress-item";
    block.innerHTML = `
      <h4>${item.stage} (${item.progress_percent}%)</h4>
      <p>${item.description}</p>
      <small>Updated: ${new Date(item.updated_at).toLocaleString()}</small>
      <hr>
    `;
    container.appendChild(block);
  });
}
