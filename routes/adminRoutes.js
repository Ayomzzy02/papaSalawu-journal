const express = require('express');
const router = express.Router();

const {
    addChiefEditor,
    verifyPayment,
    getPayments,
    addReviewer 
} = require("../controllers/adminControllers")

router.post("/addChiefEditor", addChiefEditor);
router.post("/addReviewer", addReviewer );
router.post("/verifyPayment/:transactionId", verifyPayment);

router.get("/getPayments", getPayments)

module.exports = router