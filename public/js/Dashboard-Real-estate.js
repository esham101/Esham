let userId;
let currentUser;

const toggleButton = document.getElementById('toggle-btn');
const sidebar = document.getElementById('sidebar');


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
        loadProposalManagement();


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

      
    })
    .catch(err => console.error("Error loading proposals:", err));
}

function loadProposalManagement() {
  fetch("/api/realestate/proposals")
    .then(res => res.json())
    .then(data => {
      const table = document.getElementById("proposalManagementData");
      table.innerHTML = "";

      const counterProposals = data.filter(p =>
        p.revenue_split && p.status === "Countered"
      );

      if (counterProposals.length === 0) {
        table.innerHTML = `<tr><td colspan="5" style="text-align:center;">No counter proposals available.</td></tr>`;
        return;
      }

      counterProposals.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${p.owner_name}</td>
          <td>${p.title}</td>
          <td>${p.revenue_split}</td>
          <td>${p.status}</td>
          <td>
            <button class="btn-accept-counter" data-id="${p.proposal_id}">Accept</button>
            <button class="btn-reject-counter" data-id="${p.proposal_id}">Reject</button>
          </td>
        `;
        table.appendChild(row);
      });


      document.querySelectorAll(".btn-accept-counter").forEach(btn =>
        btn.addEventListener("click", function () {
          const id = this.dataset.id;
          handleAcceptCounter(id, this);
        })
      );

      document.querySelectorAll(".btn-reject-counter").forEach(btn =>
        btn.addEventListener("click", function () {
          const id = this.dataset.id;
          handleRejectCounter(id, this);
        })
      );
    })
    .catch(err => console.error("Proposal fetch error:", err));
}





function populateTable(data, tableId) {
  const tableBody = document.getElementById(tableId);
  tableBody.innerHTML = "";

  data.forEach(item => {
    const name = item.owner_name || "N/A";
    const date = item.submitted_at ? new Date(item.submitted_at).toISOString().split("T")[0] : "N/A";
    const counter = item.counter_split ? `<br><strong>Counter:</strong> ${item.counter_split}` : "";

    const action = item.counter_split && item.status === "Pending"
      ? `<button class="btn-accept-counter" data-id="${item.proposal_id}">Accept Counter</button>`
      : "";

    tableBody.innerHTML += `
      <tr>
        <td>${name}</td>
        <td>${date}</td>
        <td>${item.status}${counter}<br>${action}</td>
      </tr>`;
  });


  document.querySelectorAll(".btn-accept-counter").forEach(btn =>
    btn.addEventListener("click", function () {
      const proposalId = this.dataset.id;
      handleAcceptCounter(proposalId, this);
    })
  );
}


function handleAcceptCounter(proposalId, button) {
  if (!proposalId || !button) {
    console.error("Missing proposalId or button element.");
    return;
  }

  button.disabled = true;

  fetch(`/api/proposals/${proposalId}/accept-counter`, {
    method: "PUT"
  })
    .then(res => res.json())
    .then(() => {
      alert("Counter offer accepted.");
      loadProposals(); 
    })
    .catch(err => {
      console.error("Error accepting counter offer:", err);
      button.disabled = false; 
    });
}


function handleRejectCounter(proposalId, button) {
  if (!proposalId || !button) {
    console.error("Missing proposalId or button element.");
    return;
  }

  button.disabled = true;

  fetch(`/api/proposals/${proposalId}/reject-counter`, {
    method: "PUT"
  })
    .then(res => res.json())
    .then(() => {
      alert("Counter proposal rejected.");
      loadProposalManagement();
      loadProposals();
    })
    .catch(err => {
      console.error("Error rejecting counter offer:", err);
      button.disabled = false;
    });
}



let sentChartInstance = null;

function renderProposalsSentChart(data) {
  const ctx = document.getElementById("proposalsSentChart")?.getContext("2d");
  if (!ctx) return;


  if (sentChartInstance) {
    sentChartInstance.destroy();
  }

  const validDates = data
    .filter(p => p.submitted_at)
    .map(p => new Date(p.submitted_at).toISOString().slice(0, 7));

  const monthLabels = [...new Set(validDates)];
  const countMap = {};
  monthLabels.forEach(month => {
    countMap[month] = validDates.filter(d => d.startsWith(month)).length;
  });

  sentChartInstance = new Chart(ctx, {
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

let acceptedChartInstance = null;

function renderProposalsAcceptedChart(data) {
  const ctx = document.getElementById("proposalsAcceptedChart")?.getContext("2d");
  if (!ctx) return;

 
  if (acceptedChartInstance) {
    acceptedChartInstance.destroy();
  }

  const validDates = data
    .filter(p => p.submitted_at)
    .map(p => new Date(p.submitted_at).toISOString().slice(0, 7)); 

  const monthLabels = [...new Set(validDates)];
  const countMap = {};
  monthLabels.forEach(month => {
    countMap[month] = validDates.filter(d => d.startsWith(month)).length;
  });

  acceptedChartInstance = new Chart(ctx, {
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





function logout() {
  fetch('/logout', { method: 'POST' }) 
    .then(() => {
      window.location.href = '/Home.html'; 
    })
    .catch(err => {
      console.error('Logout failed:', err);
    });
}
