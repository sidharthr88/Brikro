const express = require("express");

const {getAllUsers, getAllMaterials, getAllOrders, getAllTransporters, getDashboardStats, updateUserStatus, updateApprovalStatus, reviewMaterial, deleteMaterial, createTransporter} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/stats", authMiddleware, adminMiddleware, getDashboardStats);
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.put("/users/:id/status", authMiddleware, adminMiddleware, updateUserStatus);
router.get("/materials", authMiddleware, adminMiddleware, getAllMaterials);
router.get("/orders", authMiddleware, adminMiddleware, getAllOrders);
router.get("/transporters", authMiddleware, adminMiddleware, getAllTransporters);
router.post("/transporters", authMiddleware, adminMiddleware, createTransporter);
router.delete("/materials/:id", authMiddleware, adminMiddleware, deleteMaterial);
router.put("/users/:id/approval", authMiddleware, adminMiddleware, updateApprovalStatus);
router.put("/materials/:id/review",authMiddleware,adminMiddleware,reviewMaterial);
module.exports = router;