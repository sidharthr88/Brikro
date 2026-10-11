const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        transporter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transporter",
            default: null
        },

        material: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Material",
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        transportFee: {
        type: Number,
        default: 0,
        },

        deliveryAddress: {
            type: String,
            default: ""
        },

        deliveryMethod: {
            type: String,
            enum: ["transporter", "self_pickup"],
            default: "self_pickup",
        },

        deliveryLocation: {
            latitude: {
                type: Number
            },
            longitude: {
                type: Number
            }
        },

        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "picked_up",
                "in_transit",
                "delivered",
                "cancelled"
            ],
            default: "pending"
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed"
            ],
            default: "pending"
        },

        razorpayOrderId: {
            type: String,
            default: ""
        },
        pickupOtpHash: {
            type: String,
            default: null,
            select: false
        },

        pickupOtpExpiresAt: {
            type: Date,
            default: null
        },

        pickupOtpAttempts: {
            type: Number,
            default: 0
        },

        pickupVerifiedAt: {
            type: Date,
            default: null
        },

        deliveryOtpHash: {
            type: String,
            default: null,
            select: false
        },

        deliveryOtpExpiresAt: {
            type: Date,
            default: null
        },

        deliveryOtpAttempts: {
            type: Number,
            default: 0
        },

        deliveryVerifiedAt: {
            type: Date,
            default: null
        }
    },

    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;