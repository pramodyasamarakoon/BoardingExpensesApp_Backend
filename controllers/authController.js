const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Register a new user (admin-only)
const registerUser = async (req, res) => {
  const { name, password, role } = req.body;

  try {
    // Validate input
    if (!name || !password) {
      return res.status(400).json({ message: 'Please provide name and password' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      name,
      password,
      role: role || 'user', // Default role is 'user'
    });

    // Save user to database (password will be hashed automatically by the pre-save hook)
    await user.save();

    // Send response (no token generated here)
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login user
const loginUser = async (req, res) => {
  const { name, password } = req.body;

  try {
    // Validate input
    if (!name || !password) {
      return res.status(400).json({ message: 'Please provide name and password' });
    }

    // Check if user exists
    const user = await User.findOne({ name });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token (only after successful login)
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // Send response with token
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete a user (admin-only)
const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Check if the requester is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete users' });
    }

    // Find and delete the user
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send response
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try{
    const users = await User.find().select('_id name role');
    res.status(200).json(users);
  }catch(err){
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}

// Reset password (admin-only)
const resetPassword = async (req, res) => {
  const { userId } = req.params; // Get user ID from the URL
  const { newPassword } = req.body; // Get new password from request body

  try {
      // Check if requester is an admin
      if (req.user.role !== 'admin') {
          return res.status(403).json({ message: 'Only admins can reset passwords' });
      }

      // Find user by ID
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password in the database
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { registerUser, loginUser, deleteUser, getAllUsers, resetPassword };