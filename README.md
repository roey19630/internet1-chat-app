# 💬 Node.js Chatroom – Authentication & Messaging App

A simple chatroom web application built with Node.js, Express, EJS, SQLite, and Sequelize as part of the Internet Programming course.

The project includes:
- User registration and login with server-side validation
- Session handling using express-session and cookies
- SQLite database with Sequelize ORM
- Chatroom page with:
  - Live message updates
  - Sending new messages
  - Editing and deleting your own messages
  - Searching messages by text
- Middleware protections for authenticated routes
- Clean MVC structure (routes, controllers, models, views)

## 🧰 How to Run the Project

### 1. Install dependencies
Make sure Node.js is installed. Then run inside the project folder:

npm install

### 2. Initialize the database
If database.sqlite already exists, no action is needed.  
If not, Sequelize will create it automatically on first run.

### 3. Run the application

npm start

For developer mode with auto-reload (if nodemon is installed):

npm run dev

### 4. Open in browser
http://localhost:3000

