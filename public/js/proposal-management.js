import { dummyProposals } from './data.js';


function renderProposalManagement() {
  const container = document.getElementById("proposalManagement");
  if (!container) return;

  container.innerHTML = `
    <table class="proposal-table">
      <thead>
        <tr>
          <th>Company</th>
          <th>Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${dummyProposals.map((proposal, index) => `
          <tr data-index="${index}">
            <td>${proposal.company}</td>
            <td>${proposal.date}</td>
            <td class="status">${proposal.status}</td>
            <td>
              <button class="accept-btn">Accept</button>
              <button class="reject-btn">Reject</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  attachActionListeners();
}


function attachActionListeners() {
  const container = document.getElementById("proposalManagement");
  if (!container) return;

  container.querySelectorAll(".accept-btn").forEach(button => {
    button.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      updateStatus(row, "Accepted");
    });
  });

  container.querySelectorAll(".reject-btn").forEach(button => {
    button.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
      updateStatus(row, "Rejected");
    });
  });
}


function updateStatus(row, newStatus) {
  const index = row.getAttribute("data-index");
  if (index !== null) {
    dummyProposals[index].status = newStatus;
    row.querySelector(".status").textContent = newStatus;
  }
}


document.addEventListener("DOMContentLoaded", renderProposalManagement);
