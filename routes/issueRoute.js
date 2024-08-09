// routes/journalRoutes.js
const express = require('express');
const {  getAllIssues, createIssue, openIssue, getConversations, addConversations } = require('../controllers/issueControllers');
const router = express.Router();
const { authenticate } = require("../middleware/auth");


router.use(authenticate);

router.get('/getAllIssues/:articleId', getAllIssues);
router.post('/createIssue/:articleId', createIssue);
router.get('/openIssue/:issueId', getConversations);
router.get('/getConversations/:issueId', getConversations);
router.post('/addComment/:issueId', addConversations);

module.exports = router;