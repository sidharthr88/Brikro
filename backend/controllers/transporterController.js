const Transporter = require("../models/Transporter");
const Order = require("../models/Order");
const User = require("../models/User");
const sendEmail = require("../config/email");
const Material = require("../models/Material");

const {
    generateOtp,
    hashOtp,
    OTP_EXPIRY_MINUTES,
    OTP_MAX_ATTEMPTS
} = require("../utils/otp");

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;

    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return R * c;
};


const isApprovedTransporter = (user) => {
  if (!user || !user.isActive) {
    return false;
  }

  if (user.transporterStatus) {
    return user.transporterStatus === "approved";
  }

  return (
    user.role === "transporter" &&
    user.approvalStatus === "approved"
  );
};


const createTransporterProfile = async (req, res) => {
    try {
        const {
            vehicleType,
            vehicleNumber,
            drivingLicenseNumber,
            rcNumber,
            aadhaarNumber,
            vehicleOwnerName,
            vehiclePhoto
        } = req.body;
      
        if (
            typeof vehicleType !== "string" ||
            !vehicleType.trim() ||
            typeof vehicleNumber !== "string" ||
            !vehicleNumber.trim() ||
            typeof drivingLicenseNumber !== "string" ||
            !drivingLicenseNumber.trim() ||
            typeof rcNumber !== "string" ||
            !rcNumber.trim() ||
            typeof aadhaarNumber !== "string" ||
            !/^\d{12}$/.test(aadhaarNumber.trim()) ||
            typeof vehicleOwnerName !== "string" ||
            !vehicleOwnerName.trim() ||
            typeof vehiclePhoto !== "string" ||
            !vehiclePhoto.trim()
        ) {
            return res.status(400).json({
                message: "Enter all required fields, including a vehicle photo. Aadhaar must contain 12 digits."
            });
        }


        const user = await User.findById(req.user.id);

        if (!user || !user.isActive) {
            return res.status(403).json({
                message: "Your account is unavailable"
            });
        }

        if (user.transporterStatus === "approved") {
            return res.status(400).json({
                message: "Your transporter application is already approved"
            });
        }

        if (user.transporterStatus === "pending") {
            return res.status(400).json({
                message: "Your transporter application is awaiting approval"
            });
        }

        const normalizedVehicleNumber =
            vehicleNumber.trim().toUpperCase();

        let transporter = await Transporter.findOne({
            user: user._id
        });

        const existingVehicle = await Transporter.findOne({
            vehicleNumber: normalizedVehicleNumber,
            user: { $ne: user._id }
        });

        if (existingVehicle) {
            return res.status(409).json({
                message: "Vehicle number already exists"
            });
        }

        const applicationDetails = {
            vehicleType: vehicleType.trim(),
            vehicleNumber: normalizedVehicleNumber,
            drivingLicenseNumber:
                drivingLicenseNumber.trim().toUpperCase(),
            rcNumber: rcNumber.trim().toUpperCase(),
            aadhaarNumber: aadhaarNumber.trim(),
            vehicleOwnerName: vehicleOwnerName.trim(),
            vehiclePhoto:
            typeof vehiclePhoto === "string"
                ? vehiclePhoto.trim()
                : ""
        };

        if (transporter) {
            Object.assign(transporter, applicationDetails);
            await transporter.save();
        } else {
            transporter = await Transporter.create({
                user: user._id,
                ...applicationDetails
            });
        }

        user.transporterStatus = "pending";
        user.transporterAdminRemark = "";

        if (user.role === "transporter") {
            user.approvalStatus = "pending";
        }

        await user.save();

        return res.status(201).json({
            message: "Transporter application submitted successfully",
            transporterStatus: user.transporterStatus
        });
    } catch (error) {
        console.error("CREATE TRANSPORTER PROFILE ERROR:", error);

        return res.status(500).json({
            message: "Failed to submit transporter application"
        });
    }
};

const getAvailableDeliveries = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        console.log("TRANSPORTER APPROVAL DEBUG:", {
            userId: req.user?.id,
            role: req.user?.role,
            transporterStatus: req.user?.transporterStatus,
            approvalStatus: req.user?.approvalStatus
        });
        if (!isApprovedTransporter(user)) {
            return res.status(403).json({
                message: "Your transporter application must be approved before accepting deliveries"
            });
        }

        const transporter = await Transporter.findOne({
            user: req.user.id
        });

        if (!transporter) {
            return res.status(404).json({
                message: "Transporter profile not found"
            });
        }

        if (!transporter.isAvailable) {
            return res.status(200).json({
                count: 0,
                deliveries: [],
                message: "You are currently assigned to a delivery"
            });
        }

        const transporterLat = transporter.currentLocation?.latitude;
        const transporterLon = transporter.currentLocation?.longitude;

        if (
            typeof transporterLat !== "number" ||
            typeof transporterLon !== "number"
        ) {
            return res.status(400).json({
                message: "Transporter location not available"
            });
        }

        const orders = await Order.find({
            transporter: null,
            status: "confirmed",
            paymentStatus: "paid",
            deliveryMethod: "transporter",
            "deliveryLocation.latitude": { $exists: true },
            "deliveryLocation.longitude": { $exists: true }
        })
            .populate("buyer", "name phone")
            .populate("material", "title category price images location")
            .sort({ createdAt: 1 });

        const deliveries = orders
            .filter((order) => {
                return (
                    order.buyer &&
                    order.material &&
                    typeof order.deliveryLocation?.latitude === "number" &&
                    typeof order.deliveryLocation?.longitude === "number"
                );
            })
            .map((order) => {
                const distance = calculateDistance(
                    transporterLat,
                    transporterLon,
                    order.deliveryLocation.latitude,
                    order.deliveryLocation.longitude
                );

                return {
                    ...order.toObject(),
                    distanceInKm: Number(distance.toFixed(2))
                };
            });

        return res.status(200).json({
            count: deliveries.length,
            deliveries
        });
    } catch (error) {
        console.error("GET AVAILABLE DELIVERIES ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch available deliveries"
        });
    }
};

const acceptDelivery = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!isApprovedTransporter(user)) {
            return res.status(403).json({
                message: "Your transporter application must be approved before accepting deliveries"
            });
        }

        const transporter = await Transporter.findOne({
            user: req.user.id
        });

        if (!transporter) {
            return res.status(404).json({
                message: "Transporter profile not found"
            });
        }

        if (!transporter.isAvailable) {
            return res.status(400).json({
                message: "Transporter is currently unavailable"
            });
        }

        const order = await Order.findOneAndUpdate(
            {
                _id: req.params.orderId,
                transporter: null,
                status: "confirmed",
                paymentStatus: "paid",
                deliveryMethod: "transporter",
                "deliveryLocation.latitude": { $exists: true },
                "deliveryLocation.longitude": { $exists: true }
            },
            {
                $set: {
                    transporter: transporter._id
                }
            },
            {
                new: true,
                runValidators: true
            }
        )
            .populate("buyer", "name phone")
            .populate("material", "title category price images location");

        if (!order) {
            const existingOrder = await Order.findById(
                req.params.orderId
            );

            if (!existingOrder) {
                return res.status(404).json({
                    message: "Order not found"
                });
            }

            return res.status(409).json({
                message: "This delivery is no longer available"
            });
        }

        const pickupOtp = generateOtp();
        if (process.env.NODE_ENV !== "production") {
        console.log("DEV PICKUP OTP:", pickupOtp);
}

        order.pickupOtpHash = hashOtp(pickupOtp);
        order.pickupOtpExpiresAt = new Date(
            Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
        );
        order.pickupOtpAttempts = 0;
        order.pickupVerifiedAt = null;

        order.deliveryOtpHash = null;
        order.deliveryOtpExpiresAt = null;
        order.deliveryOtpAttempts = 0;
        order.deliveryVerifiedAt = null;

        await order.save();

        transporter.isAvailable = false;
        await transporter.save();

        try {
            const material = await Material.findById(
                order.material._id || order.material
            );

            if (material) {
                const seller = await User.findById(material.seller);

                if (seller) {
                    await sendEmail(
                        seller.email,
                        "BRIKRO Pickup Verification OTP",
                        `
                            <h2>Pickup Verification</h2>
                            <p>Hello ${seller.name},</p>
                            <p>A transporter has accepted your order. Share this OTP with the assigned transporter when they arrive to collect the materials.</p>
                            <h2>${pickupOtp}</h2>
                            <p>This OTP expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
                            <p>Never share this OTP before the transporter arrives.</p>
                        `
                    );
                }
            }
        } catch (emailError) {
            console.error("PICKUP OTP EMAIL FAILED:", emailError);
        }

        return res.status(200).json({
            message: "Delivery accepted successfully. Pickup OTP sent to the seller.",
            order
        });
    } catch (error) {
        console.error("ACCEPT DELIVERY ERROR:", error);

        return res.status(500).json({
            message: "Failed to accept delivery"
        });
    }
};

const getMyDeliveries = async (req, res) => {
    try {
        const transporter = await Transporter.findOne({
            user: req.user.id
        });

        if (!transporter) {
            return res.status(404).json({
                message: "Transporter profile not found"
            });
        }

        const deliveries = await Order.find({
            transporter: transporter._id
        })
            .populate("buyer", "name phone")
            .populate("material", "title category price images location")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: deliveries.length,
            deliveries
        });
    } catch (error) {
        console.error("GET MY DELIVERIES ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch your deliveries"
        });
    }
};

const updateDeliveryStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!isApprovedTransporter(user)) {
            return res.status(403).json({
                message: "An active, approved transporter account is required"
            });
        }

        const transporter = await Transporter.findOne({
            user: req.user.id
        });

        if (!transporter) {
            return res.status(404).json({
                message: "Transporter profile not found"
            });
        }

        const { status } = req.body;

        if (status !== "in_transit") {
            return res.status(400).json({
                message: "Pickup and delivery must be verified using their OTP endpoints"
            });
        }

        const order = await Order.findOne({
            _id: req.params.orderId,
            transporter: transporter._id
        });

        if (!order) {
            return res.status(404).json({
                message: "Assigned delivery not found"
            });
        }

        if (
            order.status !== "picked_up" ||
            !order.pickupVerifiedAt
        ) {
            return res.status(400).json({
                message: "Pickup must be verified before transit"
            });
        }

        order.status = "in_transit";
        await order.save();

        return res.status(200).json({
            message: "Delivery is now in transit",
            order
        });
    } catch (error) {
        console.error("UPDATE DELIVERY STATUS ERROR:", error);

        return res.status(500).json({
            message: "Failed to update delivery status"
        });
    }
};

const verifyPickupOtp = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!isApprovedTransporter(user)) {
            return res.status(403).json({
                message: "An active, approved transporter account is required"
            });
        }

        const transporter = await Transporter.findOne({
            user: req.user.id
        });

        if (!transporter) {
            return res.status(404).json({
                message: "Transporter profile not found"
            });
        }

        const { otp } = req.body;

        if (!/^\d{6}$/.test(String(otp || ""))) {
            return res.status(400).json({
                message: "Enter a valid six-digit OTP"
            });
        }

        const order = await Order.findOne({
            _id: req.params.orderId,
            transporter: transporter._id
        }).select("+pickupOtpHash");

        if (!order) {
            return res.status(404).json({
                message: "Assigned delivery not found"
            });
        }

        if (order.status !== "confirmed" || order.pickupVerifiedAt) {
            return res.status(400).json({
                message: "This order is not awaiting pickup verification"
            });
        }

        if (
            !order.pickupOtpHash ||
            !order.pickupOtpExpiresAt ||
            order.pickupOtpExpiresAt <= new Date()
        ) {
            return res.status(400).json({
                message: "Pickup OTP has expired or is unavailable"
            });
        }

        if (order.pickupOtpAttempts >= OTP_MAX_ATTEMPTS) {
            return res.status(429).json({
                message: "Maximum OTP attempts reached"
            });
        }

        if (hashOtp(String(otp)) !== order.pickupOtpHash) {
            order.pickupOtpAttempts += 1;

            if (order.pickupOtpAttempts >= OTP_MAX_ATTEMPTS) {
                order.pickupOtpHash = null;
                order.pickupOtpExpiresAt = null;
            }

            await order.save();

            return res.status(400).json({
                message: "Incorrect pickup OTP",
                attemptsRemaining: Math.max(
                    0,
                    OTP_MAX_ATTEMPTS - order.pickupOtpAttempts
                )
            });
        }

        const deliveryOtp = generateOtp();

        order.pickupVerifiedAt = new Date();
        order.pickupOtpHash = null;
        order.pickupOtpExpiresAt = null;
        order.status = "picked_up";

        order.deliveryOtpHash = hashOtp(deliveryOtp);
        order.deliveryOtpExpiresAt = new Date(
            Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
        );
        order.deliveryOtpAttempts = 0;
        order.deliveryVerifiedAt = null;

        await order.save();

        try {
            const buyer = await User.findById(order.buyer);

            if (buyer) {
                await sendEmail(
                    buyer.email,
                    "BRIKRO Delivery Verification OTP",
                    `
                        <h2>Delivery Verification</h2>
                        <p>Hello ${buyer.name},</p>
                        <p>Your materials have been collected by the transporter.</p>
                        <p>Share this OTP with the assigned transporter only when your materials arrive.</p>
                        <h2>${deliveryOtp}</h2>
                        <p>This OTP expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
                    `
                );
            }
        } catch (emailError) {
            console.error("DELIVERY OTP EMAIL FAILED:", emailError);
        }

        return res.status(200).json({
            message: "Pickup verified successfully. Delivery OTP generated.",
            order
        });
    } catch (error) {
        console.error("VERIFY PICKUP OTP ERROR:", error);

        return res.status(500).json({
            message: "Failed to verify pickup OTP"
        });
    }
};

const verifyDeliveryOtp = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!isApprovedTransporter(user)) {
            return res.status(403).json({
                message: "An active, approved transporter account is required"
            });
        }

        const transporter = await Transporter.findOne({
            user: req.user.id
        });

        if (!transporter) {
            return res.status(404).json({
                message: "Transporter profile not found"
            });
        }

        const { otp } = req.body;

        if (!/^\d{6}$/.test(String(otp || ""))) {
            return res.status(400).json({
                message: "Enter a valid six-digit OTP"
            });
        }

        const order = await Order.findOne({
            _id: req.params.orderId,
            transporter: transporter._id
        }).select("+deliveryOtpHash");

        if (!order) {
            return res.status(404).json({
                message: "Assigned delivery not found"
            });
        }

        if (
            order.status !== "in_transit" ||
            !order.pickupVerifiedAt ||
            order.deliveryVerifiedAt
        ) {
            return res.status(400).json({
                message: "This order is not awaiting delivery verification"
            });
        }

        if (
            !order.deliveryOtpHash ||
            !order.deliveryOtpExpiresAt ||
            order.deliveryOtpExpiresAt <= new Date()
        ) {
            return res.status(400).json({
                message: "Delivery OTP has expired or is unavailable"
            });
        }

        if (order.deliveryOtpAttempts >= OTP_MAX_ATTEMPTS) {
            return res.status(429).json({
                message: "Maximum OTP attempts reached"
            });
        }

        if (hashOtp(String(otp)) !== order.deliveryOtpHash) {
            order.deliveryOtpAttempts += 1;

            if (order.deliveryOtpAttempts >= OTP_MAX_ATTEMPTS) {
                order.deliveryOtpHash = null;
                order.deliveryOtpExpiresAt = null;
            }

            await order.save();

            return res.status(400).json({
                message: "Incorrect delivery OTP",
                attemptsRemaining: Math.max(
                    0,
                    OTP_MAX_ATTEMPTS - order.deliveryOtpAttempts
                )
            });
        }

        order.deliveryVerifiedAt = new Date();
        order.deliveryOtpHash = null;
        order.deliveryOtpExpiresAt = null;
        order.status = "delivered";

        await order.save();

        transporter.isAvailable = true;
        await transporter.save();

        try {
            const buyer = await User.findById(order.buyer);

            if (buyer) {
                await sendEmail(
                    buyer.email,
                    "BRIKRO Delivery Completed",
                    `
                        <h2>Delivery Completed</h2>
                        <p>Hello ${buyer.name},</p>
                        <p>Your construction materials have been delivered successfully.</p>
                        <p>Thank you for using BRIKRO.</p>
                    `
                );
            }
        } catch (emailError) {
            console.error("DELIVERY CONFIRMATION EMAIL FAILED:", emailError);
        }

        return res.status(200).json({
            message: "Delivery OTP verified. Order marked as delivered.",
            order
        });
    } catch (error) {
        console.error("VERIFY DELIVERY OTP ERROR:", error);

        return res.status(500).json({
            message: "Failed to verify delivery OTP"
        });
    }
};

const resendPickupOtp = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!isApprovedTransporter(user)) {
            return res.status(403).json({
                message: "An active, approved transporter account is required"
            });
        }

        const transporter = await Transporter.findOne({
            user: req.user.id
        });

        if (!transporter) {
            return res.status(404).json({
                message: "Transporter profile not found"
            });
        }

        const order = await Order.findOne({
            _id: req.params.orderId,
            transporter: transporter._id,
            status: "confirmed",
            pickupVerifiedAt: null
        });

        if (!order) {
            return res.status(404).json({
                message: "Assigned delivery awaiting pickup was not found"
            });
        }

        const material = await Material.findById(order.material);

        if (!material) {
            return res.status(404).json({
                message: "Material listing not found"
            });
        }

        const seller = await User.findById(material.seller);

        if (!seller) {
            return res.status(404).json({
                message: "Seller account not found"
            });
        }

        const pickupOtp = generateOtp();

        order.pickupOtpHash = hashOtp(pickupOtp);
        order.pickupOtpExpiresAt = new Date(
            Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
        );
        order.pickupOtpAttempts = 0;

        await order.save();

        await sendEmail(
            seller.email,
            "BRIKRO New Pickup Verification OTP",
            `
                <h2>Pickup Verification</h2>
                <p>Hello ${seller.name},</p>
                <p>A fresh pickup OTP has been requested for your assigned delivery.</p>
                <h2>${pickupOtp}</h2>
                <p>This OTP expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
                <p>Share it only with the assigned transporter when they arrive.</p>
            `
        );

        return res.status(200).json({
            message: "A fresh pickup OTP has been sent to the seller."
        });
    } catch (error) {
        console.error("RESEND PICKUP OTP ERROR:", error);

        return res.status(500).json({
            message: "Could not resend pickup OTP. Check the server logs."
        });
    }
};

const cancelDelivery = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!isApprovedTransporter(user)) {
            return res.status(403).json({
                message: "An active, approved transporter account is required"
            });
        }

        const transporter = await Transporter.findOne({
            user: req.user.id
        });

        if (!transporter) {
            return res.status(404).json({
                message: "Transporter profile not found"
            });
        }

        const order = await Order.findOneAndUpdate(
            {
                _id: req.params.orderId,
                transporter: transporter._id,
                status: "confirmed",
                pickupVerifiedAt: null
            },
            {
                $set: {
                    transporter: null,
                    pickupOtpHash: null,
                    pickupOtpExpiresAt: null,
                    pickupOtpAttempts: 0
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!order) {
            return res.status(409).json({
                message: "Delivery cannot be cancelled. It may already be picked up or no longer assigned to you."
            });
        }

        transporter.isAvailable = true;
        await transporter.save();

        return res.status(200).json({
            message: "Delivery cancelled successfully. It is available for another transporter.",
            order
        });
    } catch (error) {
        console.error("CANCEL DELIVERY ERROR:", error);

        return res.status(500).json({
            message: "Failed to cancel delivery"
        });
    }
};

const updateTransporterLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;

        if (
            typeof latitude !== "number" ||
            latitude < -90 ||
            latitude > 90
        ) {
            return res.status(400).json({
                message: "Latitude must be a number between -90 and 90"
            });
        }

        if (
            typeof longitude !== "number" ||
            longitude < -180 ||
            longitude > 180
        ) {
            return res.status(400).json({
                message: "Longitude must be a number between -180 and 180"
            });
        }

        const transporter = await Transporter.findOne({
            user: req.user.id
        });

        if (!transporter) {
            return res.status(404).json({
                message: "Transporter profile not found"
            });
        }

        transporter.currentLocation = {
            latitude,
            longitude
        };

        await transporter.save();

        return res.status(200).json({
            message: "Transporter location updated successfully",
            currentLocation: transporter.currentLocation
        });
    } catch (error) {
        console.error("UPDATE TRANSPORTER LOCATION ERROR:", error);

        return res.status(500).json({
            message: "Failed to update transporter location"
        });
    }
};

module.exports = {createTransporterProfile,getAvailableDeliveries,acceptDelivery,getMyDeliveries,updateDeliveryStatus,verifyPickupOtp,verifyDeliveryOtp,resendPickupOtp,cancelDelivery,updateTransporterLocation};
