document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("proposalForm");
  const responseMessage = document.getElementById("responseMessage");

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Convert checkbox values to booleans
    data.confirmed_info = document.getElementById("confirmInfo").checked;
    data.accepted_terms = document.getElementById("acceptTerms").checked;

    // Dummy values for testing; Replace with actual session/user IDs in production
    data.landowner_id = 1;
    data.realestate_id = 2;

    try {
      const res = await fetch("http://localhost:3000/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (res.ok) {
        form.style.display = "none";
        responseMessage.textContent = "Thank you! Your proposal has been successfully submitted.";
      } else {
        responseMessage.textContent = result.message || "An error occurred.";
      }
    } catch (error) {
      console.error("Error:", error);
      responseMessage.textContent = "Failed to submit proposal.";
    }
  });
});
