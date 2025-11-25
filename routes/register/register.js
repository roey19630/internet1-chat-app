const express = require('express');
const router = express.Router();
const registerController = require('../../controllers/registerController'); // Importing the Controller

// Step 1 - Entering personal details
router.get('/', registerController.getRegister); // Calls the function from the Controller
router.post('/', registerController.postRegister); // Calls the function from the Controller

module.exports = router;
