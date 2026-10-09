const mongoose = require("mongoose");
const transporterSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        vehicleType: {
            type: String,
            required: true
        },

        vehicleNumber: {
            type: String,
            required: true,
            unique: true
        },

        currentLocation: {
            latitude: {
                type: Number
            },
            longitude: {
                type: Number
            }
        },

        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const Transporter = mongoose.model("Transporter", transporterSchema);

module.exports = Transporter;