const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
require("dotenv").config();
const {connection} = require("../database/db"); // distraction 
const authenticate = require("./middleware/authenticate"); // Import the authenticate middleware
const authenticateuser = require("./middleware/authenticateuser");


const app = express();
const router = express.Router();


// User Registration
router.route("/register").post( async (req, res) => {
    const { username, password, email, isAdmin } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username and password are required" });
    
    
    connection.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
        
        if (results.length > 0) return res.status(400).json({ error: "Username already exists" });

    connection.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {

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
                return res.status(400).json({ error: 'user not found' });
            }

            const user = results[0];

            // Compare the password
            bcrypt.compare(password, user.password, (err, validPassword) => {
                if (err || !validPassword) {
                    return res.status(400).json({ error: 'Invalid Password' });
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
      //error db
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to connect DB" });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: "Invalid email or username" });
        }

        const user = results[0];

        // Hash the new password
        bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Failed to hashed Password" });
            }

            // Update the user's password in the database
            connection.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, user.id], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Failed to connect DB To update password" });
                }

                res.status(200).json({ message: "Password reset successfully" });
            });
        });
    });
});


// Get Weather Data
router.route("/weather/:city").get(async (req, res) => {
    try {
        const city = req.params.city;
        const apiKey = process.env.OPENWEATHER_API_KEY;
        
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        
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




router.route("/favorites").post((req, res) => {
    const { userId, city, latitude, longitude } = req.body;

    // Step 1: Check if the city already exists for the user
    connection.query(
        "SELECT * FROM favorite_cities WHERE user_id = ? AND city_name = ?",
        [userId, city],
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({
                    error: "Failed to check existing city in favorites",
                    details: err.message
                });
            }

            // Step 2: If the city already exists, return an error response
            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "City already exists in favorites"
                });
            }
            connection.query(
                "INSERT INTO favorite_cities (user_id, city_name, latitude, longitude) VALUES (?, ?, ?, ?)",
                [userId, city, latitude, longitude],
                (err, result) => {
                    if (err) {
                        console.error("Database error:", err);
                        return res.status(500).json({
                            error: "Failed to add city to favorites",
                            details: err.message
                        });
                    }
                    res.status(201).json({
                        success: true,
                        message: "City added to favorites",
                        cityId: result.insertId
                    });
                }
            );
        }
    );
});

router.route("/favorites/:userId").get((req, res) => {
    const userId = req.params.userId;
    
    connection.query(
        "SELECT id, user_id, city_name, latitude, longitude FROM favorite_cities WHERE user_id = ?",
        [userId],
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ 
                    error: "Failed to fetch favorite cities",
                    details: err.message
                });
            }
            
            res.json({
                
                favorites: results
            });
        }
    );
});


// Get Favorite Cities with Weather
router.route("/favorites/:userId").get(async (req, res) => {
    const userId = req.params.userId;

    connection.query(
        "SELECT city_name, latitude, longitude FROM favorite_cities WHERE user_id = ?", 
        [userId], 
        (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ 
                    error: "Failed to fetch favorite cities",
                    details: err.message 
                });
            }

            res.json({ 
                favorites: results 
            });
        }
    );
});

// Remove Favorite City
router.route("/favorites/:userId/:city").delete((req, res) => {
    const userId = req.params.userId;
    const city = req.params.city;

    connection.query(
        "DELETE FROM favorite_cities WHERE user_id = ? AND city_name = ?",
        [userId, city],
        (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ 
                    error: "Failed to fetch DB",
                    details: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    error: "City not found in favorites" 
                });
            }

            res.status(200).json({ 
                
                message: "City removed from favorites" 
            });
        }
    );
});

// Get Weather Forecast for the next 5 days
router.route("/forecast/:city").get(async (req, res) => {
    try {
        const city = req.params.city;
        const apiKey = process.env.OPENWEATHER_API_KEY;

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
        ); res.json({
            city: response.data.city.name,
            forecast: response.data.list.filter((_, index) => index % 8 === 0).map(item => ({
                dt: item.dt,
                main: item.main,
                weather: item.weather,
                dt_txt: item.dt_txt
            })),
            list: response.data.list 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch weather forecast" });
    }
});


// current weather
router.route("/current-weather").get(async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        // latitude  longitude
        if (!latitude || !longitude) {
            return res.status(400).json({ error: "Latitude and longitude are required" });
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;

        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
        );

        res.json({
            city: response.data.name,
            temperature: response.data.main.temp,
            description: response.data.weather[0].description,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed,
            fullData: response.data,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch current weather data" });
    }
});


// Get all users (Admin only)
router.route("/users").get(authenticateuser,  (req, res) => {
    try {
        // Check if the authenticated user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: "Unauthorized: Only admins can access this resource" });
        }

        // Fetch all users from the database
        connection.query("SELECT id, username, email, is_admin FROM users", (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Failed to fetch users" });
            }

            res.status(200).json({ users: results });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


// Delete User (Admin only)
router.route("/users/:userId").delete(authenticateuser, (req, res) => {
    try {
        const { userId } = req.params;

        // Check if the authenticated user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).json({ error: "Unauthorized: Only admins can delete users" });
        }

        // Delete the user from the database
        connection.query(
            "DELETE FROM users WHERE id = ?",
            [userId],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Failed to delete user" });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: "User not found" });
                }

                res.status(200).json({ message: "User deleted successfully" });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Edit User (Admin only)
router.route("/users/:userId").put(authenticateuser, async (req, res) => {
    try {
        const { userId } = req.params;
        const { username, email} = req.body;


        // Validate input
        if (!username || !email) {
            return res.status(400).json({ error: "Username and email are required" });
        }

        // Update the user in the database
        connection.query(
            "UPDATE users SET username = ?, email = ?  WHERE id = ?",
            [username, email || false, userId],
            (err, result) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: "Failed to update user" });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({ error: "User not found" });
                }

                res.status(200).json({ message: "User updated successfully" });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});


 router.route("/geocode/:city").get(async (req, res) => {
    try {
        const city = req.params.city;
        const apiKey = process.env.OPENWEATHER_API_KEY;
        
        const response = await axios.get(
            `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${apiKey}`
        );
        
        const locations = response.data.map(item => ({
            name: item.name,
            lat: item.lat,
            lon: item.lon,
            country: item.country
        }));
        
        res.json(locations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch city coordinates" });
    }
}); 


// Air Quality Endpoint
router.route("/air-quality").get(async (req, res) => {
    try {
        const { lat, lon } = req.query;
        const apiKey = process.env.OPENWEATHER_API_KEY;
        
        const response = await axios.get(
            `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
        );
        
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch air quality data" });
    }
}); 

// Logout Endpoint
router.route("/logout").post(authenticate, async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Logout failed" });
    }
});

router.route("/check-auth").get(async (req, res) => {
    try {
        const token = req.cookies.token;
            if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        connection.query(
        "SELECT id, username, email, is_admin FROM users WHERE id = ?",
        [decoded.id],
        (err, results) => {
            if (err || results.length === 0) {
            return res.status(401).json({ error: "Invalid user" });
            }
            const user = results[0];
            res.status(200).json({
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.is_admin,
            },
            });
        }
        );
    } catch (error) {
        res.status(401).json({ error: "Invalid token" });
    }
    });

module.exports = router;