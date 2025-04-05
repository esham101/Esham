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

