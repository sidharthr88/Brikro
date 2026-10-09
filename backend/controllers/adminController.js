const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Material = require("../models/Material");
const Order = require("../models/Order");
const Transporter = require("../models/Transporter");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        res.status(200).json({
            count: users.length,
            users
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

const getAllMaterials = async (req, res) => {
    try {
        const materials = await Material.find()
            .populate("seller", "name email");

        res.status(200).json({
            count: materials.length,
            materials
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch materials",
            error: error.message
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("buyer", "name email")
            .populate("material", "title price")
            .populate("transporter");

        res.status(200).json({
            count: orders.length,
            orders
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch orders",
            error: error.message
        });
    }
};

const getAllTransporters = async (req, res) => {
    try {
        const transporters = await Transporter.find()
            .populate("user", "name email isActive");

        res.status(200).json({
            count: transporters.length,
            transporters
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch transporters",
            error: error.message
        });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalMaterials = await Material.countDocuments();
        const totalOrders = await Order.countDocuments();
        const totalTransporters = await Transporter.countDocuments();

        res.status(200).json({
            totalUsers,
            totalMaterials,
            totalOrders,
            totalTransporters
        });

    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch dashboard statistics",
            error: error.message
        });
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be true or false"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user._id.toString() === req.user.id) {
            return res.status(400).json({
                message: "You cannot change your own account status"
            });
        }

        user.isActive = isActive;

        await user.save();

        return res.status(200).json({
            message: isActive
                ? "User activated successfully"
                : "User deactivated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to update user status",
            error: error.message
        });
    }
};
const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        await Material.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: "Material removed successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to remove material",
            error: error.message
        });
    }
};
const createTransporter = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            vehicleType,
            vehicleNumber
        } = req.body;

        if (
            !name ||
            !email ||
            !password ||
            !vehicleType ||
            !vehicleNumber
        ) {
            return res.status(400).json({
                message: "All transporter details are required"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists"
            });
        }

        const existingVehicle = await Transporter.findOne({
            vehicleNumber
        });

        if (existingVehicle) {
            return res.status(400).json({
                message: "Vehicle number already exists"
            });
        }

       const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: "transporter"
        });

        const transporter = await Transporter.create({
            user: user._id,
            vehicleType,
            vehicleNumber
        });

        return res.status(201).json({
            message: "Transporter created successfully",
            transporter: {
                id: transporter._id,
                name: user.name,
                email: user.email,
                vehicleType: transporter.vehicleType,
                vehicleNumber: transporter.vehicleNumber,
                isActive: user.isActive
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to create transporter",
            error: error.message
        });
    }
};
module.exports = { getAllUsers, getAllMaterials, getAllOrders, getAllTransporters, getDashboardStats, updateUserStatus, deleteMaterial, createTransporter };