const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();
const {connection} = require("../database/db"); // distraction 

const app = express();
const router = express.Router();


// User Registration
router.route("/register").post( async (req, res) => {
    const { username, password, email, isAdmin } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password are required" });
    
    
    connection.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
        if (err) return res.status(400).json({ error: "Registration failed" });
        if (results.length > 0) return res.status(400).json({ error: "Username already exists" });

    connection.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
            if (err) return res.status(400).json({ error: "Registration failed" });
            if (results.length > 0) return res.status(400).json({ error: "Email already exists" });

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(400).json({ error: "Registration failed" });

            connection.query("INSERT INTO users (username, password, email, is_admin) VALUES (?, ?, ?, ?)", 
                [username, hashedPassword,email, isAdmin || false], 
                (err, result) => {
                    if (err) return res.status(400).json({ error: "Registration failed" });

                    const token = jwt.sign({ id: result.insertId, isAdmin: isAdmin || false }, process.env.JWT_SECRET, { expiresIn: "1h" });
                    res.status(201).json({ user: { id: result.insertId, username, isAdmin }, token });
                }
            );
        });
    });
});
});

// Login a user
router.route('/login').post( async (req, res) => {
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

                const message = user.is_admin ? 'Login successful Admin' : 'Login successful User';

                res.json({ message, isAdmin: user.is_admin });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'Login failed' });
    }
});


// Forgot Password - Reset Password
router.route("/forgot-password").post(async (req, res) => {
    const { email, username, newPassword } = req.body;

    // Validate input
    if (!email || !username || !newPassword) {
        return res.status(400).json({ error: "Email, username, and new password are required" });
    }

    // Check if the user exists with the provided email and username
    connection.query("SELECT * FROM users WHERE email = ? AND username = ?", [email, username], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to reset password" });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: "Invalid email or username" });
        }

        const user = results[0];

        // Hash the new password
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Failed to reset password" });
            }

            // Update the user's password in the database
            connection.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Failed to reset password" });
                }

                res.status(200).json({ message: "Password reset successfully" });
            });
        });
    });
});




// Get Weather Data
router.route("/weather/:city").get( async (req, res) => {
    try {
        const city = req.params.city;
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);

        res.json({
            requestedData: {
                city: response.data.name,
                temperature: response.data.main.temp,
                description: response.data.weather[0].description,
                humidity: response.data.main.humidity,
                windSpeed: response.data.wind.speed
            },
            fullData: response.data
        });
        
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

// Add Favorite City
router.route("/favorites").post( (req, res) => {
    const { userId, city } = req.body;
    connection.query("INSERT INTO favorite_cities (user_id, city_name) VALUES (?, ?)", [userId, city], (err) => {
        if (err) return res.status(500).json({ error: "Failed to add city to favorites" });
        res.status(201).json({ message: "City added to favorites" });
    });
});


// Get Favorite Cities with Weather
router.route("/favorites/:userId").get( async (req, res) => {
    const userId = req.params.userId;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    connection.query("SELECT city_name FROM favorite_cities WHERE user_id = ?", [userId], async (err, results) => {
        if (err) return res.status(500).json({ error: "Failed to fetch favorite cities" });

        const favoriteCities = results.map(row => row.city_name);
        const weatherData = await Promise.all(
            favoriteCities.map(city => axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
                .then(response => ({
                    city,
                    temperature: response.data.main.temp,
                    description: response.data.weather[0].description,
                    humidity: response.data.main.humidity,
                    windSpeed: response.data.wind.speed
                }))
                .catch(() => ({ city, error: "Weather data unavailable" }))
            )
        );

        res.json({ favorites: weatherData });
    });
});


// Remove Favorite City
router.route("/favorites/:userId/:city").delete( (req, res) => {
    const userId = req.params.userId;
    const city = req.params.city;

    connection.query("DELETE FROM favorite_cities WHERE user_id = ? AND city_name = ?", [userId, city], (err, result) => {
        if (err) return res.status(500).json({ error: "Failed to remove city from favorites" });
        if (result.affectedRows === 0) return res.status(404).json({ error: "City not found in favorites" });

        res.status(200).json({ message: "City removed from favorites" });
    });
});


// Get Weather Forecast for the next 5 days
router.route("/forecast/:city").get(async (req, res) => {
    try {
      const city = req.params.city;
      const apiKey = process.env.OPENWEATHER_API_KEY;
  
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
      );
  
      // Extract the relevant data (every 8 timestamps = 1 day)
      const forecastData = response.data.list
        .filter((_, index) => index % 8 === 0)
        .map((entry) => ({
          date: entry.dt_txt.split(" ")[0],
          temperature: entry.main.temp,
          description: entry.weather[0].description,
          humidity: entry.main.humidity,
          windSpeed: entry.wind.speed,
        }));
  
      res.json({
        city: response.data.city.name,
        forecast: forecastData,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch weather forecast" });
    }
  });






// Logout - Clear Token
router.post("/logout:id", (req, res) => {
    const id=req.params
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});


// POST /location: Fetch weather data based on latitude and longitude from the request body
app.post('/location', async (req, res) => {
    try {
        const { lat, lon } = req.body;

        // Validate input
        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        // Fetch weather data from OpenWeatherMap API
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`
        );

        // Return the weather data
        res.json(response.data);
    } catch (error) {
        console.error(error);

        // Handle specific Axios errors
        if (error.response) {
            // OpenWeatherMap API returned an error response
            return res.status(error.response.status || 500).json({ error: error.response.data.message || 'Failed to fetch location data' });
        }

        // Generic server error
        res.status(500).json({ error: 'Failed to fetch location data' });
    }
});

// GET /weather/current: Fetch current weather data based on latitude and longitude from query parameters
app.get('/weather/current', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        // Validate input
        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        // Fetch weather data from OpenWeatherMap API
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
        );

        // Return the weather data
        res.json(response.data);
    } catch (error) {
        console.error(error);

        // Handle specific Axios errors
        if (error.response) {
            // OpenWeatherMap API returned an error response
            return res.status(error.response.status || 500).json({ error: error.response.data.message || 'Failed to fetch current weather data' });
        }

        // Generic server error
        res.status(500).json({ error: 'Failed to fetch current weather data' });
    }
});


module.exports = router;