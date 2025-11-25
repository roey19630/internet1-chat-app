const express = require('express');
const router = express.Router();

// Step 3 - Success
router.get('/', (req, res) => {
    res.render('register/success', { title: 'Success' });
});

module.exports = router;
