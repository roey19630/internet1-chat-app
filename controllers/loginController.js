const { User } = require('../models/userModel'); // Import user model
const bcrypt = require('bcrypt'); // Import bcrypt for password hashing

// Handle GET request to display the login page
exports.getLogin = (req, res) => {
    res.render('login', { title: 'Login', errors: [], formData: {} });
};

// Handle POST request after submitting login details
exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body; // Get form data
    let errors = [];

    // Validate if fields are empty
    if (!email || !password) {
        errors.push({ msg: 'Email and password are required.' });
    }

    try {
        // Check if the user exists in the database
        const user = await User.findOne({ where: { email: email.toLowerCase() } });

        if (!user) {
            errors.push({ msg: 'Invalid email or password. Please try again.' });
        } else {
            // Compare the entered password with the hashed password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                errors.push({ msg: 'Invalid email or password. Please try again.' });
            }
        }

        // If there are errors, reload the form with error messages
        if (errors.length > 0) {
            return res.render('login', {
                title: 'Login',
                errors,
                formData: { email, password } // Preserve entered values
            });
        }

        // Save user details in session
        req.session.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName
        };

        console.log('Session after login:', req.session); // Log session for debugging

        // Redirect to chatroom after successful login
        res.redirect('/chatroom');
    } catch (err) {
        console.error("Unexpected error in login process:", err);
        next(err); // Only unexpected errors are passed to the global error handler
    }
};
