document.addEventListener("DOMContentLoaded", function () {
    const loginContainer = document.querySelector(".login-container");
    const landownerSignup = document.querySelector(".landownersignup-container");
    const realEstateSignup = document.querySelector(".Realestatesignup-container");
    const forgotPasswordBtn = document.querySelector(".forgot-password");

    document.getElementById("landowner-register").addEventListener("click", function () {
        loginContainer.style.display = "none";
        landownerSignup.style.display = "block";
    });

    document.getElementById("realestate-register").addEventListener("click", function () {
        loginContainer.style.display = "none";
        realEstateSignup.style.display = "block";

    });
    forgotPasswordBtn.addEventListener("click", function () {
        alert("Password recovery feature coming soon!");
    });

    document.querySelectorAll(".back-btn").forEach(button => {
        button.addEventListener("click", function () {
            landownerSignup.style.display = "none";
            realEstateSignup.style.display = "none";
            loginContainer.style.display = "block";
        });
    });
});

function loginWithGoogle() {
    window.location.href = "https://accounts.google.com/signin";
}



