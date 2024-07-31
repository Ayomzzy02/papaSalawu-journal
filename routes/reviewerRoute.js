// routes/journalRoutes.js
const express = require('express');
const { getAllReviewersArticle } = require('../controllers/reviewerControllers');
const router = express.Router();
const { authenticate } = require("../middleware/auth");


router.use(authenticate);

router.get('/getAllReviewersArticle', getAllReviewersArticle);


module.exports = router;
