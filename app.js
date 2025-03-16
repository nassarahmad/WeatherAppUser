const express = require("express");
const mysql = require("mysql2");
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Configure MySQL connection
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "123000",
    database: "weatherappuser"
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.log("Error connecting to MySQL:", err);
    }
});

// Register a new user
app.post('/register', async (req, res) => {
    try {
        const { username, password ,isAdmin} = req.body;

        // Check if the username already exists
        connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ error: 'Registration failed' });
            }

            if (results.length > 0) {
                return res.status(400).json({ error: 'Username already exists' });
            }

            // Hash the password
            bcrypt.hash(password, 10, (err, hashedPassword) => {
                if (err) {
                    console.error(err);
                    return res.status(400).json({ error: 'Registration failed' });
                }

                // Insert the user into the database
                connection.query(
                    'INSERT INTO users (username, password,is_admin) VALUES (?, ?)',
                    [username, hashedPassword,isAdmin||false],
                    (err, result) => {
                        if (err) {
                            console.error(err);
                            return res.status(400).json({ error: 'Registration failed' });
                        }

                        // Generate a JWT token
                        const token = jwt.sign({ id: result.insertId,isAdmin:isAdmin||false }, process.env.JWT_SECRET, { expiresIn: '1h' });

                        res.status(201).json({ user: { id: result.insertId, username,isAdmin:isAdmin||false }, token });
                    }
                );
            });
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Registration failed' });
    }
});

// Login a user
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user in the database
        connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(400).json({ error: 'Login failed' });
            }

            if (results.length === 0) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            const user = results[0];

            // Compare the password
            bcrypt.compare(password, user.password, (err, validPassword) => {
                if (err || !validPassword) {
                    return res.status(400).json({ error: 'Invalid credentials' });
                }

                // Generate a JWT token
                const token = jwt.sign({ id: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '1h' });

                // Set the token in a cookie
                res.cookie('token', token, {
                    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
                    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                    sameSite: 'strict', // Prevents CSRF attacks
                    maxAge: 3600000 // Cookie expires in 1 hour (in milliseconds)
                });

                res.json({ message: 'Login successful', isAdmin: user.is_admin });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Login failed' });
    }
});

const isAdmin = (req, res, next) => {
    const token = req.cookies.token; // Get the token from cookies
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.isAdmin) {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};




// Middleware to authenticate requests
const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid token' });
    }
};

app.get('/admin/dashboard', isAdmin, (req, res) => {
    res.json({ message: 'Welcome to the admin dashboard!' });
});

app.post('/logout', (req, res) => {
    res.clearCookie('token'); // Clear the token cookie
    res.json({ message: 'Logout successful' });
});

// Get weather data for a city
app.get('/weather', authenticate, async (req, res) => {
    try {
        const { city } = req.query;

        if (!city) {
            return res.status(400).json({ error: 'City parameter is required' });
        }

        // Fetch weather data from OpenWeatherAPI
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_API_KEY}`
        );

        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Failed to fetch weather data' });
    }
});


// Endpoint to get Fire Index for a location
app.get('/fire-index', async (req, res) => {
    try {
        // Get latitude and longitude from query parameters
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ error: 'Missing latitude or longitude' });
        }

        // Fetch Fire Index data from OpenWeatherMap API
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/fire/index?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`
        );

        // Send the response back to the client
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch Fire Index data' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server has been started on http://localhost:${PORT}`);
});