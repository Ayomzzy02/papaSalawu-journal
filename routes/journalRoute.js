// routes/journalRoutes.js
const express = require('express');
const { getUserArticles, createArticle, getArticlesByDepartment, getArticle } = require('../controllers/journalControllers');
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { upload } = require("../services/multer");
const uploadArticleDoc = require("../middleware/uploadArticleDoc");

router.get('/departmentArticles', getArticlesByDepartment);
router.get('/article', getArticle);

router.use(authenticate);

router.get('/getUserArticles', getUserArticles);


router.post(
    "/createArticle",
    upload.single('articleDoc'), // Single file upload with field name 'articleDoc'
    uploadArticleDoc,
    createArticle
);

module.exports = router;
