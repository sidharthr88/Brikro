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
            .populate("seller", "name email phone");

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
            .populate(
                "user",
                "name email phone isActive role approvalStatus transporterStatus transporterAdminRemark"
            );

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

const updateApprovalStatus = async (req, res) => {
    try {
        const { approvalStatus, adminRemark = "" } = req.body;

        if (!["approved", "rejected"].includes(approvalStatus)) {
            return res.status(400).json({
                message: "approvalStatus must be approved or rejected"
            });
        }

        if (typeof adminRemark !== "string") {
            return res.status(400).json({
                message: "Admin remark must be text"
            });
        }

        if (approvalStatus === "rejected" && !adminRemark.trim()) {
            return res.status(400).json({
                message: "Please provide a reason when rejecting an application"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const isTransporterApplication =
            user.transporterStatus === "pending" ||
            user.transporterStatus === "rejected" ||
            user.transporterStatus === "approved" ||
            user.role === "transporter";

        const isSellerApplication =
            user.sellerStatus === "pending" ||
            user.sellerStatus === "rejected" ||
            user.role === "seller";

        if (!isTransporterApplication && !isSellerApplication) {
            return res.status(400).json({
                message: "No seller or transporter application found for this user"
            });
        }

        if (isTransporterApplication) {
            const transporter = await Transporter.findOne({
                user: user._id
            });

            if (!transporter) {
                return res.status(400).json({
                    message: "Transporter profile not found"
                });
            }

            user.transporterStatus = approvalStatus;
            user.transporterAdminRemark =
                approvalStatus === "rejected" ? adminRemark.trim() : "";

            if (user.role === "transporter") {
                user.approvalStatus = approvalStatus;
            }
        } else {
            user.sellerStatus = approvalStatus;

            if (user.role === "seller") {
                user.approvalStatus = approvalStatus;
            }
        }

        await user.save();

        return res.status(200).json({
            message: `Application ${approvalStatus} successfully`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                approvalStatus: user.approvalStatus,
                sellerStatus: user.sellerStatus,
                transporterStatus: user.transporterStatus,
                transporterAdminRemark: user.transporterAdminRemark
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to update application status",
            error: error.message
        });
    }
};

const reviewMaterial = async (req, res) => {
    try {
        const { approvalStatus, adminRemark = "" } = req.body;

        if (!["approved", "rejected"].includes(approvalStatus)) {
            return res.status(400).json({
                message: "approvalStatus must be approved or rejected"
            });
        }

        if (
            typeof adminRemark !== "string" ||
            (approvalStatus === "rejected" && !adminRemark.trim())
        ) {
            return res.status(400).json({
                message: "Please provide an admin remark when rejecting a listing"
            });
        }

        if (!require("mongoose").Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid material ID"
            });
        }

        const material = await Material.findById(req.params.id)
            .populate(
                "seller",
                "name email role isActive sellerStatus transporterStatus approvalStatus"
            );

        if (!material) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        const seller = material.seller;

        if (
            approvalStatus === "approved" &&
            (!seller || !seller.isActive)
        ) {
            return res.status(400).json({
                message: "Cannot approve a listing because the seller account is missing or inactive"
            });
        }

        material.approvalStatus = approvalStatus;
        material.adminRemark = adminRemark.trim();
        material.reviewedBy = req.user.id;
        material.reviewedAt = new Date();

        await material.save();

        return res.status(200).json({
            message: approvalStatus === "approved"
                ? "Material listing approved successfully"
                : "Material listing rejected successfully",
            material
        });
    } catch (error) {
        console.error("REVIEW MATERIAL ERROR:", error);

        return res.status(500).json({
            message: "Failed to review material listing"
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
module.exports = { getAllUsers, getAllMaterials, getAllOrders, getAllTransporters, getDashboardStats, updateUserStatus, updateApprovalStatus, deleteMaterial, createTransporter, reviewMaterial };