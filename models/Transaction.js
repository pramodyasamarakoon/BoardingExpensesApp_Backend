const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['income', 'expense' ],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    remark: {
        type: String,
    },
    members: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            share: {
                type: Number,
                required: true
            }
        }
    ],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Transaction', TransactionSchema);