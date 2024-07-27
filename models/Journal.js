const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const JournalSchema = new Schema({
    title: {
        type: String
    },

    abstract: {
        type: String
    },

    keywords: [String],

    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    
    submissionDate: {
        type: Date,
        default: Date.now,
    },

    publishedDate: {
        type: Date,
        default: Date.now
    },

    department: {
        type: String,
        enum: ["Adult and Primary Education", "Arts Education", "Computer Science Education", "Counsellor Education", "Educational Management", "Educational Technology", "Environmental Health Education", "Human Kinetics Education", "Science Education", "Social Sciences Education"], // Add your departments here
        required: true,
    },

    status: {
        type: String,
        enum: ['Submitted', 'Under Review',  'Accepted', 'Rejected', 'Published'],
        default: 'Submitted',
    },

    versions: [{
        documentUrl: {
            type: String,
            required: true
        },
        versionDate: {
            type: Date,
            default: Date.now
        },
        issueName: {
            type: String,
            required: true,
            default: "Initial Upload" 
        },
    }],

    createdAt: {
        type: Date,
        default: Date.now,
    },
    
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Journal = mongoose.model('Journal', JournalSchema);
module.exports = Journal;