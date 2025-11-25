const { User } = require('../models/userModel'); // Import user model

// Handle GET request for the password setup page
exports.getPassword = (req, res) => {
    const registerData = req.cookies.registerData; // Retrieve data from cookie
    if (!registerData) {
        return res.redirect('/register'); // Redirect to registration if no cookie is found
    }
    res.render('register/password', { title: 'Set Password', errors: [] });
};

// Handle POST request for setting a new password
exports.postPassword = async (req, res) => {
    const { password, confirmPassword } = req.body; // Get data from the form
    const registerData = req.cookies.registerData; // Retrieve data from cookie

    if (!registerData) {
        return res.redirect('/register'); // Redirect to registration if no cookie is found
    }

    let errors = [];

    // Validate passwords
    if (!password) {
        errors.push('Password is required. Please enter a password.');
    } else if (password.length < 3 || password.length > 32) {
        errors.push('Password must be between 3 and 32 characters.');
    }
    if (!confirmPassword) {
        errors.push('Confirm Password is required. Please re-enter your password.');
    } else if (password !== confirmPassword) {
        errors.push('Passwords do not match.');
    }

    // If there are errors, return to the form with messages
    if (errors.length > 0) {
        return res.render('register/password', {
            title: 'Set Password',
            errors,
        });
    }

    // Save user to the database
    try {
        await User.create({
            email: registerData.email.toLowerCase(),
            firstName: registerData.firstName,
            lastName: registerData.lastName,
            password,
        });

        res.clearCookie('registerData'); // Clear the cookie
        res.redirect('/register/success'); // Redirect to success page
    } catch (err) {
        console.error(err);
        res.render('register/password', {
            title: 'Set Password',
            errors: ['An error occurred while creating your account.'],
        });
    }
};
