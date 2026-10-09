const Transporter = require("../models/Transporter");
const Order = require("../models/Order");

// Calculate distance between two coordinates using the Haversine formula
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

const createTransporterProfile = async (req, res) => {
    try {
        const {
            vehicleType,
            vehicleNumber,
            latitude,
            longitude
        } = req.body;

        if (
            !vehicleType ||
            typeof vehicleType !== "string" ||
            !vehicleNumber ||
            typeof vehicleNumber !== "string"
        ) {
            return res.status(400).json({
                message: "Vehicle type and vehicle number are required"
            });
        }

        if (
            latitude !== undefined &&
            (typeof latitude !== "number" ||
                latitude < -90 ||
                latitude > 90)
        ) {
            return res.status(400).json({
                message: "Latitude must be a number between -90 and 90"
            });
        }

        if (
            longitude !== undefined &&
            (typeof longitude !== "number" ||
                longitude < -180 ||
                longitude > 180)
        ) {
            return res.status(400).json({
                message: "Longitude must be a number between -180 and 180"
            });
        }

        const existingTransporter = await Transporter.findOne({
            user: req.user.id
        });

        if (existingTransporter) {
            return res.status(400).json({
                message: "Transporter profile already exists"
            });
        }

        const transporter = await Transporter.create({
            user: req.user.id,
            vehicleType: vehicleType.trim(),
            vehicleNumber: vehicleNumber.trim().toUpperCase(),
            currentLocation: {
                latitude,
                longitude
            }
        });

        return res.status(201).json({
            message: "Transporter profile created successfully",
            transporter
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "This vehicle number is already registered"
            });
        }

        console.error("CREATE TRANSPORTER PROFILE ERROR:", error);

        return res.status(500).json({
            message: "Failed to create transporter profile"
        });
    }
};

const getAvailableDeliveries = async (req, res) => {
    try {
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
            .populate("material", "title category price images");

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

      
        transporter.isAvailable = false;
        await transporter.save();

        return res.status(200).json({
            message: "Delivery accepted successfully",
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
            .populate("material", "title category price images")
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
        const transporter = await Transporter.findOne({
            user: req.user.id
        });

        if (!transporter) {
            return res.status(404).json({
                message: "Transporter profile not found"
            });
        }

        const { status } = req.body;

        const validTransitions = {
            confirmed: ["picked_up"],
            picked_up: ["in_transit"],
            in_transit: ["delivered"],
            delivered: [],
            cancelled: []
        };

        if (
            !status ||
            !["picked_up", "in_transit", "delivered"].includes(status)
        ) {
            return res.status(400).json({
                message: "Please provide a valid delivery status"
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
            !validTransitions[order.status] ||
            !validTransitions[order.status].includes(status)
        ) {
            return res.status(400).json({
                message: `Cannot change status from ${order.status} to ${status}`
            });
        }

        order.status = status;
        await order.save();

        if (status === "delivered") {
            transporter.isAvailable = true;
            await transporter.save();
        }

        return res.status(200).json({
            message: "Delivery status updated successfully",
            order
        });

    } catch (error) {
        console.error("UPDATE DELIVERY STATUS ERROR:", error);

        return res.status(500).json({
            message: "Failed to update delivery status"
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


module.exports = {createTransporterProfile, getAvailableDeliveries, acceptDelivery, getMyDeliveries, updateDeliveryStatus, updateTransporterLocation};

