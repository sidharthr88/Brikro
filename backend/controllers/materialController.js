const mongoose = require("mongoose");
const Material = require("../models/Material");
const sendEmail = require("../config/email");
const User = require("../models/User");


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

        const seller = await User.findById(req.user.id);

        if (!seller) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (seller.role !== "seller") {
            return res.status(403).json({
                message: "Only sellers can create material listings"
            });
        }

        if (!seller.isActive) {
            return res.status(403).json({
                message: "Your account is inactive"
            });
        }

        if (seller.approvalStatus !== "approved") {
            return res.status(403).json({
                message: "Your seller account is awaiting approval. You can create listings after admin approval."
            });
        }

        const material = await Material.create({
            title,
            description,
            category,
            price,
            quantity,
            condition,
            location,
            locationCoordinates,
            images: images || [],
            seller: req.user.id
        });

        try {
            await sendEmail(
                seller.email,
                "Your BRIKRO Listing is Live",
                `
                    <h2>Listing Created Successfully</h2>
                    <p>Your material listing "${material.title}" has been created successfully.</p>
                    <p>Buyers can now view your listing on BRIKRO.</p>
                    <p>Smart Supplies. Smart Savings. Smarter Sites.</p>
                `
            );
        } catch (emailError) {
            console.log("Listing email failed:", emailError.message);
        }

        return res.status(201).json({
            message: "Material created successfully",
            material
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to create material",
            error: error.message
        });
    }
};

const getAllMaterials = async (req, res) => {
    try {
        const { category, location } = req.query;
        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (location) {
            filter.location = location;
        }

        const materials = await Material.find(filter)
            .populate({
                path: "seller",
                select: "name email isActive approvalStatus",
                match: {
                    isActive: true,
                    approvalStatus: "approved",
                    role: "seller"
                }
            });

        const activeMaterials = materials.filter(
            (material) => material.seller
        );

        return res.status(200).json({
            materials: activeMaterials
        });

    } catch (error) {
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
        });

        return res.status(200).json({
            materials
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch your materials",
            error: error.message
        });
    }
};

const getMaterialById = async (req, res) => {
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

        return res.status(200).json({
            material
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch material",
            error: error.message
        });
    }
};
const updateMaterial = async (req, res) => {
    try {
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

        material.title = title ?? material.title;
        material.description = description ?? material.description;
        material.category = category ?? material.category;
        material.price = price ?? material.price;
        material.quantity = quantity ?? material.quantity;
        material.condition = condition ?? material.condition;
        material.location = location ?? material.location;
        material.locationCoordinates = locationCoordinates ?? material.locationCoordinates;
        material.images = images ?? material.images;

        await material.save();

        return res.status(200).json({
            message: "Material updated successfully",
            material
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to update material",
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
        return res.status(500).json({
            message: "Failed to delete material",
            error: error.message
        });
    }
};


module.exports = { createMaterial, getAllMaterials, getMyMaterials, getMaterialById, updateMaterial, deleteMaterial};