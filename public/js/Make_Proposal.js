document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("proposalForm");
  const responseMessage = document.getElementById("responseMessage");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    form.style.display = 'none';
    responseMessage.textContent = "Thank you! Your proposal has been successfully submitted.";
  });
});
