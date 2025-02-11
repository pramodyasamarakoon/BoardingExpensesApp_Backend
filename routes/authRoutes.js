const express = require('express');
const { 
    registerUser, 
    loginUser, 
    deleteUser, 
    getAllUsers, 
    resetPassword 
} = require('../controllers/authController');
const { 
    addTransaction, 
    deleteTransaction, 
    getRecentTransactions 
} = require('../controllers/transactionController');
const { getUserDashboard } = require('../controllers/dashboardController');
const { getTotalBalance } = require('../controllers/totalBalanceController');
const { authenticateUser, authenticateAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Routes (Requires authentication)
router.get('/currentUser', authenticateUser, (req, res) => {
    res.status(200).json(req.user); // Return authenticated user details
});

router.put('/resetPassword/:userId', authenticateUser, authenticateAdmin, resetPassword);

// Admin-only Routes
router.delete('/delete/:userId', authenticateUser, authenticateAdmin, deleteUser);
router.post('/addTransaction', authenticateUser, authenticateAdmin, addTransaction);
router.delete('/deleteTransaction/:transactionId', authenticateUser, authenticateAdmin, deleteTransaction);
router.get('/getRecentTransactions', authenticateUser, authenticateAdmin, getRecentTransactions);
router.get('/dashboard/:userId', authenticateUser, authenticateAdmin, getUserDashboard);
router.get('/total-balance', authenticateUser, authenticateAdmin, getTotalBalance);
router.get('/allUsers', authenticateUser, authenticateAdmin, getAllUsers);

module.exports = router;
