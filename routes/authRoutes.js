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

// ✅ Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// ✅ Protected Routes (Requires authentication)
router.get('/currentUser', authenticateUser, (req, res) => {
    // Ensure sensitive fields are not exposed
    const { _id, name, role } = req.user;
    res.status(200).json({ id: _id, name, role });
});

router.put('/:userId/resetPassword', authenticateUser, authenticateAdmin, resetPassword);

// ✅ Admin-only Routes
router.delete('/:userId', authenticateUser, authenticateAdmin, deleteUser);
router.post('/transactions', authenticateUser, authenticateAdmin, addTransaction);
router.delete('/transactions/:transactionId', authenticateUser, authenticateAdmin, deleteTransaction);
router.get('/transactions/recent', authenticateUser, authenticateAdmin, getRecentTransactions);
router.get('/:userId/dashboard', authenticateUser, getUserDashboard);
router.get('/all', authenticateUser, authenticateAdmin, getAllUsers);
router.get('/total-balance', authenticateUser, getTotalBalance);

module.exports = router;
