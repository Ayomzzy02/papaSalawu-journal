// routes/journalRoutes.js
const express = require('express');
const {  getAllIssues, createIssue } = require('../controllers/issueControllers');
const router = express.Router();
const { authenticate } = require("../middleware/auth");


router.use(authenticate);

router.get('/getAllIssues/:articleId', getAllIssues);
router.post('/createIssue/:articleId', createIssue);

module.exports = router;