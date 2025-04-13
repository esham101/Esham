const toggleButton = document.getElementById('toggle-btn')
const sidebar = document.getElementById('sidebar')

function toggleSidebar(){
  sidebar.classList.toggle('close')
  toggleButton.classList.toggle('rotate')

  closeAllSubMenus()
}

function toggleSubMenu(button){

  if(!button.nextElementSibling.classList.contains('show')){
    closeAllSubMenus()
  }

  button.nextElementSibling.classList.toggle('show')
  button.classList.toggle('rotate')

  if(sidebar.classList.contains('close')){
    sidebar.classList.toggle('close')
    toggleButton.classList.toggle('rotate')
  }
}

function closeAllSubMenus(){
  Array.from(sidebar.getElementsByClassName('show')).forEach(ul => {
    ul.classList.remove('show')
    ul.previousElementSibling.classList.remove('rotate')
  })
}

document.addEventListener("DOMContentLoaded", function () {
  // Sample Revenue Data (For Future)
  const revenueData = [
      { project: "Project Alpha", date: "10 Mar 2025", revenue: 10000 },
      { project: "Project Beta", date: "22 Feb 2025", revenue: 15500 },
      { project: "Project Gamma", date: "18 Jan 2025", revenue: 7800 },
      { project: "Project Alpha", date: "10 Mar 2025", revenue: 10000 },
      { project: "Project Beta", date: "22 Feb 2025", revenue: 15500 },
      { project: "Project Gamma", date: "18 Jan 2025", revenue: 7800 },
      { project: "Project Alpha", date: "10 Mar 2025", revenue: 10000 }
  ];

  // Proposals Sent Data
  const proposalsSent = [
      { name: "Land223", date: "16 Mar 2025", status: "Pending" },
      { name: "Land243", date: "15 Mar 2025", status: "Rejected" },
      { name: "Land123", date: "15 Mar 2025", status: "Pending" },
      { name: "Land143", date: "14 Mar 2025", status: "Rejected" },
      { name: "Land193", date: "13 Jan 2025", status: "Rejected" },
      { name: "Land153", date: "08 Jan 2025", status: "Rejected" },
      { name: "Land123", date: "02 Jan 2025", status: "Pending" },
  ];

  // Proposals Accepted Data
  const proposalsAccepted = [
      { name: "Land484", date: "13 Mar 2025", status: "Accepted" },
      { name: "Land312", date: "11 Mar 2025", status: "Accepted" },
      { name: "Land999", date: "03 Mar 2025", status: "Accepted" },
      { name: "Land809", date: "01 Mar 2025", status: "Accepted" },
      { name: "Land777", date: "28 Feb 2025", status: "Accepted" },
      { name: "Land676", date: "17 Feb 2025", status: "Accepted" },
      { name: "Land524", date: "02 Feb 2025", status: "Accepted" },
  ];

// Generalized Table Population Function
function populateTable(data, tableId) {
  let tableBody = document.getElementById(tableId);
  
  // Check the structure of data and populate accordingly
  data.forEach(item => {
      let row = '';

      // Check if the data is from proposals (Sent or Accepted)
      if (item.name && item.status) {
          row = `<tr><td>${item.name}</td><td>${item.date}</td><td>${item.status}</td></tr>`;
      }
      // If it's revenue data
      else if (item.project && item.revenue) {
          row = `<tr><td>${item.project}</td><td>${item.date}</td><td>${item.revenue}</td></tr>`;
      }

      tableBody.innerHTML += row;
  });
}

// Populate Tables
populateTable(proposalsSent, "proposalsSentData");
populateTable(proposalsAccepted, "proposalsAcceptedData");
populateTable(revenueData, "revenueData");

var ctx = document.getElementById("revenueChart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["M", "T", "W", "T", "F", "S", "S"],
      datasets: [{
        label: "revenue",
        tension: 0.4,
        borderWidth: 0,
        borderRadius: 4,
        borderSkipped: false,
        backgroundColor: "#43A047",
        data: [50, 45, 22, 28, 50, 60, 76],
        barThickness: 'flex'
      }, ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        }
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        y: {
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [5, 5],
            color: '#e5e5e5'
          },
          ticks: {
            suggestedMin: 0,
            suggestedMax: 500,
            beginAtZero: true,
            padding: 10,
            font: {
              size: 14,
              lineHeight: 2
            },
            color: "#737373"
          },
        },
        x: {
          grid: {
            drawBorder: false,
            display: false,
            drawOnChartArea: false,
            drawTicks: false,
            borderDash: [5, 5]
          },
          ticks: {
            display: true,
            color: '#737373',
            padding: 10,
            font: {
              size: 14,
              lineHeight: 2
            },
          }
        },
      },
    },
  });


  var ctx2 = document.getElementById("proposalsSentChart").getContext("2d");

  new Chart(ctx2, {
    type: "line",
    data: {
      labels: ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"],
      datasets: [{
        label: "Sent",
        tension: 0,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#43A047",
        pointBorderColor: "transparent",
        borderColor: "#43A047",
        backgroundColor: "transparent",
        fill: true,
        data: [120, 230, 130, 440, 250, 360, 270, 180, 90, 300, 310, 220],
        maxBarThickness: 6

      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: function(context) {
              const fullMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
              return fullMonths[context[0].dataIndex];
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        y: {
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [4, 4],
            color: '#e5e5e5'
          },
          ticks: {
            display: true,
            color: '#737373',
            padding: 10,
            font: {
              size: 12,
              lineHeight: 2
            },
          }
        },
        x: {
          grid: {
            drawBorder: false,
            display: false,
            drawOnChartArea: false,
            drawTicks: false,
            borderDash: [5, 5]
          },
          ticks: {
            display: true,
            color: '#737373',
            padding: 10,
            font: {
              size: 12,
              lineHeight: 2
            },
          }
        },
      },
    },
  });

  var ctx3 = document.getElementById("proposalsAcceptedChart").getContext("2d");

  new Chart(ctx3, {
    type: "line",
    data: {
      labels: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [{
        label: "Accepted",
        tension: 0,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: "#43A047",
        pointBorderColor: "transparent",
        borderColor: "#43A047",
        backgroundColor: "transparent",
        fill: true,
        data: [50, 40, 300, 220, 500, 250, 400, 230, 500],
        maxBarThickness: 6

      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        }
      },
      interaction: {
        intersect: false,
        mode: 'index',
      },
      scales: {
        y: {
          grid: {
            drawBorder: false,
            display: true,
            drawOnChartArea: true,
            drawTicks: false,
            borderDash: [4, 4],
            color: '#e5e5e5'
          },
          ticks: {
            display: true,
            padding: 10,
            color: '#737373',
            font: {
              size: 14,
              lineHeight: 2
            },
          }
        },
        x: {
          grid: {
            drawBorder: false,
            display: false,
            drawOnChartArea: false,
            drawTicks: false,
            borderDash: [4, 4]
          },
          ticks: {
            display: true,
            color: '#737373',
            padding: 10,
            font: {
              size: 14,
              lineHeight: 2
            },
          }
        },
      },
    },
  });
}
);


  const projectPhases = [
    { name: "Design", progress: 80 },
    { name: "Development", progress: 60 },
    { name: "Testing", progress: 30 }
  ];

  const container = document.getElementById("progress-container");

  projectPhases.forEach(phase => {
    const item = document.createElement("div");
    item.className = "progress-item";

    item.innerHTML = `
      <span>${phase.name}</span>
      <div class="progress-bar">
        <div class="progress" style="width: ${phase.progress}%; background-color: #215321;"></div>
      </div>
      <small>${phase.progress}%</small>
    `;

    container.appendChild(item);
  });

// Mock notifications - replace with real fetch call from your backend or Firebase later
// Mock notifications - replace with real fetch call from your backend or Firebase later
let notifications = [
  { id: 1, message: "New Land in the market" },
  { id: 2, message: "Landowner123 Responded" }
];

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

// Theme Toggle
function toggleDarkMode() {
  const enabled = document.getElementById("darkMode").checked;
  applyTheme(enabled); // Only apply theme, no saving here
}


function applyTheme(enabled) {
  const root = document.documentElement;
  if (enabled) {
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

// Modal
function openModal(type) {
  const modal = document.getElementById("modal");
  const body = document.getElementById("modal-body");

  if (type === 'profile') {
    body.innerHTML = `
      <h2>👤 Profile</h2>
      <form id="editProfileForm">
        <label>Name:</label><br>
        <input type="text" id="name" value="Nasser Almarshedy" style="width: 100%; margin-bottom: 10px;"><br>
        <label>Email:</label><br>
        <input type="email" id="email" value="nasser@example.com" style="width: 100%; margin-bottom: 10px;"><br>
        <button type="submit" style="margin-top: 10px;">Save Changes</button>
      </form>
    `;
    document.getElementById("editProfileForm").onsubmit = function (e) {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      alert("Saved!\nName: " + name + "\nEmail: " + email);
      closeModal();
    };
  }

  else if (type === 'settings') {
    body.innerHTML = `
      <h2>⚙️ Settings</h2>
      <label>
        <input type="checkbox" id="darkMode" onchange="toggleDarkMode()"> Enable Dark Mode
      </label>
      <br><br>
      <label for="language">Language:</label>
      <select id="language">
        <option value="en">English</option>
        <option value="ar">Arabic</option>
      </select>
      <br><br>
      <button onclick="saveSettings()">Save Settings</button>
    `;

    // ✅ Set checkbox state when modal opens
    const savedDarkMode = localStorage.getItem("darkModeEnabled") === "true";
    document.getElementById("darkMode").checked = savedDarkMode;
  }

  else if (type === 'notifications') {
    let notifHTML = `<h2>🔔 Notifications</h2><ul style="padding-left: 20px;">`;
    if (notifications.length === 0) {
      notifHTML += `<li>No new notifications.</li>`;
    } else {
      notifications.forEach(n => {
        notifHTML += `<li>${n.message}</li>`;
      });
    }
    notifHTML += `</ul><br><button onclick="closeModal()">Close</button>`;
    body.innerHTML = notifHTML;
  }

  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function saveSettings() {
  const darkMode = document.getElementById("darkMode").checked;
  const language = document.getElementById("language").value;

  // ✅ Save only here
  localStorage.setItem("darkModeEnabled", darkMode);
  applyTheme(darkMode); // Apply it again just in case

  alert(`Settings saved:\nDark Mode: ${darkMode}\nLanguage: ${language}`);
  closeModal();
}



// ✅ Always apply light mode by default; apply dark only if enabled
window.onload = () => {
  closeModal();
  updateNotificationBadge();

  const savedDarkMode = localStorage.getItem("darkModeEnabled") === "true";
  applyTheme(savedDarkMode); // Only changes colors — doesn't affect checkbox directly
};