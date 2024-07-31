// routes/journalRoutes.js
const express = require('express');
const { getUserArticles, createArticle, getArticlesByDepartment, getArticle, makePayment, getUserArticle, getArticleHistory } = require('../controllers/journalControllers');
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { upload } = require("../services/multer");
const uploadArticleDoc = require("../middleware/uploadArticleDoc");
const uploadPaymentReceipt = require("../middleware/uploadPaymentReceipt");

router.get('/departmentArticles', getArticlesByDepartment);
router.get('/article', getArticle);

router.use(authenticate);

router.get('/getUserArticles', getUserArticles);
router.get('/getUserArticle', getUserArticle);
router.get('/history/:articleId', getArticleHistory)

router.post(
    "/createArticle",
    upload.single('articleDoc'), // Single file upload with field name 'articleDoc'
    uploadArticleDoc,
    createArticle
);


router.post(
    "/payment/:articleId",
    upload.single('receipt'), // Single file upload with field name 'receipt'
    uploadPaymentReceipt,
    makePayment
);


module.exports = router;
