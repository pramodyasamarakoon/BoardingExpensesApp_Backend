const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

// Middleware to verify token and attach user info to request
const authenticateUser = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.split(' ')[1]; // Extract Bearer token
        if (!token) return res.status(401).json({ message: 'Unauthorized: No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password'); // Attach user to request (excluding password)

        if (!req.user) return res.status(401).json({ message: 'Unauthorized: Invalid token' });

        next();
    } catch (err) {
        res.status(401).json({ message: 'Unauthorized: Invalid token', error: err.message });
    }
};

// Middleware to check if user is an admin
const authenticateAdmin = async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
};

module.exports = { authenticateUser, authenticateAdmin };
