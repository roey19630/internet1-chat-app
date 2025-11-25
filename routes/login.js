const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController'); // Import the Controller

// GET route to display the login page
router.get('/', loginController.getLogin);

// POST route to handle login details
router.post('/', loginController.postLogin);

module.exports = router;
