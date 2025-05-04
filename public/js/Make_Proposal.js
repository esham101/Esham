document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("proposalForm");
  const responseMessage = document.getElementById("responseMessage");


  const params = new URLSearchParams(window.location.search);
  const landId = params.get("land_id");
  const landownerId = params.get("landowner_id");

 
  document.getElementById("landId").value = landId;
  document.getElementById("landownerId").value = landownerId;


  if (!landId || !landownerId) {
    form.style.display = "none";
    responseMessage.textContent = "Missing land ID or landowner ID in URL.";
    return;
  }


  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());


    data.confirmed_info = document.getElementById("confirmInfo").checked;
    data.accepted_terms = document.getElementById("acceptTerms").checked;

  
    const sessionRes = await fetch("/api/session");
    const sessionData = await sessionRes.json();
    if (!sessionData.loggedIn || sessionData.user.role !== "realestate") {
      responseMessage.textContent = "You must be logged in as a developer.";
      return;
    }
    data.realestate_id = sessionData.user.id;
    console.log(data);

    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      if (res.ok) {
        form.style.display = "none";
        responseMessage.textContent = "✅ Thank you! Your proposal was submitted successfully.";
      } else {
        responseMessage.textContent = result.message || "❌ An error occurred.";
      }
    } catch (error) {
      console.error("Error submitting proposal:", error);
      responseMessage.textContent = "❌ Submission failed. Please try again.";
    }
  });
});
