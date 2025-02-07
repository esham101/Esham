document.addEventListener("DOMContentLoaded", function () {
    const loginBox = document.querySelector(".login-box");
    const signupSelection = document.querySelector(".signup-selection");
    const landownerSignup = document.querySelector(".landownersignup-container");
    const realEstateSignup = document.querySelector(".Realestatesignup-container");

    const registerNavBtn = document.querySelector(".register button"); // "Register Now" in nav
    const registerFormBtn = document.querySelector(".register-btn"); // "Register" in Sign In form
    const landownerBtn = document.getElementById("landowner-btn");
    const realEstateBtn = document.getElementById("realestate-btn");
    const forgotPasswordBtn = document.querySelector(".forgot-password");

    // Back to Sign In Button
    function createBackButton() {
        const backButton = document.createElement("button");
        backButton.textContent = "Back to Sign In";
        backButton.classList.add("back-btn");
        backButton.addEventListener("click", function () {
            hideAllForms();
            loginBox.style.display = "block";
        });
        return backButton;
    }

    function hideAllForms() {
        loginBox.style.display = "none";
        signupSelection.style.display = "none";
        landownerSignup.style.display = "none";
        realEstateSignup.style.display = "none";
    }

    // Function to handle Register button click
    function showSignupSelection() {
        hideAllForms();
        signupSelection.style.display = "block";

        // Add Back Button if it doesn't exist
        if (!signupSelection.querySelector(".back-btn")) {
            signupSelection.appendChild(createBackButton());
        }
    }

    // Make both Register buttons work
    registerNavBtn.addEventListener("click", showSignupSelection);
    registerFormBtn.addEventListener("click", showSignupSelection);

    // Landowner Registration
    landownerBtn.addEventListener("click", function () {
        hideAllForms();
        landownerSignup.style.display = "block";

        if (!landownerSignup.querySelector(".back-btn")) {
            landownerSignup.appendChild(createBackButton());
        }
    });

    // Real Estate Registration
    realEstateBtn.addEventListener("click", function () {
        hideAllForms();
        realEstateSignup.style.display = "block";

        if (!realEstateSignup.querySelector(".back-btn")) {
            realEstateSignup.appendChild(createBackButton());
        }
    });

    // Forgot Password Alert
    forgotPasswordBtn.addEventListener("click", function () {
        alert("Password recovery feature coming soon!");
    });
});
