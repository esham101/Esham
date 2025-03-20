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



    // Create Revenue Graph
    new Chart(document.getElementById("revenueChart"), {
        type: "line",
        data: {
            labels: revenueData.map(item => item.revenue),
            datasets: [{
                label: "Revenue",
                data: proposalsSent.map((_, i) => i + 1),
                borderColor: "green",
                borderWidth: 2,
                fill: false
            }]
        }
    });

    // Create Proposals Sent Graph
    new Chart(document.getElementById("proposalsSentChart"), {
        type: "line",
        data: {
            labels: proposalsSent.map(p => p.date),
            datasets: [{
                label: "Proposals Sent",
                data: proposalsSent.map((_, i) => i + 1),
                borderColor: "red",
                borderWidth: 2,
                fill: false
            }]
        }
    });

    // Create Proposals Accepted Graph
    new Chart(document.getElementById("proposalsAcceptedChart"), {
        type: "line",
        data: {
            labels: proposalsAccepted.map(p => p.date),
            datasets: [{
                label: "Proposals Accepted",
                data: proposalsAccepted.map((_, i) => i + 1),
                borderColor: "blue",
                borderWidth: 2,
                fill: false
            }]
        }
    });
});