const Transaction = require('../models/Transaction');
const User = require('../models/User');
const TotalBalance = require('../models/TotalBalance');

const addTransaction = async (req, res) => {
    const { type, date, amount, selectedMembers, remark } = req.body;

    try {
        // Validate inputs
        if (!type || !date || !amount || !selectedMembers || selectedMembers.length === 0) {
            console.log("❌ Missing Fields:", { type, date, amount, selectedMembers, remark }); // Debugging
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Ensure the amount is divided equally
        const individualShare = (type === 'income' ? amount : -amount) / selectedMembers.length;

        // Prepare member share data
        const memberShares = selectedMembers.map(userId => ({
            user: userId,
            share: individualShare
        }));

        // Create the new transaction object
        const transaction = new Transaction({
            type,
            date,
            amount,
            remark,
            members: memberShares,
            createdBy: req.user.id // Assuming the admin is logged in
        });

        // Save the transaction to the database
        await transaction.save();

        // Find or create total balance
        let balance = await TotalBalance.findOne();
        if (!balance) {
            balance = new TotalBalance({ totalBalance: 0 });
            await balance.save();
        }

        balance.totalBalance += (type === 'income' ? amount : -amount);
        await balance.save();

        // Now update the balance for each member
        await Promise.all(selectedMembers.map(async (member) => {
            const user = await User.findById(member);
            if (user) {
                user.balance = (user.balance || 0) + individualShare; // Adjust balance
                await user.save();
            }
        }));

        // Send success response
        res.status(201).json({ message: 'Transaction added successfully', transaction });
        console.log("Received Data:", req.body);

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Delete transaction by ID and recalculate total balance after deletion
const deleteTransaction = async (req, res) => {
    const { transactionId } = req.params; // Get transaction ID from URL

    try {
        // Find the transaction
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Find or create total balance
        let balance = await TotalBalance.findOne();
        if (!balance) {
            balance = new TotalBalance({ totalBalance: 0 });
            await balance.save();
        }

        // Reverse the total balance update based on transaction type
        const amountChange = transaction.type === 'income' ? transaction.amount : -transaction.amount;
        balance.totalBalance -= amountChange; // Reverse the total balance change
        await balance.save();

        // Reverse each user's balance based on the transaction members
        await Promise.all(transaction.members.map(async (member) => {
            const user = await User.findById(member.user);
            if (user) {
                user.balance = (user.balance || 0) - member.share; // Reverse the individual share balance
                await user.save();
            }
        }));

        // Now, recalculate the total balance from all transactions after deletion
        const allTransactions = await Transaction.find();
        let newTotalBalance = 0;

        // Recalculate the total balance by summing all transaction amounts
        for (const trans of allTransactions) {
            newTotalBalance += (trans.type === 'income' ? trans.amount : -trans.amount);
        }

        // Update the balance with the new recalculated total
        balance.totalBalance = newTotalBalance;
        await balance.save();

        // Delete the transaction
        await Transaction.findByIdAndDelete(transactionId);

        // Send success response
        res.status(200).json({ message: 'Transaction deleted and total balance updated successfully' });
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
