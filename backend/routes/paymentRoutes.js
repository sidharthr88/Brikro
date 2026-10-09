const express = require("express");
const {createPaymentOrder, verifyPayment} = require("../controllers/paymentController") ;
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/create/:orderId", authMiddleware, createPaymentOrder);
router.post("/verify/:orderId", authMiddleware, verifyPayment);

module.exports = router;