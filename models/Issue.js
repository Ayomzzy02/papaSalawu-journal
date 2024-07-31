const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    contentText: {
        type: String,
        required: true
    },
    contentFileUrl: {
        type: String,
        required: false
    }
});

const ConversationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: MessageSchema,
        required: true
    },
    time: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const IssueSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    articleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Journal'
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Opened', 'Closed'],
        default: 'Opened',
        required: true
    },
    reviewers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }], 
    openedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    time: {
        type: Date,
        default: Date.now,
        required: true
    },
    conversations: [ConversationSchema]
});

const Issue = mongoose.model('Issue', IssueSchema);
module.exports = Issue;
