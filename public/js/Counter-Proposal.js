document.addEventListener('DOMContentLoaded', () => {
    const proposalId = getProposalIdFromURL();
    if (!proposalId) {
      alert("Proposal ID not provided.");
      return;
    }
  
    fetchProposalData(proposalId);
  
    const form = document.getElementById('proposalForm');
    form.addEventListener('submit', handleFormSubmit);
  });
  
  function getProposalIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('proposal_id');
  }
  
  function fetchProposalData(proposalId) {
    fetch(`/api/proposals/${proposalId}`)
      .then(res => {
        if (!res.ok) throw new Error("Proposal fetch failed.");
        return res.json();
      })
      .then(data => populateForm(data))
      .catch(err => {
        console.error("Proposal fetch error:", err);
        alert("Failed to load proposal.");
      });
  }
  
  function populateForm(data) {
    document.getElementById('proposalId').value = data.proposal_id;
    document.getElementById('landId').value = data.land_id;
    document.getElementById('landownerId').value = data.landowner_id;
  
    document.getElementById('title').value = data.title;
    document.getElementById('description').value = data.description;
    document.getElementById('objectives').value = data.objectives;
    document.getElementById('budget').value = data.budget;
    document.getElementById('startDate').value = data.start_date;
    document.getElementById('durationValue').value = data.duration_value;
    document.getElementById('durationUnit').value = data.duration_unit;
    document.getElementById('email').value = data.email;
    document.getElementById('startTime').value = data.contact_start_time;
    document.getElementById('endTime').value = data.contact_end_time;
  }
  
  function handleFormSubmit(e) {
    e.preventDefault();
  
    const counterProposal = {
      proposal_id: document.getElementById('proposalId').value,
      land_id: document.getElementById('landId').value,
      landowner_id: document.getElementById('landownerId').value,
      revenue_split: document.getElementById('revenueSplit').value,
      payment_freq: document.getElementById('paymentFreq').value,
      revenue_type: document.getElementById('revenueType').value,
      reporting: document.getElementById('reporting').value
    };
  
    fetch('/api/landowner/counter-proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(counterProposal)
    })
      .then(res => {
        if (!res.ok) throw new Error("Submission failed.");
        return res.json();
      })
      .then(() => {
        alert("Counter proposal submitted!");
        window.location.href = "Dashboard-Land-Owner.html";
      })
      .catch(err => {
        console.error("Submission error:", err);
        alert("Failed to submit counter proposal.");
      });
  }
  