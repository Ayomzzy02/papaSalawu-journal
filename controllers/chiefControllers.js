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
            ['Submitted', 'In-Review'].includes(journal.status)
        );
        const publishedJournals = journals.filter(journal => journal.status === 'Published');
        const acceptedJournals = journals.filter(journal => journal.status === 'Accepted');
        const rejectedJournals = journals.filter(journal => journal.status === 'Rejected');
    
        // Format the response
        const response = {
            pending: pendingJournals,
            published: publishedJournals,
            rejected: rejectedJournals,
            accepted: acceptedJournals
        };
    
        res.status(200).json({
            status: 'success',
            data: response
        });  
    } catch (error) {
        return next(new AppError(`An unexpected server error occurred: ${error.message}`, 500));
    }
});


exports.addReviewer = catchAsync(async (req, res, next) => {
    try {
      const { reviewerID } = req.body;
      const { articleId } = req.params;
  
      if (!reviewerID || !articleId) {
        return next(new AppError('Reviewer ID and Article ID are required', 400));
      }
  
      const journal = await Journal.findByIdAndUpdate(
        articleId,
        { $addToSet: { reviewers: reviewerID } }, // Using $addToSet to avoid duplicates
        { new: true, runValidators: true }
      );
  
      if (!journal) {
        return next(new AppError('No article found with that ID', 404));
      }
  
      res.status(200).json({
        status: 'success',
        message: `New Reviewer Added`,
      });
    } catch (error) {
      return next(new AppError(`Internal Server Error: ${error.message}`, 500));
    }
});

exports.getReviewers = catchAsync(async (req, res, next) => {
    try {
        const { articleId } = req.params;

        if (!articleId) {
            return next(new AppError('Article ID is required', 400));
        }

        // Find the article and populate the reviewers field
        const article = await Journal.findById(articleId)
            .populate({
                path: 'reviewers',
                select: 'name _id anonymousName' // Select only the required fields
            });

        if (!article) {
            return next(new AppError('No article found with that ID', 404));
        }

         // Get the department from the article
         const department = article.department;

         // Find all reviewers from the same department
         const allReviewers = await User.find({ department, role: 'Reviewer' }, 'name _id anonymousName');
 
         res.status(200).json({
             status: 'success',
             data: {
                 reviewers: article.reviewers,
                 allReviewers
             }
         });

        res.status(200).json({
            status: 'success',
            data: {
                reviewers: article.reviewers
            }
        });
    } catch (error) {
        return next(new AppError(`Internal Server Error: ${error.message}`, 500));
    }
});

exports.acceptArticle = catchAsync(async (req, res, next) => {
    try {
        const { articleId } = req.params;

        // Find the article by ID and update its status to 'Accepted'
        const updatedArticle = await Article.findByIdAndUpdate(
            articleId,
            { status: 'Accepted' },
            { new: true, runValidators: true }
        );

        if (!updatedArticle) {
          return res.status(404).json({
                status: 'failed',
                data: "Article not found"
            });
        }

        res.status(200).json({
            status: 'success',
            data: "Article Updated Successfully"
        });
    } catch (error) {
        return next(new AppError(`Internal Server Error: ${error.message}`, 500));
    }
});