const express = require('express');
const router = express.Router();
const chatroomController = require('../controllers/chatroomController');

// GET route to display the chatroom page
router.get('/', chatroomController.getChatroom);

// POST route to send a new message
router.post('/', chatroomController.postChatroom);

// POST route to search for messages
router.post('/search', chatroomController.searchMessages);

router.delete('/messages/:id', chatroomController.deleteMessage);

router.put('/messages/:id', chatroomController.updateMessage);

// GET route for Logout as part of chatroom
router.get('/logout', chatroomController.logout);

// Route to check for updated messages
router.get('/updated-messages', chatroomController.getUpdatedMessages);

module.exports = router;
