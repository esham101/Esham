document.addEventListener("DOMContentLoaded", function () {
    const loginContainer = document.querySelector(".login-container");
    const landownerSignup = document.querySelector(".landownersignup-container");
    const realEstateSignup = document.querySelector(".Realestatesignup-container");
    const registerButtons = document.querySelectorAll(".register-btn");
    const roleDescription = document.querySelector(".esham-description");
    const registerTitle = document.querySelector(".left-panel h2"); 
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
        registerTitle.style.display = "none"; 
        roleDescription.innerText = "As a Landowner, you can easily connect with real estate developers to unlock the potential of your land and transform it into successful projects.";
    });

    realestateBtn.addEventListener("click", function () {
        loginContainer.style.display = "none";
        landownerSignup.style.display = "none";
        realEstateSignup.style.display = "block";
        registerButtons.forEach(btn => btn.style.display = "none");
        registerTitle.style.display = "none"; 
        roleDescription.innerText = "As a Real Estate Developer, you can discover available lands, propose projects, and collaborate with landowners to drive real estate innovation.";
    });

    backBtns.forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            loginContainer.style.display = "block";
            landownerSignup.style.display = "none";
            realEstateSignup.style.display = "none";
            registerButtons.forEach(btn => btn.style.display = "flex");
            registerTitle.style.display = "block"; 
            roleDescription.innerText = originalText;
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const landownerForm = document.querySelector('form[action="/register/landowner"]');
    const realEstateForm = document.querySelector('form[action="/register/realestate"]');

      
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^5\d{8}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*_\-+=~]).{10,15}$/;
      
        function showError(msg) {
          const errorDiv = document.getElementById("register-error");
          errorDiv.innerText = msg;
        }
      
        function validateLandownerForm(form) {
          const fullName = form.querySelector('input[name="fullname"]').value.trim();
          const idNumber = form.querySelector('input[name="idnumber"]').value.trim();
          const phone = form.querySelector('input[name="phone"]').value.trim();
          const email = form.querySelector('input[name="email"]').value.trim();
          const password = form.querySelector('input[name="password"]').value;
          const terms = form.querySelector('input[type="checkbox"]').checked;
      
          if (!fullName || fullName.split(' ').length < 2) {
            showError("Full name must include first and last name.");
            return false;
          }
      
          if (!/^\d{10}$/.test(idNumber)) {
            showError("Saudi ID must be a 10-digit number.");
            return false;
          }
      
          if (!phoneRegex.test(phone)) {
            showError("Phone number must start with 5 and be 9 digits long.");
            return false;
          }
      
          if (!emailRegex.test(email)) {
            showError("Invalid email format.");
            return false;
          }
      
          if (!passwordRegex.test(password)) {
            showError("Password must be 10–15 characters, with uppercase, lowercase, and special character.");
            return false;
          }
      
          if (!terms) {
            showError("You must accept the terms and agreement.");
            return false;
          }
      
          return true;
        }
      
        function validateRealEstateForm(form) {
          const company = form.querySelector('input[name="company"]').value.trim();
          const businessReg = form.querySelector('input[name="businessReg"]').value.trim();
          const taxId = form.querySelector('input[name="taxId"]').value.trim();
          const address = form.querySelector('input[name="address"]').value.trim();
          const email = form.querySelector('input[name="email"]').value.trim();
          const phone = form.querySelector('input[name="phone"]').value.trim();
          const password = form.querySelector('input[name="password"]').value;
          const terms = form.querySelector('input[type="checkbox"]').checked;
      
          if (!company) {
            showError("Company name is required.");
            return false;
          }
      
          if (!/^\d{10}$/.test(businessReg)) {
            showError("Business registration number must be 10 digits.");
            return false;
          }
      
          if (!/^\d{15}$/.test(taxId)) {
            showError("Tax identification number must be 15 digits.");
            return false;
          }
      
          if (!address) {
            showError("Company address is required.");
            return false;
          }
      
          if (!emailRegex.test(email)) {
            showError("Invalid official email address.");
            return false;
          }
      
          if (!phoneRegex.test(phone)) {
            showError("Phone number must start with 5 and be 9 digits long.");
            return false;
          }
      
          if (!passwordRegex.test(password)) {
            showError("Password must be 10–15 characters, with uppercase, lowercase, and special character.");
            return false;
          }
      
          if (!terms) {
            showError("You must accept the terms and agreement.");
            return false;
          }
      
          return true;
        }
      
        if (landownerForm) {
          landownerForm.addEventListener('submit', function (e) {
            if (!validateLandownerForm(landownerForm)) {
              e.preventDefault();
            }
          });
        }
      
        if (realEstateForm) {
          realEstateForm.addEventListener('submit', function (e) {
            if (!validateRealEstateForm(realEstateForm)) {
              e.preventDefault();
            }
          });
        }
      });
      