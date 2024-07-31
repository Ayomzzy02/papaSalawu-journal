const Issue = require("../models/Issue");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllIssues = catchAsync(async function (req, res, next) {
    try {
        // Check the user's role
        const userRole = req.user.role;
        if (!['Author', 'Reviewer', 'Chief-Editor'].includes(userRole)) {
            return res.status(403).json({
                status: 'fail',
                message: 'Forbidden'
            });
        }

        // Get the article ID from the request parameters
        const { articleId } = req.params;

        // Find the issues related to the article ID
        const issues = await Issue.find({ articleId }).populate('openedBy', 'anonymousName');

        // Check if there are no issues
        if (issues.length === 0) {
            return res.status(200).json({
                status: "success",
                data: {
                    openIssuesCount: 0,
                    closedIssuesCount: 0,
                    issues: []
                }
            });
        }

        // Format the response data
        const response = {
            openIssuesCount: 0,
            closedIssuesCount: 0,
            issues: issues.map(issue => {
                const openStatus = issue.status === 'Opened';
                if (openStatus) {
                    response.openIssuesCount += 1;
                } else {
                    response.closedIssuesCount += 1;
                }
                return {
                    title: issue.title,
                    status: issue.status,
                    openedBy: issue.openedBy ? issue.openedBy.anonymousName : 'Unknown',
                    timeSinceOpened: formatDistanceToNow(new Date(issue.time), { addSuffix: true }),
                    conversationCount: issue.conversations.length
                };
            })
        };

        return res.status(200).json({
            status: "success",
            data: response
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});