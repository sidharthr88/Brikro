
const express = require("express");
const { createMaterial, getAllMaterials, getMyMaterials, getMaterialById, updateMaterial, deleteMaterial } = require("../controllers/materialController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createMaterial);
router.get("/", getAllMaterials );
router.get("/my", authMiddleware, getMyMaterials);
router.get("/:id", getMaterialById);
router.put("/:id", authMiddleware, updateMaterial);
router.delete("/:id", authMiddleware, deleteMaterial);

module.exports = router;