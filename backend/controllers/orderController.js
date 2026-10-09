const Order = require("../models/Order");
const Material = require("../models/Material");
const sendEmail = require("../config/email");
const User = require("../models/User");

const calculateTransportCharge = (category, quantity) => {
    const heavyMaterials = ["Steel", "Pipes", "Wood"];

    if (heavyMaterials.includes(category)) {
        if (quantity <= 5) {
            return 250;
        }

        return 250 + Math.ceil((quantity - 5) / 5) * 250;
    }

    if (quantity <= 4) {
        return 100;
    }

    if (quantity <= 10) {
        return 150;
    }

    if (quantity <= 20) {
        return 250;
    }

    if (quantity <= 30) {
        return 350;
    }

    if (quantity <= 50) {
        return 500;
    }

    return 500 + Math.ceil((quantity - 50) / 10) * 150;
};

const createOrder = async (req, res) => {
    try {
        const {
            materialId,
            quantity,
            deliveryAddress,
            deliveryMethod,
            deliveryLocation
        } = req.body;

        if (!materialId || quantity === undefined) {
            return res.status(400).json({
                message: "Material and quantity are required"
            });
        }

    if (!["transporter", "self_pickup"].includes(deliveryMethod)) {
        return res.status(400).json({
            message: "Please select a valid delivery method"
        });
    }

    if (deliveryMethod === "transporter") {
        if (!deliveryAddress || !deliveryAddress.trim()) {
            return res.status(400).json({
                message: "Delivery address is required for transporter delivery"
            });
        }

    if (
        !deliveryLocation ||
        typeof deliveryLocation.latitude !== "number" ||
        typeof deliveryLocation.longitude !== "number"
    ) {
        return res.status(400).json({
            message: "Delivery location coordinates are required for transporter delivery"
        });
    }
}


        if (
            deliveryLocation &&
            (
                typeof deliveryLocation.latitude !== "number" ||
                typeof deliveryLocation.longitude !== "number"
            )
        ) {
            return res.status(400).json({
                message: "Latitude and longitude must be numbers"
            });
        }

        const material = await Material.findById(materialId);

        if (!material) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        if (material.seller.toString() === req.user.id) {
            return res.status(403).json({
                message: "You cannot buy your own listing"
            });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be a positive whole number"
            });
        }

        if (quantity > material.quantity) {
            return res.status(400).json({
                message: "Requested quantity is not available"
            });
        }

        const materialAmount = material.price * quantity;

        let transportFee = 0;

        if (deliveryMethod === "transporter") {
            transportFee = calculateTransportCharge(
                material.category,
                quantity
            );
        }

        const totalAmount = materialAmount + transportFee;

        const order = await Order.create({
            buyer: req.user.id,
            material: material._id,
            quantity,
            totalAmount,
            transportFee,
            deliveryAddress,
            deliveryLocation,
            deliveryMethod
        });

        return res.status(201).json({
            message: "Order created successfully",
            order
        });

    } catch (error) {
        console.log("CREATE ORDER ERROR:", error);

        return res.status(500).json({
            message: "Failed to create order",
            error: error.message
        });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            buyer: req.user.id
        }).populate("material", "title price category location");

        return res.status(200).json({
            orders
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message
        });
    }
};

const getSellerOrders = async (req, res) => {
    try {
        const materials = await Material.find({
            seller: req.user.id
        });

        const materialIds = materials.map(material => material._id);

        const orders = await Order.find({
            material: { $in: materialIds }
        })
            .populate("buyer", "name email phone")
            .populate("material", "title price category location");

        return res.status(200).json({
            orders
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch seller orders",
            error: error.message
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("material", "title price category location");

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.buyer.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only view your own order"
            });
        }

        return res.status(200).json({
            order
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch order",
            error: error.message
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.buyer.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only cancel your own order"
            });
        }

        if (order.status === "delivered" || order.status === "cancelled") {
            return res.status(400).json({
                message: "This order cannot be cancelled"
            });
        }

        if (order.paymentStatus === "paid") {
            const material = await Material.findById(order.material);

            if (!material) {
                return res.status(404).json({
                    message: "Material not found"
                });
            }

            material.quantity += order.quantity;
            await material.save();
        }

        order.status = "cancelled";
        await order.save();

        return res.status(200).json({
            message: "Order cancelled successfully",
            order
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to cancel order",
            error: error.message
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const material = await Material.findById(order.material);

        if (!material) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        if (material.seller.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You are not allowed to update this order"
            });
        }

        const validTransitions = {
            pending: ["confirmed", "cancelled"],
            confirmed: ["picked_up", "delivered", "cancelled"],
            picked_up: ["in_transit"],
            in_transit: ["delivered"],
            delivered: [],
            cancelled: []
        };

        if (
            !validTransitions[order.status] ||
            !validTransitions[order.status].includes(status)
        ) {
            return res.status(400).json({
                message: `Cannot change order status from ${order.status} to ${status}`
            });
        }

        order.status = status;

        await order.save();

        const buyer = await User.findById(order.buyer);

        if (buyer) {
            await sendEmail(
                buyer.email,
                `BRIKRO Order ${status}`,
                `
                    <h2>Order Status Updated</h2>
                    <p>Hello ${buyer.name},</p>
                    <p>Your order status has been updated to <strong>${status}</strong>.</p>
                    <p>You can log in to BRIKRO to view your order details.</p>
                    <p>Smart Supplies. Smart Savings. Smarter Sites.</p>
                `
            );
        }

        return res.status(200).json({
            message: "Order status updated successfully",
            order
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to update order status",
            error: error.message
        });
    }
};

const calculateTransportFee = async (req, res) => {
    try {
        const { materialId, quantity } = req.body;

        if (!materialId || quantity === undefined) {
            return res.status(400).json({
                message: "Material and quantity are required"
            });
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            return res.status(400).json({
                message: "Quantity must be a positive whole number"
            });
        }

        const material = await Material.findById(materialId);

        if (!material) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        if (quantity > material.quantity) {
            return res.status(400).json({
                message: "Requested quantity is not available"
            });
        }

        const transportFee = calculateTransportCharge(
            material.category,
            quantity
        );

        return res.status(200).json({
            category: material.category,
            quantity,
            transportFee
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to calculate transport fee",
            error: error.message
        });
    }
};

module.exports = {createOrder,getMyOrders,getSellerOrders,getOrderById,cancelOrder,updateOrderStatus,calculateTransportFee};