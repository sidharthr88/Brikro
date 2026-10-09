const express = require("express");
const {createOrder, getMyOrders, getSellerOrders, getOrderById, cancelOrder, updateOrderStatus, calculateTransportFee } = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/", authMiddleware, createOrder);
router.get("/myorders", authMiddleware, getMyOrders);
router.get("/sellerorders", authMiddleware, getSellerOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/cancel", authMiddleware, cancelOrder);
router.put("/:id/status", authMiddleware, updateOrderStatus);
router.post("/calculate-transport-fee", authMiddleware, calculateTransportFee);

module.exports = router;