const Journal = require('../models/Journal');
const User = require('../models/User');
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getUserArticles = catchAsync(async function (req, res, next) {
    try {
        const userId = req.user.id;

        // Fetch only the Chief-Editor's department
        const chiefEditorDepartment = await User.findById(userId);
    
        if (!chiefEditorDepartment) {
            return res.status(404).json({
                status: 'fail',
                message: 'Chief Editor not found'
            });
        }
    
        // Fetch all journals in the Chief-Editor's department
        const journals = await Journal.find({ department: chiefEditorDepartment.department })
            .populate('author', 'name')
            .sort({ submissionDate: -1 }); // Sort by submission date
    
        // Separate journals based on their status
        const pendingJournals = journals.filter(journal =>
            ['Submitted', 'Under Review', 'Accepted'].includes(journal.status)
        );
        const publishedJournals = journals.filter(journal => journal.status === 'Published');
        const rejectedJournals = journals.filter(journal => journal.status === 'Rejected');
    
        // Format the response
        const response = {
            pending: pendingJournals,
            published: publishedJournals,
            rejected: rejectedJournals
        };
    
        res.status(200).json({
            status: 'success',
            data: response
        });  
    } catch (error) {
        return next(new AppError(`An unexpected server error occurred: ${error.message}`, 500));
    }
});

