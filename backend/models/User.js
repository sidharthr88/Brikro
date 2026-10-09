
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["buyer", "seller", "transporter", "admin"],
            default: "buyer"
        },

        phone: {
            type: String,
            default: ""
        },

        address: {
            type: String,
            default: ""
        },

       isActive: {
        type: Boolean,
        default: true
    },
        resetPasswordToken: {
        type: String,
        default: null
    },
      resetPasswordExpires: {
      type: Date,
      default: null
    }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;