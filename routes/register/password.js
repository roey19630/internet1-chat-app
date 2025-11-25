const express = require('express');
const router = express.Router();
const passwordController = require('../../controllers/passwordController'); // Importing the Controller

// Step 2 - Entering passwords
router.get('/', passwordController.getPassword);
router.post('/', passwordController.postPassword);

module.exports = router;
