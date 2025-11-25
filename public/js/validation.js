// Function to validate an email address
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i; // Built-in regex for email validation
    if (!email) {
        return `Email is required. Please enter a valid email address.`;
    }
    if (email.length < 3 || email.length > 32) {
        return `Email must be between 3 and 32 characters. Example: example@domain.com`;
    }
    if (!emailRegex.test(email)) {
        return `Invalid email format. Please enter a valid email, e.g., example@domain.com`;
    }
    return null; // Valid email
}

// Function to validate a password
function validatePassword(password) {
    if (!password) {
        return `Password is required. Please enter a password.`;
    }
    if (password.length < 3 || password.length > 32) {
        return `Password must be between 3 and 32 characters.`;
    }
    return null; // Valid password
}

// Function to validate first and last names
function validateName(name, fieldName) {
    const nameRegex = /^[a-zA-Z]{3,32}$/; // Only English letters, 3-32 characters
    if (!name) {
        return `${fieldName} is required. Please enter your ${fieldName.toLowerCase()}.`;
    }
    if (!nameRegex.test(name)) {
        return `${fieldName} must contain only letters. Example: John`;
    }
    if (name.length < 3 || name.length > 32) {
        return `${fieldName} must be between 3 and 32 characters.`;
    }
    return null; // Valid name
}

// Function to validate the login form
function validateLoginForm() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const errors = [];

    // Validate Email
    const emailError = validateEmail(email);
    if (emailError) errors.push(`Email: ${emailError}`);

    // Validate Password
    const passwordError = validatePassword(password);
    if (passwordError) errors.push(`Password: ${passwordError}`);

    displayErrors('loginErrorContainer', errors);

    return errors.length === 0;
}

// Function to validate step 1 of the registration form
function validateRegisterStep1() {
    const email = document.getElementById('email').value.trim();
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const errors = [];

    // Validate Email
    const emailError = validateEmail(email);
    if (emailError) errors.push(`Email: ${emailError}`);

    // Validate First Name
    const firstNameError = validateName(firstName, "First Name");
    if (firstNameError) errors.push(`First Name: ${firstNameError}`);

    // Validate Last Name
    const lastNameError = validateName(lastName, "Last Name");
    if (lastNameError) errors.push(`Last Name: ${lastNameError}`);

    displayErrors('registerErrorContainer', errors);

    return errors.length === 0;
}

// Function to validate step 2 of the registration form
function validateRegisterStep2() {
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const errors = [];

    // Validate Password
    const passwordError = validatePassword(password);
    if (passwordError) errors.push(`Password: ${passwordError}`);

    // Validate Confirm Password
    if (!confirmPassword) {
        errors.push('Confirm Password is required. Please re-enter your password.');
    } else if (password !== confirmPassword) {
        errors.push('Passwords do not match. Please make sure both passwords are identical.');
    }

    displayErrors('registerErrorContainer', errors);

    return errors.length === 0;
}

// Function to display validation errors
function displayErrors(containerId, errors) {
    const errorContainer = document.getElementById(containerId);
    const errorList = errorContainer.querySelector('ul');

    errorList.innerHTML = '';
    if (errors.length > 0) {
        errors.forEach(error => {
            const li = document.createElement('li');
            li.textContent = error;
            errorList.appendChild(li);
        });
        errorContainer.classList.remove('d-none');
    } else {
        errorContainer.classList.add('d-none');
    }
}

// Event Listeners for form validation
document.addEventListener('DOMContentLoaded', function () {
    // Validation for login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            console.log('Form submitted');

            if (!validateLoginForm()) {
                console.log('Validation failed');

                e.preventDefault();
            }
        });
    }

    // Validation for step 1 of registration form
    const nextBtn = document.getElementById('nextBtn');
    if (nextBtn) {
        nextBtn.addEventListener('click', function (event) {
            // Check validation
            if (!validateRegisterStep1()) {
                // Prevent form submission if validation fails
                event.preventDefault();
            }
        });
    }

    // Validation for step 2 of registration form
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', function (event) {
            if (!validateRegisterStep2()) {
                event.preventDefault();
            }
        });
    }
});
