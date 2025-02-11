const Transaction = require('../models/Transaction');
const User = require('../models/User');
const TotalBalance = require('../models/TotalBalance');

const addTransaction = async (req, res) => {
    const { type, date, amount, selectedMembers, remark } = req.body;

    try {
        if (!type || !date || !amount || !selectedMembers || selectedMembers.length === 0) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const individualShare = (type === 'income' ? amount : -amount) / selectedMembers.length;

        const memberShares = selectedMembers.map(userId => ({
            user: userId,
            share: individualShare
        }));

        const transaction = new Transaction({
            type,
            date,
            amount,
            remark,
            members: memberShares,
            createdBy: req.user.id
        });

        await transaction.save();

        // Update each user's balance
        await Promise.all(selectedMembers.map(async (member) => {
            const user = await User.findById(member);
            if (user) {
                user.balance = (user.balance || 0) + individualShare;
                await user.save();
            }
        }));

        // Recalculate total balance from sum of all users' balances
        const users = await User.find();
        const totalBalance = users.reduce((acc, user) => acc + (user.balance || 0), 0);

        res.status(201).json({ message: 'Transaction added successfully', transaction, totalBalance });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// Delete transaction by ID and recalculate total balance after deletion
const deleteTransaction = async (req, res) => {
    const { transactionId } = req.params;

    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Reverse user balance updates
        await Promise.all(transaction.members.map(async (member) => {
            const user = await User.findById(member.user);
            if (user) {
                user.balance = (user.balance || 0) - member.share;
                await user.save();
            }
        }));

        // Delete the transaction
        await Transaction.findByIdAndDelete(transactionId);

        // Recalculate total balance from all users
        const users = await User.find();
        const totalBalance = users.reduce((acc, user) => acc + (user.balance || 0), 0);

        res.status(200).json({ message: 'Transaction deleted successfully', totalBalance });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


// Get recent 10 transactions
const getRecentTransactions = async (req, res) => {
    try {
        // Fetch the most recent 10 transactions, sorted by date (descending)
        const transactions = await Transaction.find()
            .populate('createdBy', 'name') // Include creator's name
            .populate('members.user', 'name') // Include member names
            .sort({ date: -1 })
            .limit(10);

        res.status(200).json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

module.exports = { addTransaction, deleteTransaction, getRecentTransactions };
