# 💬 Node.js Chatroom – Authentication & Messaging App

A simple chatroom web application built with **Node.js, Express, EJS, SQLite, and Sequelize** as part of the Internet Programming course.

The project includes:
- User **registration & login** with server-side validation  
- **Session handling** using `express-session` + cookies  
- SQLite database with Sequelize ORM  
- Chatroom page showing:
  - Live message updates 
  - Sending new messages
  - Editing and deleting own messages
  - Searching messages by text
- Proper session checks (protecting routes, forcing login if not authenticated)
- Clean MVC structure (routes, controllers, models)
