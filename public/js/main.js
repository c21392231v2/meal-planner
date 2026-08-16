document.querySelectorAll("[data-password-toggle]").forEach((button) => {// Add click event listener to each button
  button.addEventListener("click", () => {
    const inputId = button.dataset.passwordToggle;
    const input = document.getElementById(inputId);

    if (!input) return;

    const passwordIsHidden = input.type === "password";

    input.type = passwordIsHidden ? "text" : "password";
    button.textContent = passwordIsHidden ? "Hide" : "Show";

    button.setAttribute(
      "aria-label",
      passwordIsHidden ? "Hide password" : "Show password"
    );
  });
});

// Password validation logic
const passwordInput = document.getElementById("password");

if (passwordInput) {
  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;

    updateRequirement(
      "length-check",
      password.length >= 8
    );

    updateRequirement(
      "uppercase-check",
      /[A-Z]/.test(password)
    );

    updateRequirement(
      "lowercase-check",
      /[a-z]/.test(password)
    );

    updateRequirement(
      "number-check",
      /[0-9]/.test(password)
    );

    updateRequirement(
      "special-check",
      /[^A-Za-z0-9]/.test(password)
    );
  });
}


// Function to update the requirement status
function updateRequirement(id, valid) {
  const element = document.getElementById(id);

  if (!element) return;

  element.classList.toggle("valid", valid);
}