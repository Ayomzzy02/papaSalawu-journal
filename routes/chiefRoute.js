// routes/journalRoutes.js
const express = require('express');
const { getUserArticles } = require('../controllers/chiefControllers');
const router = express.Router();
const { authenticate } = require("../middleware/auth");


router.use(authenticate);

router.get('/getUserArticles', getUserArticles);



module.exports = router;
