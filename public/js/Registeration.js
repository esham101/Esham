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

document.addEventListener('DOMContentLoaded', () => {
    const landownerForm = document.querySelector('form[action="/register/landowner"]');
    const realEstateForm = document.querySelector('form[action="/register/realestate"]');
  
    // Common validation function
    function validateForm(formType, form) {
      const errorDiv = document.getElementById("register-error");
      errorDiv.innerText = '';
  
      const fullName = form.querySelector('input[name="fullname"], input[name="company"]')?.value.trim();
      const idNumber = form.querySelector('input[name="idnumber"]')?.value.trim();
      const phone = form.querySelector('input[name="phone"]')?.value.trim();
      const email = form.querySelector('input[name="email"]')?.value.trim();
      const password = form.querySelector('input[name="password"]')?.value;
      const terms = form.querySelector('input[type="checkbox"]').checked;
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*_\-+=~]).{10,15}$/;
  
      if (!fullName || (formType === 'landowner' && fullName.split(' ').length < 2)) {
        errorDiv.innerText = "Please enter your full name (first and last name).";
        return false;
      }
  
      if (formType === 'landowner' && (!idNumber || !/^\d{10}$/.test(idNumber))) {
        errorDiv.innerText = "Saudi ID must be a 10-digit number.";
        return false;
      }
  
      if (!/^[5]\d{8}$/.test(phone)) {
        errorDiv.innerText = "Phone number must start with 5 and be 9 digits long.";
        return false;
      }
  
      if (!emailRegex.test(email)) {
        errorDiv.innerText = "Please enter a valid email address.";
        return false;
      }
  
      if (!passwordRegex.test(password)) {
        errorDiv.innerText = "Password must be 10–15 characters long, include 1 uppercase, 1 lowercase, and 1 special character.";
        return false;
      }
  
      if (!terms) {
        errorDiv.innerText = "You must accept the terms and agreement.";
        return false;
      }
  
      return true;
    }
  
    if (landownerForm) {
      landownerForm.addEventListener('submit', function (e) {
        if (!validateForm('landowner', landownerForm)) {
          e.preventDefault();
        }
      });
    }
  
    if (realEstateForm) {
      realEstateForm.addEventListener('submit', function (e) {
        if (!validateForm('realestate', realEstateForm)) {
          e.preventDefault();
        }
      });
    }
  });
  