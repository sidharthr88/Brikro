
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({
                message: "User not found"
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "Your account has been deactivated"
            });
        }

        req.user = {
            id: user._id.toString(),
            role: user.role,
            sellerStatus: user.sellerStatus,
            transporterStatus: user.transporterStatus,
            approvalStatus: user.approvalStatus
        };

        next();
    } catch (error) {
        if (error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        console.error("AUTH MIDDLEWARE ERROR:", error);

        return res.status(500).json({
            message: "Authentication failed"
        });
    }
};

module.exports = authMiddleware;
