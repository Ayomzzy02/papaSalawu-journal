const Journal = require("../models/Journal");
const Payment = require("../models/Payment");
const Issue = require("../models/Issue");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { getArticleDocUrl } = require("../utils/getSignedImagesUrl")

exports.getUserArticles = catchAsync(async function (req, res, next) {
    const userId = req.user.id;
    const journals = await Journal.find({ author: userId });

    if (!journals || journals.length === 0) {
        return res.status(200).json({
            status: 'NOT FOUND',
            articles: journals
        });
    }

    return res.status(200).json({
        status: 'success',
        articles: journals
    });
});

exports.createArticle = catchAsync(async (req, res, next) => {
    try {
        const userId = req.user.id;

        const newJournal = new Journal({
            author: userId,
            title: req.body.title,
            abstract: req.body.abstract,
            keywords: req.body.keywords,
            department: req.body.department,
            versions: [{
                documentUrl: req.body.articleDoc, // Set the uploaded article document URL
                issueName: "Initial Upload" // You can change this if needed
            }],
        });

        const savedJournal = await newJournal.save();

        if (!savedJournal) {
            return next(new AppError("Invalid Journal Data", 400));
        }

        return res.status(201).json({
            status: "success",
            data: {
                message: "Journal Successfully Created",
                journal: savedJournal,
            },
        });
    } catch (error) {
        return next(new AppError(`An unexpected server error occurred: ${error.message}`, 500));
    }
});

exports.getArticlesByDepartment = catchAsync(async (req, res, next) => {
    try {
        const { department } = req.query;

        // Validate the department query parameter
        if (!department) {
            return res.status(400).json({
                status: 'fail',
                message: 'Department query parameter is required'
            });
        }

        // Fetch published journals for the specified department
        const journals = await Journal.find({
            department: department,
            status: 'Published'
        }).populate('author', 'name');

        // Process the journals to get the required fields and latest version
        const processedJournals = journals.map(journal => {
            const latestVersion = journal.versions.reduce((latest, current) => {
                return current.versionDate > latest.versionDate ? current : latest;
            });

            return {
                id: journal._id,
                title: journal.title,
                author: journal.author.name,
                abstract: journal.abstract,
                keywords: journal.keywords,
                publishedDate: journal.publishedDate,
                version: {
                    documentUrl: latestVersion.documentUrl,
                    versionDate: latestVersion.versionDate,
                    issueName: latestVersion.issueName
                }
            };
        });

        // Group the processed journals by year published
        const groupedByYear = processedJournals.reduce((acc, journal) => {
            const year = new Date(journal.publishedDate).getFullYear();
            if (!acc[year]) {
                acc[year] = [];
            }
            acc[year].push(journal);
            return acc;
        }, {});

        // Sort the years in descending order
        const sortedGroupedByYear = Object.keys(groupedByYear).sort((a, b) => b - a).reduce((acc, year) => {
            acc[year] = groupedByYear[year];
            return acc;
        }, {});

        // Return the response
        return res.status(200).json({
            status: 'success',
            data: sortedGroupedByYear
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

exports.getUserArticle = catchAsync(async (req, res, next) => {
    try {
        const { articleId } = req.query;

        // Validate the department query parameter
        if (!articleId) {
            return res.status(400).json({
                status: 'fail',
                message: 'ArticleId query parameter is required'
            });
        }

        // Fetch published journals for the specified department
        const journals = await Journal.findById(articleId).populate('author', 'name');

        // Return the response
        return res.status(200).json({
            status: 'success',
            data: journals
        });
    } catch (error) {
        return next(new AppError(`An unexpected server error occurred: ${error.message}`, 500));
    }
});

exports.getArticleHistory = catchAsync(async (req, res, next) => {
    try {
        const { articleId } = req.params;

        if (!articleId) {
            return next(new AppError('Article ID is required', 400));
        }

        // Fetch the article by ID
        const article = await Journal.findById(articleId).populate('versions.issueId');

        if (!article) {
            return next(new AppError('Article not found', 404));
        }

        // Prepare the history data
        const history = await Promise.all(article.versions.map(async version => {
            const historyData = {
                versionName: version.issueName,
                dateAdded: version.versionDate,
                documentUrl: version.documentUrl,
                reviewers: []
            };

            if (version.issueName !== "Initial Upload") {
                const issue = await Issue.findById(version.issueId).populate('reviewers', 'anonymousName');
                historyData.reviewers = issue.reviewers.map(reviewer => reviewer.anonymousName);
            }

            return historyData;
        }));

        res.status(200).json({
            status: 'success',
            data: history
        });
    } catch (error) {
        return next(new AppError(`An unexpected server error occurred: ${error.message}`, 500));
    }
});


exports.getArticle = catchAsync(async (req, res, next) => {
    try {
        const { articleId } = req.query;
        // Validate the articleId
        if (!articleId) {
            return res.status(400).json({
                status: 'fail',
                message: 'ArticleId query parameter is required'
            });
        }

        // Fetch the article from the database
        const article = await Journal.findById(articleId)
            .populate('author', 'name') // Assuming the User model has a 'name' field
            .exec();

        // Check if the article exists
        if (!article) {
            return res.status(404).json({
                status: 'fail',
                message: 'No Article Found with that QueryId'
            });
        }
        // Find the latest version document
        const latestVersion = article.versions.reduce((latest, version) => {
            return (latest.versionDate > version.versionDate) ? latest : version;
        });

        latestVersion.documentUrl = await getArticleDocUrl(latestVersion.documentUrl);

        // Construct the response object
        const articleDetails = {
            title: article.title,
            abstract: article.abstract,
            keywords: article.keywords,
            authorName: article.author.name,
            publishedDate: article.publishedDate,
            submissionDate: article.submissionDate,
            latestDocumentUrl: latestVersion.documentUrl,
        };

        // Send the response
        res.status(200).json({
            status: 'success',
            data: articleDetails
        });
    } catch (error) {
        return next(new AppError(`An unexpected server error occurred: ${error.message}`, 500));
    }
});

exports.makePayment = catchAsync(async (req, res, next) => {
    try {
        const userId = req.user.id
        const { articleId } = req.params

        const check = await Journal.findById(articleId).select('author')

        if(userId !== check.author.toString()){
            return res.status(400).json({
                status: 'fail',
                message: 'Error Creating Payment verifications'
            });
        }

        // Function to generate a random 10-digit number
        const generateTransactionId = () => {
            let transactionId = '';
            for (let i = 0; i < 10; i++) {
                transactionId += Math.floor(Math.random() * 10).toString();
            }
            return transactionId;
        };

        const transactionId = generateTransactionId();

        const makePayment = new Payment({
            transactionId: transactionId,
            receiptName: req.body.name,
            author: userId,
            article: articleId,
            receiptUrl: req.body.receiptUrl,
            status: 'Pending'
        });

        const newPayment = await makePayment.save();

        if (!newPayment) {
            return next(new AppError("Invalid Payment Data", 400));
        }

        return res.status(201).json({
            status: "success",
            data: {
                message: "Payment Successfully Created",
            },
        });
    } catch (error) {
        return next(new AppError(`An unexpected server error occurred: ${error.message}`, 500));
    }
});