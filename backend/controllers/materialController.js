
const mongoose = require("mongoose");
const Material = require("../models/Material");

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

        const material = await Material.create({
            title,
            description,
            category,
            price,
            quantity,
            condition,
            location,
            images: images || [],
            seller: req.user.id
        });

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
        const materials = await Material.find();

        return res.status(200).json({
            materials
        });

    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch materials",
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
            images
        } = req.body;

        material.title = title ?? material.title;
        material.description = description ?? material.description;
        material.category = category ?? material.category;
        material.price = price ?? material.price;
        material.quantity = quantity ?? material.quantity;
        material.condition = condition ?? material.condition;
        material.location = location ?? material.location;
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


module.exports = { createMaterial, getAllMaterials, getMaterialById, updateMaterial, deleteMaterial};