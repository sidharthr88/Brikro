const mongoose = require("mongoose");
const Material = require("../models/Material");
const User = require("../models/User");
const sendEmail = require("../config/email");

const isApprovedSeller = (seller) => {
    return (
        seller.sellerStatus === "approved" ||
        (
            seller.role === "seller" &&
            seller.approvalStatus === "approved"
        )
    );
};

const createMaterial = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            price,
            quantity,
            condition,
            location,
            locationCoordinates,
            images
        } = req.body;

        if (
            !title ||
            !description ||
            !category ||
            price === undefined ||
            quantity === undefined ||
            !condition ||
            !location
        ) {
            return res.status(400).json({
                message: "All required fields are required"
            });
        }

        if (
            !Number.isFinite(Number(price)) ||
            Number(price) < 0 ||
            !Number.isInteger(Number(quantity)) ||
            Number(quantity) <= 0
        ) {
            return res.status(400).json({
                message: "Price must be non-negative and quantity must be a positive integer"
            });
        }

        const seller = await User.findById(req.user.id);

        if (!seller) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!seller.isActive) {
            return res.status(403).json({
                message: "Your account is inactive"
            });
        }

        const material = await Material.create({
            title,
            description,
            category,
            price: Number(price),
            quantity: Number(quantity),
            condition,
            location,
            locationCoordinates,
            images: images || [],
            seller: seller._id,
            approvalStatus: "pending",
            adminRemark: "",
            reviewedBy: null,
            reviewedAt: null
        });

        try {
            await sendEmail(
                seller.email,
                "Your BRIKRO Listing Is Under Review",
                `
                    <h2>Listing Submitted Successfully</h2>
                    <p>Your material listing "${material.title}" has been submitted successfully.</p>
                    <p>Your listing is awaiting admin review. It will appear to buyers after it has been approved.</p>
                    <p>Smart Supplies. Smart Savings. Smarter Sites.</p>
                `
            );
        } catch (emailError) {
            console.log("Listing email failed:", emailError.message);
        }

        return res.status(201).json({
            message: "Material submitted successfully and is awaiting admin approval",
            material
        });
    } catch (error) {
        console.error("CREATE MATERIAL ERROR:", error);

        return res.status(500).json({
            message: "Failed to create material",
            error: error.message
        });
    }
};

const getAllMaterials = async (req, res) => {
    try {
        const { category, location } = req.query;

        const filter = {
            approvalStatus: "approved"
        };

        if (category) {
            filter.category = category;
        }

        if (location) {
            filter.location = {
                $regex: location,
                $options: "i"
            };
        }

        const materials = await Material.find(filter)
            .populate({
                path: "seller",
                select: "name email isActive",
                match: {
                    isActive: true
                }
            })
            .sort({ createdAt: -1 });

        const approvedMaterials = materials.filter(
            (material) => material.seller
        );

        return res.status(200).json({
            count: approvedMaterials.length,
            materials: approvedMaterials
        });
    } catch (error) {
        console.error("GET MATERIALS ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch materials",
            error: error.message
        });
    }
};

const getMyMaterials = async (req, res) => {
    try {
        const materials = await Material.find({
            seller: req.user.id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            count: materials.length,
            materials
        });
    } catch (error) {
        console.error("GET MY MATERIALS ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch your materials",
            error: error.message
        });
    }
};

const getMaterialById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid material ID"
            });
        }

        const material = await Material.findById(id);

        if (!material) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        const seller = await User.findById(material.seller);

        const isOwner =
            req.user &&
            material.seller.toString() === req.user.id;

        const isAdmin = req.user?.role === "admin";

        const isPubliclyVisible =
            material.approvalStatus === "approved" &&
            seller &&
            seller.isActive;

        if (!isPubliclyVisible && !isOwner && !isAdmin) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        await material.populate({
            path: "seller",
            select: "name email phone"
        });

        return res.status(200).json({
            material
        });
    } catch (error) {
        console.error("GET MATERIAL BY ID ERROR:", error);

        return res.status(500).json({
            message: "Failed to fetch material",
            error: error.message
        });
    }
};

const updateMaterial = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid material ID"
            });
        }

        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        if (material.seller.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only update your own material"
            });
        }

        const seller = await User.findById(req.user.id);

        if (!seller || !seller.isActive) {
            return res.status(403).json({
                message: "Your account must be active to update listings"
            });
        }

        const {
            title,
            description,
            category,
            price,
            quantity,
            condition,
            location,
            locationCoordinates,
            images
        } = req.body;

        if (
            (title !== undefined && !String(title).trim()) ||
            (description !== undefined && !String(description).trim()) ||
            (category !== undefined && !String(category).trim()) ||
            (condition !== undefined && !String(condition).trim()) ||
            (location !== undefined && !String(location).trim())
        ) {
            return res.status(400).json({
                message: "Title, description, category, condition, and location cannot be empty"
            });
        }

        if (
            price !== undefined &&
            (!Number.isFinite(Number(price)) || Number(price) < 0)
        ) {
            return res.status(400).json({
                message: "Price must be a non-negative number"
            });
        }

        if (
            quantity !== undefined &&
            (!Number.isInteger(Number(quantity)) || Number(quantity) <= 0)
        ) {
            return res.status(400).json({
                message: "Quantity must be a positive integer"
            });
        }

        material.title = title ?? material.title;
        material.description = description ?? material.description;
        material.category = category ?? material.category;
        material.price = price !== undefined
            ? Number(price)
            : material.price;
        material.quantity = quantity !== undefined
            ? Number(quantity)
            : material.quantity;
        material.condition = condition ?? material.condition;
        material.location = location ?? material.location;
        material.locationCoordinates =
            locationCoordinates ?? material.locationCoordinates;
        material.images = images ?? material.images;

        material.approvalStatus = "pending";
        material.adminRemark = "";
        material.reviewedBy = null;
        material.reviewedAt = null;

        await material.save();

        return res.status(200).json({
            message: "Material updated successfully. It is awaiting admin approval again.",
            material
        });
    } catch (error) {
        console.error("UPDATE MATERIAL ERROR:", error);

        return res.status(500).json({
            message: "Failed to update material",
            error: error.message
        });
    }
};

const deleteMaterial = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                message: "Invalid material ID"
            });
        }

        const material = await Material.findById(req.params.id);

        if (!material) {
            return res.status(404).json({
                message: "Material not found"
            });
        }

        if (material.seller.toString() !== req.user.id) {
            return res.status(403).json({
                message: "You can only delete your own material"
            });
        }

        await Material.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: "Material deleted successfully"
        });
    } catch (error) {
        console.error("DELETE MATERIAL ERROR:", error);

        return res.status(500).json({
            message: "Failed to delete material",
            error: error.message
        });
    }
};

module.exports = {createMaterial,getAllMaterials,getMyMaterials,getMaterialById,updateMaterial,deleteMaterial};
