const express = require("express");
const {createTransporterProfile, getAvailableDeliveries, acceptDelivery, getMyDeliveries, updateDeliveryStatus,updateTransporterLocation} = require("../controllers/transporterController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/profile", authMiddleware, createTransporterProfile);
router.get("/available", authMiddleware, getAvailableDeliveries);
router.post("/accept/:orderId", authMiddleware, acceptDelivery);
router.get("/my-deliveries", authMiddleware, getMyDeliveries);
router.put("/delivery/:orderId/status",authMiddleware, updateDeliveryStatus);
router.put("/location", authMiddleware, updateTransporterLocation);


module.exports = router;