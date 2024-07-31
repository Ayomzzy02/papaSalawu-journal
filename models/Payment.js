const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs')

const PaymentSchema = new Schema({
    transactionId: {
        type: String
    },

    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    article: {
        type: Schema.Types.ObjectId,
        ref: 'Journal',
        required: true,
    },

    receiptName: {
        type: String,
        required: true 
    },

    receiptUrl: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['Pending', 'Paid'],
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});



// Create and export the payment model
const Payment = mongoose.model('Payment', PaymentSchema);
module.exports = Payment;