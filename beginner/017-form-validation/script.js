const form = document.getElementById('registration-form');
const username = document.getElementById('username');
const email = document.getElementById('email');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');

// Helper function to show error message
function showError(input, message) {
    const formControl = input.parentElement;
    formControl.className = 'form-control error';
    const small = formControl.querySelector('.error-message');
    small.innerText = message;
}

// Helper function to show success outline
function showSuccess(input) {
    const formControl = input.parentElement;
    formControl.className = 'form-control success';
    const small = formControl.querySelector('.error-message');
    small.innerText = ''; // Clear any previous error message
}

// Check email is valid
function checkEmail(input) {
    // Basic email regex from https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (re.test(input.value.trim())) {
        showSuccess(input);
        return true;
    } else {
        showError(input, 'Email is not valid');
        return false;
    }
}

// Check required fields
function checkRequired(inputArr) {
    let isValid = true;
    inputArr.forEach(function(input) {
        if (input.value.trim() === '') {
            showError(input, `${getFieldName(input)} is required`);
            isValid = false;
        } else {
            showSuccess(input);
        }
    });
    return isValid;
}

// Check input length
function checkLength(input, min, max) {
    if (input.value.length < min) {
        showError(input, `${getFieldName(input)} must be at least ${min} characters`);
        return false;
    } else if (input.value.length > max) {
        showError(input, `${getFieldName(input)} must be less than ${max} characters`);
        return false;
    } else {
        showSuccess(input);
        return true;
    }
}

// Check password strength
function checkPasswordStrength(input) {
    // At least 8 characters, one uppercase, one lowercase, one number, one special character
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (re.test(input.value)) {
        showSuccess(input);
        return true;
    } else {
        showError(input, 'Password must be 8+ chars, incl. uppercase, lowercase, number, and special char');
        return false;
    }
}

// Check passwords match
function checkPasswordsMatch(input1, input2) {
    if (input1.value === input2.value) {
        showSuccess(input2);
        return true;
    } else {
        showError(input2, 'Passwords do not match');
        return false;
    }
}

// Get fieldname
function getFieldName(input) {
    return input.id.charAt(0).toUpperCase() + input.id.slice(1).replace('2', '');
}

// Validate individual field on blur
function validateField(input) {
    let isValid = true;
    switch (input.id) {
        case 'username':
            isValid = checkLength(input, 3, 15);
            break;
        case 'email':
            isValid = checkEmail(input);
            break;
        case 'password':
            isValid = checkPasswordStrength(input);
            // If password is valid, re-check password2 if it has a value
            if (isValid && password2.value.length > 0) {
                checkPasswordsMatch(password, password2);
            }
            break;
        case 'password2':
            isValid = checkPasswordsMatch(password, password2);
            break;
    }
    return isValid;
}

// Event Listeners
form.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent default form submission

    // Validate all fields
    let isRequiredValid = checkRequired([username, email, password, password2]);
    let isUsernameValid = false;
    let isEmailValid = false;
    let isPasswordValid = false;
    let isPassword2Valid = false;

    if (isRequiredValid) { // Only proceed with specific checks if required fields are filled
        isUsernameValid = checkLength(username, 3, 15);
        isEmailValid = checkEmail(email);
        isPasswordValid = checkPasswordStrength(password);
        isPassword2Valid = checkPasswordsMatch(password, password2);
    }

    // If all validations pass, the form is valid
    if (isRequired
