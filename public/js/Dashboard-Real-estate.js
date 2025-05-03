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
        userId = data.user.id;
        currentUser = data.user;
        updateWelcomeMessage(currentUser.name);

        loadRevenue();
        loadProposals();

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

function updateWelcomeMessage(name) {
  const welcome = document.querySelector(".welcome-title");
  if (welcome) welcome.textContent = `Welcome ${name}! 👋`;
}

// Load Revenue (specific to developer's portfolio)
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

// 🔵 Proposals
function loadProposals() {
  fetch("/api/realestate/proposals")

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
    const name = item.owner_name || "N/A";
    const date = item.submitted_at ? new Date(item.submitted_at).toISOString().split("T")[0] : "N/A";
    tableBody.innerHTML += `<tr><td>${name}</td><td>${date}</td><td>${item.status}</td></tr>`;
  });
}


function renderProposalsSentChart(data) {
  const ctx = document.getElementById("proposalsSentChart")?.getContext("2d");
  if (!ctx) return;

  // Safely get month from submitted_at
  const validDates = data
    .filter(p => p.submitted_at)
    .map(p => new Date(p.submitted_at).toISOString().slice(0, 7)); // "YYYY-MM"

  const monthLabels = [...new Set(validDates)];
  const countMap = {};

  monthLabels.forEach(month => {
    countMap[month] = validDates.filter(d => d.startsWith(month)).length;
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
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true },
        x: { ticks: { autoSkip: true, maxRotation: 0 } }
      }
    }
  });
}

function renderProposalsAcceptedChart(data) {
  const ctx = document.getElementById("proposalsAcceptedChart")?.getContext("2d");
  if (!ctx) return;

  const validDates = data
    .filter(p => p.submitted_at)
    .map(p => new Date(p.submitted_at).toISOString().slice(0, 7)); // "YYYY-MM"

  const monthLabels = [...new Set(validDates)];
  const countMap = {};

  monthLabels.forEach(month => {
    countMap[month] = validDates.filter(d => d.startsWith(month)).length;
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
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true },
        x: { ticks: { autoSkip: true, maxRotation: 0 } }
      }
    }
  });
}


// Developer-side project progress tracking
function loadProjectProgress(proposalId) {
  fetch(`/api/progress/${proposalId}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("progressTimeline");
      container.innerHTML = "";

      if (data.length === 0) {
        container.innerHTML = "<p>No project progress available.</p>";
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
