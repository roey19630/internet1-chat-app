const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./userModel');

// Creating a Session Store in the database using Sequelize
const sessionStore = new SequelizeStore({
    db: sequelize, // Using the existing database connection
    tableName: 'Sessions' // The table name where sessions will be stored (can be changed)
});

// Defining Middleware for Session management
const sessionMiddleware = session({
    secret: 'my-secret-key', // Secret key for encrypting the Session ID
    store: sessionStore,
    resave: false, // Do not save if there are no changes
    saveUninitialized: false, // Do not create a new session if it is empty
    cookie: {
        secure: false, // Change to true in production with HTTPS
        maxAge: 3600000, // Session expiration time (1 hour)
    },
});

// Asynchronous function to sync the Sessions table with the database
async function syncSessionStore() {
    try {
        await sessionStore.sync();
        console.log('Session table synced successfully');
    } catch (err) {
        console.error('Error syncing session table:', err);
    }
}

// Calling the function to sync Sessions
syncSessionStore();

console.log("Session Store Loaded:", sessionStore);

// Exporting the Middleware and Session Store for use in other files
module.exports = { sessionMiddleware, sessionStore };
