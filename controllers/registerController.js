const { User } = require('../models/userModel');

// Function to handle GET request for the registration page
exports.getRegister = (req, res) => {
    const registerData = req.cookies.registerData; // Retrieve data from cookie (if available)
    const formData = registerData ? registerData : { email: '', firstName: '', lastName: '' }; // Use empty values if no data exists
    res.render('register/register', { title: 'Register', errors: [], formData });
};

// Function to handle POST request for the registration page
exports.postRegister = async (req, res) => {
    const { email, firstName, lastName } = req.body; // Get data from the form

    try {
        // Create a new user object in memory only
        const newUser = User.build({ email, firstName, lastName });

        // Validate input fields (excluding password)
        await newUser.validate({
            fields: ['email', 'firstName', 'lastName'], // Validate specific fields
        });

        // Check if the email already exists in the database
        const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
        if (existingUser) {
            const emailError = new Error('This email is already in use.');
            emailError.type = 'email'; // Set error type
            throw emailError;
        }

        // Save data in a cookie
        res.cookie('registerData', { email, firstName, lastName }, { httpOnly: true, maxAge: 30 * 1000 });
        res.redirect('/register/password'); // Redirect to password setup page
    } catch (err) {
        console.error(err);

        // Handle validation errors
        const errors = err.type === 'email'
            ? [err.message]
            : err.errors
                ? err.errors.map(e => e.message)
                : ['An unexpected error occurred.'];

        // Render the registration page with error messages
        res.render('register/register', {
            title: 'Register',
            errors,
            formData: { email, firstName, lastName }
        });
    }
};
