const { Message } = require('../models/messageModel');
const { User } = require('../models/userModel');
const { sessionStore } = require('../models/sessions');
const { Op } = require('sequelize');

/**
 * Handles GET request to display the chatroom page.
 */
exports.getChatroom = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const messages = await Message.findAll({
        where: { deleted: false }, // Filter out deleted messages
        include: [{ model: User, attributes: ['firstName', 'lastName'] }]
    });

    res.render('chatroom', {
        user: req.session.user,
        messages,
    });
};

/**
 * Handles POST request to send a new message.
 */
exports.postChatroom = async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/login');
    }
    try {
        const { message } = req.body;

        await Message.create({
            content: message,
            userId: req.session.user.id
        });

        res.redirect('/chatroom');
    }catch(error) {
        next(error); // If something unexpected happens, handle it with the global error handler
    }

};

/**
 * Handles POST request to search messages.
 */
exports.searchMessages = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    const { query } = req.body;

    const messages = await Message.findAll({
        where: {
            content: { [Op.like]: `%${query}%` },
            deleted: false, // Only non-deleted messages
        },
        include: [{ model: User, attributes: ['firstName', 'lastName'] }]
    });

    res.json({ messages });
};

/**
 * Handles message deletion.
 */
exports.deleteMessage = async (req, res,next) => {
    if (!req.session.user) {
        return res.status(403).render('error', { message: "Unauthorized", status: 403 });
    }

    const messageId = req.params.id;

    try {
        const message = await Message.findOne({ where: { id: messageId } });

        if (!message) {
            return res.status(404).render('error', { message: "Message not found", status: 404 });
        }

        if (message.userId !== req.session.user.id) {
            return res.status(403).render('error', { message: "Forbidden: You cannot delete this message", status: 403 });
        }

        // Mark message as deleted
        message.deleted = true;
        await message.save();

        res.status(200).send('Message marked as deleted successfully');
    } catch (error) {
        next(error); // Send the error to app.js error handler
    }
};

/**
 * Handles message updates.
 */
exports.updateMessage = async (req, res) => {
    if (!req.session.user) {
        return res.status(403).send('Unauthorized');
    }

    const { id } = req.params; // Message ID
    const { content } = req.body; // New content

    try {
        const message = await Message.findOne({ where: { id } });

        if (!message) {
            return res.status(404).send('Message not found');
        }

        // Check if the current user is the owner of the message
        if (message.userId !== req.session.user.id) {
            return res.status(403).send('Forbidden');
        }

        // Update content and mark as edited
        message.content = content;
        message.edited = true;
        await message.save();

        res.status(200).json({ success: true, message });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).send('Internal Server Error');
    }
};

/**
 * Logs out the user and deletes all sessions associated with the user ID.
 */
exports.logout= async (req, res) => {
    try {
        // Check if there is an active session with a user
        if (!req.session || !req.session.user) {
            return res.redirect('/login');
        }

        // Extract user.id from the current session
        const userId = req.session.user.id;

        // Step 1: Delete the current session
        req.session.destroy(async (err) => {
            if (err) {
                console.error('Failed to destroy session:', err);
                return res.status(500).send('Failed to logout.');
            }

            console.log('Current session destroyed.');

            // Clear session cookie
            res.clearCookie('connect.sid'); // 'connect.sid' is the default session cookie name

            // Step 2: Delete all sessions with the same user.id
            try {
                // Use sessionStore to delete sessions with the same user.id
                const sessions = await sessionStore.sessionModel.findAll();

                // Filter sessions containing the target user.id
                const sessionsToDelete = sessions.filter(session => {
                    const sessionData = JSON.parse(session.data); // Parse the session data (JSON)
                    return sessionData.user && sessionData.user.id === userId;
                });

                // Extract session IDs for deletion
                const sidsToDelete = sessionsToDelete.map(session => session.sid);

                if (sidsToDelete.length > 0) {
                    await sessionStore.sessionModel.destroy({
                        where: {
                            sid: {
                                [Op.in]: sidsToDelete, // Use IN operator to delete multiple sessions
                            },
                        },
                    });

                    console.log(`${sidsToDelete.length} sessions deleted for user ID: ${userId}`);
                } else {
                    console.log(`No additional sessions found for user ID: ${userId}`);
                }
            } catch (error) {
                console.error('Error deleting additional sessions:', error);
            }

            // Redirect to login page
            res.redirect('/login');
        });
    } catch (error) {
        console.error('Error in logout process:', error);
        res.status(500).send('An error occurred during logout.');
    }
};

/**
 * Fetches updated messages after the last polling time.
 */
exports.getUpdatedMessages = async (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).render('error', { message: "Unauthorized access", status: 401 });
    }

    const { lastPollingTime } = req.query;
    const userId = req.session.user.id;

    try {
        const updatedMessages = await Message.findAll({
            where: {
                updatedAt: { [Op.gt]: new Date(lastPollingTime) },
                userId: { [Op.ne]: userId },
            },
            include: [{ model: User, attributes: ['firstName', 'lastName'] }],
            attributes: ['id', 'content', 'createdAt', 'updatedAt', 'deleted', 'edited', 'userId'],
        });

        res.json({ messages: updatedMessages });
    } catch (error) {
        next(error); // Pass the error to app.js global error handler
    }
};
