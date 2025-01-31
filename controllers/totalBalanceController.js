const Balance = require('../models/TotalBalance');

// Get the total balance of the boarding place
const getTotalBalance = async (req, res) => {
  try {
    const balance = await Balance.findOne();
    if (!balance) {
      return res.status(404).json({ message: 'Total balance not found' });
    }

    res.status(200).json({
      totalBalance: balance.totalBalance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getTotalBalance };
