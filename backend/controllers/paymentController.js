const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const Material = require("../models/Material");
const User = require("../models/User");
const sendEmail = require("../config/email");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createPaymentOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.buyer.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only pay for your own order"
            });
        }

        if (order.status === "cancelled") {
            return res.status(400).json({
                message: "Cannot pay for a cancelled order"
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                message: "Order is already paid"
            });
        }

            const materialAmount = Math.round(
                order.totalAmount - order.transportFee
            );

            if (materialAmount <= 0) {
                return res.status(400).json({
                    message: "Invalid material payment amount"
                });
            }

            const razorpayOrder = await razorpay.orders.create({
                amount: materialAmount * 100,
                currency: "INR",
                receipt: order._id.toString()
            });



        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.status(201).json({
            message: "Razorpay order created successfully",
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            brikroOrderId: order._id
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to create payment order",
            error: error.message
        });
    }
};

const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return res.status(400).json({
                message: "Payment verification details are required"
            });
        }

        const order = await Order.findById(req.params.orderId)
            .populate("material");

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.buyer.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only verify your own payment"
            });
        }

        if (order.paymentStatus === "paid") {
            return res.status(400).json({
                message: "Order is already paid"
            });
        }

        if (order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({
                message: "Razorpay order does not match"
            });
        }

        const generatedSignature = crypto
            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                razorpay_order_id + "|" + razorpay_payment_id
            )
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Invalid payment signature"
            });
        }

            
        const updatedMaterial = await Material.findOneAndUpdate(
            {
                _id: order.material._id,
                quantity: { $gte: order.quantity }
            },
            {
                $inc: { quantity: -order.quantity }
            },
            {
                new: true
            }
        );

        if (!updatedMaterial) {
            return res.status(400).json({
                message: "Insufficient stock"
            });
        }

        order.paymentStatus = "paid";
        order.status = "confirmed";
        await order.save();

        res.status(200).json({
            message: "Payment verified successfully",
            paymentStatus: order.paymentStatus,
            orderId: order._id
        });

        User.findById(order.buyer)
            .then(async (buyer) => {
                if (!buyer) {
                    return;
                }

                try {
                    await sendEmail(
                        buyer.email,
                        "BRIKRO Payment Successful",
                        `
                            <h2>Payment Successful</h2>
                            <p>Hello ${buyer.name},</p>
                            <p>Your payment for "${order.material.title}" was successful.</p>
                            <p>Quantity: ${order.quantity}</p>
                            <p>Material Amount: ₹${order.material.price * order.quantity}</p>
                            <p>Material Payment Received: ₹${order.totalAmount - order.transportFee}</p>
                            <p>Transport Fee: ₹${order.transportFee} (pay the transporter directly)</p>
                            <p>Your order is now confirmed and will be processed further.</p>
                            <p>Smart Supplies. Smart Savings. Smarter Sites.</p>
                        `
                    );
                } catch (emailError) {
                    console.log(
                        "BUYER EMAIL ERROR:",
                        emailError.message
                    );
                }
            })
            .catch((error) => {
                console.log(
                    "BUYER LOOKUP ERROR:",
                    error.message
                );
            });

        User.findById(order.material.seller)
            .then(async (seller) => {
                if (!seller) {
                    return;
                }

                try {
                    await sendEmail(
                        seller.email,
                        "You Have a New BRIKRO Sale",
                        `
                            <h2>New Sale on BRIKRO</h2>
                            <p>Hello ${seller.name},</p>
                            <p>Payment has been successfully received for your listing "${order.material.title}".</p>
                            <p>Quantity Sold: ${order.quantity}</p>
                            <p>Material Amount: ₹${order.material.price * order.quantity}</p>
                           <p>Material Payment Received: ₹${order.totalAmount - order.transportFee}</p>
                            <p>Transport Fee: ₹${order.transportFee} (pay the transporter directly)</p>
                            <p>Please log in to BRIKRO to view and manage the order.</p>
                            <p>Smart Supplies. Smart Savings. Smarter Sites.</p>
                        `
                    );
                } catch (emailError) {
                    console.log(
                        "SELLER EMAIL ERROR:",
                        emailError.message
                    );
                }
            })
            .catch((error) => {
                console.log(
                    "SELLER LOOKUP ERROR:",
                    error.message
                );
            });

    } catch (error) {
        return res.status(500).json({
            message: "Payment verification failed",
            error: error.message
        });
    }
};

module.exports = {createPaymentOrder, verifyPayment};