const mongoose = require("mongoose");
const transporterSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    vehicleType: {
      type: String,
      required: true,
      trim: true,
    },

    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    drivingLicenseNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    rcNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    aadhaarNumber: {
      type: String,
      trim: true,
    },

    vehicleOwnerName: {
      type: String,
      trim: true,
    },

    vehiclePhoto: {
        type: String,
        trim: true
    },
    
    currentLocation: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Transporter = mongoose.model("Transporter", transporterSchema);

module.exports = Transporter;
