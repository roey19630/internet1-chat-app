var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// Importing routes
var loginRouter = require('./routes/login');
var registerRouter = require('./routes/register/register');
var passwordRouter = require('./routes/register/password');
var successRouter = require('./routes/register/success');
var chatroomRouter = require('./routes/chatroom');

const { User } = require('./models/userModel'); // Importing database and user model
const { Message } = require('./models/messageModel'); // Importing message model
const { sequelize } = require('./models/userModel'); // Importing database connection

var app = express();

// Setting up view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Basic middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Checking database connection
sequelize.authenticate()
    .then(() => console.log('Database connected successfully'))
    .catch((err) => console.error('Unable to connect to the database:', err));

// Defining relationships between tables
User.hasMany(Message, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
});
Message.belongsTo(User, {
  foreignKey: 'userId',
});

// Synchronizing database and tables
sequelize
    .sync({ alter: true }) // Updates tables in case of model changes
    .then(() => console.log('Database and tables synced successfully'))
    .catch((err) => console.error('Error syncing database and tables:', err));

const { sessionMiddleware } = require('./models/sessions');

app.use(sessionMiddleware);

app.use((req, res, next) => {
  if (req.session && req.session.user) {
    req.sessionStore.get(req.session.id, (err, session) => {
      if (err || !session) {
        req.session.destroy(); // Deletes session on the server if it no longer exists in the database
        res.clearCookie('connect.sid'); // Deletes the cookie from the browser
        return res.redirect('/login'); // Redirects to login page
      }
      next();
    });
  } else {
    next();
  }
});

// Route definitions
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/register/password', passwordRouter);
app.use('/register/success', successRouter);
app.use('/chatroom', chatroomRouter);

// Default route to redirect to login page
app.get('/', function (req, res) {
  res.redirect('/login');
});

// Middleware to check session for protected routes
app.use('/chatroom', (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
});

// Handling 404 errors - Page not found
app.use((req, res, next) => {
  res.status(404).render('error', { message: "Page Not Found", status: 404 });
});

// General error handling
app.use((err, req, res, next) => {
  console.error("Error caught:", err.stack); // Logs the error to the console
  res.status(err.status || 500).render('error', {
    message: err.message || "Internal Server Error",
    status: err.status || 500
  });
});

module.exports = app;
