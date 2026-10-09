const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema({
    title: {
    type: String,
    required: true
    },
    description: {
    type: String,
    required: true
    },
    category: {
    type: String,
    required: true
    },
    price: {
    type: Number,
    required: true,
    min: 0
    },
    quantity: {
    type: Number,
    required: true,
    min: 0
    },
    condition: {
    type: String,
    required: true
    },
    location: {
    type: String,
    required: true,
    trim: true
    },
    locationCoordinates: {
    latitude: {
    type: Number,
    },
    longitude: {
    type: Number,
    },
    },
    images: {
    type: [String],
    default: []
    },
    seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
    }
    },
    {
    timestamps: true
    }
);

const Material = mongoose.model("Material", materialSchema);

module.exports = Material;
