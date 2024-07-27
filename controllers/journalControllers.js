const Journal = require("../models/Journal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

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

exports.getArticle = catchAsync(async (req, res, next) => {
    try {
        const { articleId } = req.query;
        
    } catch (error) {

    }
});