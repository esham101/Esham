document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const proposalId = urlParams.get("proposal_id");
  
    if (!proposalId) {
      alert("Proposal ID is missing in URL.");
      return;
    }
  
    fetch(`http://localhost:3000/api/proposals/${proposalId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch proposal");
        return res.json();
      })
      .then(data => {
        populateProposalForm(data);
      })
      .catch(err => {
        console.error("Error fetching proposal:", err);
      });
  });
  
  function populateProposalForm(proposal) {
    try {
      document.getElementById("title").value = proposal.title || "";
      document.getElementById("description").value = proposal.description || "";
      document.getElementById("objectives").value = proposal.objectives || "";
      document.getElementById("budget").value = proposal.budget || "";
      document.getElementById("startDate").value = proposal.start_date?.split("T")[0] || "";
      document.getElementById("durationValue").value = proposal.duration_value || "";
      document.getElementById("durationUnit").value = proposal.duration_unit || "";
      document.getElementById("email").value = proposal.email || "";
      document.getElementById("startTime").value = proposal.contact_start_time || "";
      document.getElementById("endTime").value = proposal.contact_end_time || "";
      document.getElementById("revenueSplit").value = proposal.revenue_split || "";
      document.getElementById("paymentFreq").value = proposal.payment_freq || "";
      document.getElementById("revenueType").value = proposal.revenue_type || "";
      document.getElementById("reporting").value = proposal.reporting || "";
    } catch (err) {
      console.error("Error populating form:", err);
    }
  }
  