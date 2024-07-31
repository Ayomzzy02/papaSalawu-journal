// routes/journalRoutes.js
const express = require('express');
const {  getAllIssues } = require('../controllers/issueControllers');
const router = express.Router();
const { authenticate } = require("../middleware/auth");


router.use(authenticate);

router.get('/getAllIssues/:articleId', getAllIssues);

module.exports = router;