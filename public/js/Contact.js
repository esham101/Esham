document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".form-box");


  let messageBox = document.createElement("div");
  messageBox.id = "formMessage";
  messageBox.style.marginBottom = "20px";
  messageBox.style.fontWeight = "bold";
  form.prepend(messageBox);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const firstName = document.getElementById("ijowk").value.trim();
    const lastName = document.getElementById("indfi").value.trim();
    const email = document.getElementById("ipmgh").value.trim();
    const phone = document.getElementById("imgis").value.trim();
    const message = document.getElementById("i5vyy").value.trim();


    if (!firstName || !lastName || !email || !phone || !message) {
      showMessage("Please fill in all fields.", false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage("Invalid email address.", false);
      return;
    }

    const data = {
      FirstName: firstName,
      LastName: lastName,
      Email: email,
      PhoneNumber: phone,
      Message: message
    };

    fetch("/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          showMessage("Message sent successfully! ✅", true);
          form.reset();
        } else {
          showMessage(response.message || "Submission failed.", false);
        }
      })
      .catch(err => {
        console.error("❌ Submission failed:", err);
        showMessage("Something went wrong. Please try again later.", false);
      });
  });

  function showMessage(text, isSuccess) {
    messageBox.innerText = text;
    messageBox.style.color = isSuccess ? "green" : "red";
  }
});