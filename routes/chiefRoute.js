// routes/journalRoutes.js
const express = require('express');
const { getUserArticles, addReviewer, getReviewers, acceptArticle } = require('../controllers/chiefControllers');
const router = express.Router();
const { authenticate } = require("../middleware/auth");


router.use(authenticate);

router.get('/getUserArticles', getUserArticles);
router.post('/addReviwer/:articleId', addReviewer);
router.get('/getArticleReviwers/:articleId', getReviewers);
router.patch("/acceptArticle/:articleId", acceptArticle)


module.exports = router;
