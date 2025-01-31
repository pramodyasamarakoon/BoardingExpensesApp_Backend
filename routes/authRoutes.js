const express = require('express');
const { registerUser, loginUser, deleteUser, getAllUsers, resetPassword } = require('../controllers/authController');
const { addTransaction, deleteTransaction, getRecentTransactions } = require('../controllers/transactionController');
const { getUserDashboard } = require('../controllers/dashboardController');
const { getTotalBalance } = require('../controllers/totalBalanceController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Register a new user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Delete a user (admin-only)
router.delete('/delete/:userId', authMiddleware, deleteUser);

// Add a new transaction (only admin can add a transaction)
router.post('/addTransaction', authMiddleware, addTransaction);

// delete transaction (only admin)
router.delete('/deleteTransaction/:transactionId', authMiddleware, deleteTransaction);

// get recent transaction (only admin)
router.get('/getRecentTransactions', authMiddleware, getRecentTransactions);

// Admin-only route to get a user's dashboard
router.get('/dashboard/:userId', getUserDashboard);

// Get the total balance
router.get('/total-balance', getTotalBalance);

// Get all users
router.get('/allUsers', getAllUsers);

// Get all users
router.put('/resetPassword/:userId',authMiddleware,  resetPassword);

module.exports = router;