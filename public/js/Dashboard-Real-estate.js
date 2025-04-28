let userId = 1; // Simulate logged in user
let notifications = [];

const toggleButton = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

function toggleSidebar() {
  sidebar.classList.toggle('close');
  toggleButton.classList.toggle('rotate');
  closeAllSubMenus();
}

function toggleSubMenu(button) {
  if (!button.nextElementSibling.classList.contains('show')) {
    closeAllSubMenus();
  }

  button.nextElementSibling.classList.toggle('show');
  button.classList.toggle('rotate');

  if (sidebar.classList.contains('close')) {
    sidebar.classList.toggle('close');
    toggleButton.classList.toggle('rotate');
  }
}

function closeAllSubMenus() {
  Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
    ul.classList.remove('show');
    ul.previousElementSibling.classList.remove('rotate');
  });
}

document.addEventListener("DOMContentLoaded", function () {
  closeModal();
  loadUserProfile();
  loadSettings();
  loadNotifications();
  loadProposals();
  loadRevenue();

  // Load dark mode from localStorage
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "enabled") {
    document.body.classList.add("dark-mode");
  }
});

function loadProposals() {
  fetch("http://localhost:3000/api/proposals")
    .then(res => res.json())
    .then(data => {
      const sent = data.filter(p => p.status === 'Pending' || p.status === 'Rejected');
      const accepted = data.filter(p => p.status === 'Accepted');

      populateTable(sent, "proposalsSentData");
      populateTable(accepted, "proposalsAcceptedData");

      renderProposalsSentChart(sent);
      renderProposalsAcceptedChart(accepted);

      if (accepted.length > 0) {
        loadProjectProgress(accepted[0].id);
      }
    })
    .catch(err => console.error("Error loading proposals:", err));
}

function loadRevenue() {
  fetch("http://localhost:3000/api/revenue")
    .then(res => res.json())
    .then(data => {
      populateRevenueTable(data, "revenueData");
      renderRevenueChart(data);
    })
    .catch(err => console.error("Error loading revenue:", err));
}

function populateRevenueTable(data, tableId) {
  const tableBody = document.getElementById(tableId);
  tableBody.innerHTML = "";

  data.forEach(item => {
    const row = `<tr><td>${item.project}</td><td>${item.date}</td><td>${item.revenue}</td></tr>`;
    tableBody.innerHTML += row;
  });
}

function loadUserProfile() {
  fetch(`http://localhost:3000/api/user/${userId}`)
    .then(res => res.json())
    .then(user => {
      window.currentUser = user;
    });
}

function loadSettings() {
  fetch(`http://localhost:3000/api/settings/${userId}`)
    .then(res => res.json())
    .then(settings => {
      if (settings && 'dark_mode' in settings) {
        applyTheme(settings.dark_mode);
      }
    })
    .catch(err => console.error("Error loading settings:", err));
}

function saveSettings() {
  const darkMode = document.getElementById("darkMode").checked;

  fetch("http://localhost:3000/api/settings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, dark_mode: darkMode })
  })
    .then(res => res.json())
    .then(data => {
      applyTheme(darkMode);
      localStorage.setItem("darkMode", darkMode ? "enabled" : "disabled");
      alert(data.message);
      closeModal();
    })
    .catch(err => console.error("Settings save error:", err));
}

function applyTheme(enabled) {
  const root = document.documentElement;
  if (enabled) {
    document.body.classList.add("dark-mode");
    root.style.setProperty('--base-clr', '#121212');
    root.style.setProperty('--text-clr', '#ffffff');
    root.style.setProperty('--hover-clr', '#1e1e1e');
    root.style.setProperty('--line-clr', '#2e7d32');
    root.style.setProperty('--secondary-text-clr', '#cccccc');
    root.style.setProperty('--card-bg-light', '#1f1f1f');
    root.style.setProperty('--dark-shadow', 'rgba(255, 255, 255, 0.05)');
    root.style.setProperty('--table-header-bg', '#2c2c2c');
    root.style.setProperty('--text-clr-light', '#ffffff');
    root.style.setProperty('--dark-border', '#444');
  } else {
    document.body.classList.remove("dark-mode");
    root.style.setProperty('--base-clr', '#f4f4f4');
    root.style.setProperty('--text-clr', '#000000');
    root.style.setProperty('--hover-clr', '#e6e6e6');
    root.style.setProperty('--line-clr', '#215321');
    root.style.setProperty('--secondary-text-clr', '#b0b3c1');
    root.style.setProperty('--card-bg-light', '#ffffff');
    root.style.setProperty('--dark-shadow', 'rgba(0, 0, 0, 0.1)');
    root.style.setProperty('--table-header-bg', '#253732');
    root.style.setProperty('--text-clr-light', '#f4f4f4');
    root.style.setProperty('--dark-border', '#ddd');
  }
}

function openModal(type) {
  const modal = document.getElementById("modal");
  const body = document.getElementById("modal-body");

  if (type === 'profile') {
    fetch(`http://localhost:3000/api/user/${userId}`)
      .then(res => res.json())
      .then(user => {
        body.innerHTML = `
        <h2>👤 Edit Profile</h2>
        <form id="editProfileForm" class="modal-form">
          <label for="name">Full Name</label>
          <input type="text" id="name" value="${user.name}" placeholder="Enter full name" />
      
          <label for="email">Email Address</label>
          <input type="email" id="email" value="${user.email}" placeholder="Enter email" />
      
          <button type="submit" class="modal-button">💾 Save Changes</button>
        </form>
      `;
      
        document.getElementById("editProfileForm").onsubmit = function (e) {
          e.preventDefault();
          const name = document.getElementById("name").value;
          const email = document.getElementById("email").value;

          fetch("http://localhost:3000/api/user/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: userId, name, email })
          })
            .then(res => res.json())
            .then(data => {
              alert(data.message);
              closeModal();
            });
        };
      });
  } else if (type === 'settings') {
    body.innerHTML = `
    <h2>⚙️ Settings</h2>
    <form class="modal-form">
      <label>
        <input type="checkbox" id="darkMode"> Enable Dark Mode
      </label>
      <button onclick="saveSettings()" class="modal-button">💾 Save Settings</button>
    </form>
  `;
  

    fetch(`http://localhost:3000/api/settings/${userId}`)
      .then(res => res.json())
      .then(settings => {
        const checkbox = document.getElementById("darkMode");
        checkbox.checked = settings.dark_mode;
        applyTheme(settings.dark_mode);

        checkbox.addEventListener("change", function () {
          toggleDarkMode(this.checked);
        });
      });
  } else if (type === 'notifications') {
    let html = `
      <h2>🔔 Notifications</h2>
      <div class="modal-form">
        <ul style="list-style: disc; padding-left: 20px; margin-bottom: 24px;">`;
    
    if (notifications.length === 0) {
      html += `<li>No new notifications</li>`;
    } else {
      notifications.forEach(n => {
        html += `<li style="margin-bottom: 8px;">${n.message}</li>`;
      });
    }
  
    html += `
        </ul>
        <div style="display: flex; justify-content: flex-end;">
          <button onclick="closeModal()" class="modal-button">Close</button>
        </div>
      </div>`;
    
    body.innerHTML = html;
  }
  
  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function toggleDarkMode(isDark) {
  applyTheme(isDark);
  localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
}

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

function populateTable(data, tableId) {
  const tableBody = document.getElementById(tableId);
  tableBody.innerHTML = "";
  data.forEach(item => {
    const row = `<tr><td>${item.name}</td><td>${item.date}</td><td>${item.status}</td></tr>`;
    tableBody.innerHTML += row;
  });
}

function renderRevenueChart(data) {
  const ctx = document.getElementById("revenueChart").getContext("2d");
  const labels = data.map(item => item.date);
  const values = data.map(item => item.revenue);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Revenue",
        data: values,
        backgroundColor: "#43A047",
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#737373' },
          grid: { color: '#e5e5e5' }
        },
        x: {
          ticks: { color: '#737373' },
          grid: { display: false }
        }
      }
    }
  });
}

function renderProposalsSentChart(data) {
  const ctx = document.getElementById("proposalsSentChart").getContext("2d");
  const monthLabels = [...new Set(data.map(p => p.date.slice(0, 7)))];
  const countMap = {};

  monthLabels.forEach(month => {
    countMap[month] = data.filter(p => p.date.startsWith(month)).length;
  });

  new Chart(ctx, {
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
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true },
        x: {}
      }
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

  new Chart(ctx, {
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
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { beginAtZero: true },
        x: {}
      }
    }
  });
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

