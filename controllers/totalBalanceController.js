const User = require('../models/User');

// Get the total balance of the boarding place
const getTotalBalance = async (req, res) => {
  try {
      const users = await User.find();
      let totalBalance = users.reduce((acc, user) => acc + (user.balance || 0), 0);
      
      // Ensure totalBalance is always a double with 2 decimal places
      totalBalance = parseFloat(totalBalance.toFixed(2));

      res.status(200).json({ totalBalance }); // Ensure it's a plain number, not an object
  } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
  }
};



module.exports = { getTotalBalance };
