const mongoose = require('mongoose');  // Import mongoose
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const getUserDashboard = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch the most recent 10 transactions for the user
    const transactions = await Transaction.aggregate([
      { $match: { "members.user": new mongoose.Types.ObjectId(userId) } }, // Use new for ObjectId
      { $unwind: "$members" },
      { $match: { "members.user": new mongoose.Types.ObjectId(userId) } }, // Use new for ObjectId
      { $sort: { date: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          type: 1,
          date: 1,
          amount: 1,
          remark: 1,
          share: "$members.share"
        }
      }
    ]);

    // Calculate the total balance for the user
    const balance = await Transaction.aggregate([
      { $match: { "members.user": new mongoose.Types.ObjectId(userId) } }, // Use new for ObjectId
      { $unwind: "$members" },
      { $match: { "members.user": new mongoose.Types.ObjectId(userId) } }, // Use new for ObjectId
      {
        $group: {
          _id: null,
          totalBalance: { $sum: "$members.share" }
        }
      }
    ]);

    res.status(200).json({
      message: 'User dashboard fetched successfully',
      transactions,
      totalBalance: balance.length > 0 ? balance[0].totalBalance : 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getUserDashboard };
