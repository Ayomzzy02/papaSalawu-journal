const Journal = require("../models/Journal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");


exports.getAllReviewersArticle = catchAsync(async (req, res, next) => {
    try {
        const userId = req.user.id; // Assuming req.user is populated with the authenticated user's details

        const articles = await Journal.find({ reviewers: userId }, 'title submissionDate status');

        if (!articles || articles.length === 0) {
            return res.status(404).json({
                status: 'success',
                message: 'No articles found for this reviewer',
            });
        }

        res.status(200).json({
            status: 'success',
            results: articles.length,
            data: {
                articles
            }
        });
    } catch (error) {
        return next(new AppError(`An unexpected server error occurred: ${error.message}`, 500));
    }
});