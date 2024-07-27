const express = require('express');
const router = express.Router();

const {
    addChiefEditor
} = require("../controllers/adminControllers")

router.post("/addChiefEditor", addChiefEditor)

module.exports = router