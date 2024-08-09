const Issue = require("../models/Issue");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { formatDistanceToNow } = require('date-fns');


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

        // Initialize the response data
        const response = {
            openIssuesCount: 0,
            closedIssuesCount: 0,
            issues: []
        };

        // Format the response data
        response.issues = issues.map(issue => {
            const openStatus = issue.status === 'Opened';
            if (openStatus) {
                response.openIssuesCount += 1;
            } else {
                response.closedIssuesCount += 1;
            }
            return {
                issueId: issue._id,
                title: issue.title,
                status: issue.status,
                openedBy: issue.openedBy ? issue.openedBy.anonymousName : 'Unknown',
                timeSinceOpened: formatDistanceToNow(new Date(issue.time), { addSuffix: true }),
                conversationCount: issue.conversations.length
            };
        });

        return res.status(200).json({
            status: "success",
            data: response
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


exports.createIssue = catchAsync(async function (req, res, next) {
    try {
        const { articleId } = req.params;
        const { title, description } = req.body; 
        const userId = req.user.id;

        // Create the new issue
        const newIssue = new Issue({
            title: title,
            description: description,
            articleId: articleId,
            openedBy: userId,
            status: 'Opened',
            conversations: [],
            reviewers: [userId]
        });

        await newIssue.save();

        res.status(201).json({
            status: 'success',
            data: {
                issue: newIssue
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


exports.getConversations = catchAsync(async function (req, res, next) {
    try {
        const { issueId } = req.params;

        // Find the issue by ID and populate the necessary fields
        const issue = await Issue.findById(issueId)
            .populate('conversations.userId', 'anonymousName')
            .populate('openedBy', 'anonymousName');

        if (!issue) {
            return res.status(200).json({ message: 'Issue not found' });
        }

        // Extract conversations and format them
        const conversations = issue.conversations.map(conversation => ({
            anonymousName: conversation.userId.anonymousName,
            content: conversation.message.contentText,
            fileUrl: conversation.message.contentFileUrl || null,
            timeSince: formatDistanceToNow(new Date(conversation.time), { addSuffix: true })
        }));

        // Prepare the response data
        const responseData = {
            title: issue.title,
            description: issue.description,
            openedBy: issue.openedBy.anonymousName,
            timeSinceOpened: formatDistanceToNow(new Date(issue.time), { addSuffix: true }),
            conversations
        };

        res.status(200).json({ data: responseData });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


exports.addConversations = catchAsync(async function (req, res, next) {
    try {
        const { issueId } = req.params;
        const { content } = req.body;

        const userId = req.user.id; // Assuming you have user authentication and can get the user ID

        if (!content) {
            return res.status(400).json({ message: 'Content is required' });
        }

        // Create a new conversation object
        const newConversation = {
            userId,
            message: {
                contentText: content,
                contentFileUrl: req.file ? `/uploads/${req.file.filename}` : null
            },
            time: new Date()
        };

         // Find the issue by ID
         const issue = await Issue.findById(issueId);
         if (!issue) {
             return res.status(404).json({ message: 'Issue not found' });
         }
 
         // Add userId to reviewers array if not already present
         if (!issue.reviewers.includes(userId)) {
             issue.reviewers.push(userId);
         }
 
         // Add the new conversation to the conversations array
         issue.conversations.push(newConversation);
         await issue.save();
 
         res.status(200).json({ message: 'Conversation added successfully', data: newConversation });
       
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
