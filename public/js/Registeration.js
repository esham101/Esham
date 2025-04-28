document.addEventListener("DOMContentLoaded", function () {
    const loginContainer = document.querySelector(".login-container");
    const landownerSignup = document.querySelector(".landownersignup-container");
    const realEstateSignup = document.querySelector(".Realestatesignup-container");
    const registerButtons = document.querySelectorAll(".register-btn");
    const roleDescription = document.querySelector(".esham-description");
    const registerTitle = document.querySelector(".left-panel h2"); // 🔥 Register As: heading
    const landownerBtn = document.getElementById("landowner-register");
    const realestateBtn = document.getElementById("realestate-register");
    const backBtns = document.querySelectorAll(".back-btn");

    const originalText = "Esham is a digital platform connecting landowners and real estate developers to bring real estate projects to life efficiently and seamlessly.";

    window.loginWithGoogle = function () {
        window.location.href = "https://accounts.google.com/signin";
    };

    landownerBtn.addEventListener("click", function () {
        loginContainer.style.display = "none";
        landownerSignup.style.display = "block";
        realEstateSignup.style.display = "none";
        registerButtons.forEach(btn => btn.style.display = "none");
        registerTitle.style.display = "none"; // 🔥 Hide "Register As:" heading
        roleDescription.innerText = "As a Landowner, you can easily connect with real estate developers to unlock the potential of your land and transform it into successful projects.";
    });

    realestateBtn.addEventListener("click", function () {
        loginContainer.style.display = "none";
        landownerSignup.style.display = "none";
        realEstateSignup.style.display = "block";
        registerButtons.forEach(btn => btn.style.display = "none");
        registerTitle.style.display = "none"; // 🔥 Hide "Register As:" heading
        roleDescription.innerText = "As a Real Estate Developer, you can discover available lands, propose projects, and collaborate with landowners to drive real estate innovation.";
    });

    backBtns.forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            loginContainer.style.display = "block";
            landownerSignup.style.display = "none";
            realEstateSignup.style.display = "none";
            registerButtons.forEach(btn => btn.style.display = "flex");
            registerTitle.style.display = "block"; // 🔥 Show "Register As:" again
            roleDescription.innerText = originalText;
        });
    });
});
