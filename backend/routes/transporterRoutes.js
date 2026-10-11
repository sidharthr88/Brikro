const express = require("express");
const {createTransporterProfile, getAvailableDeliveries, acceptDelivery, getMyDeliveries, updateDeliveryStatus, verifyPickupOtp, verifyDeliveryOtp, resendPickupOtp,cancelDelivery, updateTransporterLocation} = require("../controllers/transporterController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/profile", authMiddleware, createTransporterProfile);
router.get("/available", authMiddleware, getAvailableDeliveries);
router.post("/accept/:orderId", authMiddleware, acceptDelivery);
router.get("/my-deliveries", authMiddleware, getMyDeliveries);
router.put("/delivery/:orderId/verify-pickup", authMiddleware, verifyPickupOtp);
router.put("/delivery/:orderId/verify-delivery", authMiddleware, verifyDeliveryOtp);
router.put("/delivery/:orderId/status",authMiddleware, updateDeliveryStatus);
router.put("/location", authMiddleware, updateTransporterLocation);
router.post("/delivery/:orderId/resend-pickup-otp", authMiddleware, resendPickupOtp);
router.put("/delivery/:orderId/cancel", authMiddleware, cancelDelivery);

module.exports = router;