let userId; // Simulate logged in user
let notifications = [];
let userId;
let currentUser;

const toggleButton = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');

// Sidebar Toggle
function toggleSidebar() {
  sidebar.classList.toggle('close');
  document.querySelector('.main-content').classList.toggle('expanded');
  toggleButton.classList.toggle('rotate');
}
window.toggleSidebar = toggleSidebar;

document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/session")
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn) {
        userId = data.user.id;  // ✅ realestate_id assigned
        closeModal();
        loadUserProfile();
        loadSettings();
        loadNotifications();
        loadProposals();
        loadRevenue();

        const savedMode = localStorage.getItem("darkMode");
        if (savedMode === "enabled") {
          document.body.classList.add("dark-mode");
        }
      } else {
        window.location.href = "/login";
      }
    })
    .catch(err => console.error("Session load error:", err));
});


function loadProposals() {
  fetch("http://localhost:3000/api/proposals")
document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/session")
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn) {
        userId = data.user.id;
        currentUser = data.user;
        updateWelcomeMessage(currentUser.name);
        loadRevenue();
        loadProposals();
      } else {
        window.location.href = "/login";
      }
    });
});

function updateWelcomeMessage(name) {
  const welcome = document.querySelector(".welcome-title");
  if (welcome) welcome.textContent = `Welcome ${name}! 👋`;
}

// Load Revenue
function loadRevenue() {
  fetch("/api/realestate/revenue")
    .then(res => res.json())
    .then(data => {
      populateRevenueTable(data);
      renderRevenueChart(data);
    });
}

function populateRevenueTable(data) {
  const table = document.getElementById("revenueData");
  table.innerHTML = "";
  data.forEach(item => {
    table.innerHTML += `
      <tr>
        <td>${item.project}</td>
        <td>${item.date}</td>
        <td>${item.revenue.toLocaleString()} SAR</td>
      </tr>
    `;
  });
}

function renderRevenueChart(data) {
  const ctx = document.getElementById("revenueChart").getContext("2d");
  const labels = data.map(d => d.project);
  const values = data.map(d => d.revenue);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Revenue",
        data: values,
        backgroundColor: "#43A047",
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// Load Proposals
import { dummyProposals } from './data.js';

function loadProposals() {
  const sent = dummyProposals.filter(p => p.status === 'Pending' || p.status === 'Rejected');
  const accepted = dummyProposals.filter(p => p.status === 'Accepted');

  populateTable(sent, "proposalsSentData");
  populateTable(accepted, "proposalsAcceptedData");

  renderProposalsSentChart(sent);
  renderProposalsAcceptedChart(accepted);

  if (accepted.length > 0) {
    loadProjectProgress(accepted[0].id || 1); // or use dummy id
  }
}



function populateTable(data, tableId) {
  const tableBody = document.getElementById(tableId);
  tableBody.innerHTML = "";

  data.forEach(item => {
    const company = item.company || "Unknown";
    const date = item.date || "N/A";
    const status = item.status || "Pending";

    tableBody.innerHTML += `
      <tr>
        <td>${company}</td>
        <td>${date}</td>
        <td>${status}</td>
      </tr>`;
  });
}




function renderProposalsSentChart(data) {
  const ctx = document.getElementById("proposalsSentChart").getContext("2d");
  const monthLabels = [...new Set(data.map(p => (p.date || "").slice(0, 7)).filter(Boolean))];
  const countMap = {};

  monthLabels.forEach(month => {
    countMap[month] = data.filter(p => (p.date || "").startsWith(month)).length;
  });

  if (window.proposalsSentChart) window.proposalsSentChart.destroy(); // avoid duplicates

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

  // Extract valid months
  const monthLabels = [...new Set(data.map(p => (p.date || "").slice(0, 7)).filter(Boolean))];
  const countMap = {};

  monthLabels.forEach(month => {
    countMap[month] = data.filter(p => (p.date || "").startsWith(month)).length;
  });

  // Destroy previous chart instance if exists
  if (window.proposalsAcceptedChart) {
    window.proposalsAcceptedChart.destroy();
  }

  // Create new chart
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
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true },
        x: {}
      }
    }
  });
}

// Project Progression
function loadProjectProgress(proposalId) {
  fetch(`/api/progress/${proposalId}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("progressTimeline");
      container.innerHTML = "";

      if (data.length === 0) {
        container.innerHTML = "<p>No progress updates yet.</p>";
        return;
      }

      data.forEach(item => {
        const block = document.createElement("div");
        block.className = "progress-item";
        block.innerHTML = `
          <h4>${item.stage} (${item.progress_percent}%)</h4>
          <p>${item.description}</p>
          <small>${new Date(item.updated_at).toLocaleString()}</small>
          <hr>
        `;
        container.appendChild(block);
      });
    });
}
