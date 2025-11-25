const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

// Connecting to the SQLite database
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', // Database file
});

// Defining the User model
const User = sequelize.define(
    'User',
    {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: { msg: 'This email is already in use.' },
            validate: {
                isEmail: { msg: 'Invalid email format. Please enter a valid email.' },
            },
        },
        firstName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [3, 32],
                    msg: 'First name must be between 3 and 32 characters.',
                },
            },
            isAlpha: { msg: 'First name must contain only letters.' },
        },
        lastName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [3, 32],
                    msg: 'Last name must be between 3 and 32 characters.',
                },
                isAlpha: { msg: 'Last name must contain only letters.' },
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: {
                    args: [3, 32],
                    msg: 'Password must be between 3 and 32 characters.',
                },
            },
        },
    },
    {
        hooks: {
            beforeCreate: async (user, options) => {
                try {
                    const salt = await bcrypt.genSalt(10); // Generating salt
                    user.password = await bcrypt.hash(user.password, salt); // Encrypting the password
                } catch (err) {
                    throw new Error('Error encrypting the password.');
                }
            },
        },
    }
);

module.exports = { sequelize, User };
