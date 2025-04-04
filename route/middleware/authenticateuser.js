// for admin dashboard
const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the user payload to the request object
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};

module.exports = authenticate;