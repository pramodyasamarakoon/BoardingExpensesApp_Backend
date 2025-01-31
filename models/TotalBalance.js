const mongoose = require('mongoose');

const totalBalanceSchema = new mongoose.Schema({
    totalBalance: {
        type: Number,
        default: 0,
        required: true
    }
})

module.exports = mongoose.model('TotalBalance', totalBalanceSchema);