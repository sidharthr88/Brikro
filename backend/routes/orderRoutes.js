const express = require("express");
const {createOrder, getMyOrders, getOrderById, cancelOrder, updateOrderStatus} = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.post("/", authMiddleware, createOrder);
router.get("/myorders", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/cancel", authMiddleware, cancelOrder);
router.put("/:id/status", authMiddleware, updateOrderStatus);

module.exports = router;