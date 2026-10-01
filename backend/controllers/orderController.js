const Order = require("../models/Order");
const Material = require("../models/Material");

const createOrder = async (req, res) => {
    try {
        const {
            materialId,
            quantity,
            deliveryAddress
        } = req.body;

        if (!materialId || !quantity || !deliveryAddress) {
            return res.status(400).json({
                message: "Material, quantity and delivery address are required"
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

        const totalAmount = material.price * quantity;

        const order = await Order.create({
            buyer: req.user.id,
            material: material._id,
            quantity,
            totalAmount,
            deliveryAddress
        });

        return res.status(201).json({
            message: "Order created successfully",
            order
        });

    } catch (error) {
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

        if (order.status !== "pending") {
            return res.status(400).json({
                message: "Only pending orders can be cancelled"
            });
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
        const {status} = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const allowedStatuses = [
            "pending",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid order status"
            });
        }

        order.status = status;

        await order.save();

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

module.exports = {createOrder, getMyOrders, getOrderById, cancelOrder, updateOrderStatus};