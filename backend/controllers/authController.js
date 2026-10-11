const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Transporter = require("../models/Transporter");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../config/email");

const registerUser = async (req, res) => {
let user;

try {
    const {
        name,
        email,
        password,
        phone,
        role = "buyer",
        vehicleType,
        vehicleNumber,
        latitude,
        longitude
    } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "Name, email and password are required"
        });
    }

    if (!["buyer", "seller", "transporter"].includes(role)) {
        return res.status(400).json({
            message: "Invalid registration role"
        });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
        email: normalizedEmail
    });

    if (existingUser) {
        return res.status(400).json({
            message: "User with this email already exists"
        });
    }

    if (role === "transporter") {
        if (!vehicleType?.trim() || !vehicleNumber?.trim()) {
            return res.status(400).json({
                message: "Vehicle type and vehicle number are required"
            });
        }

        if (
            latitude !== undefined &&
            latitude !== "" &&
            (!Number.isFinite(Number(latitude)) ||
                Number(latitude) < -90 ||
                Number(latitude) > 90)
        ) {
            return res.status(400).json({
                message: "Latitude must be between -90 and 90"
            });
        }

        if (
            longitude !== undefined &&
            longitude !== "" &&
            (!Number.isFinite(Number(longitude)) ||
                Number(longitude) < -180 ||
                Number(longitude) > 180)
        ) {
            return res.status(400).json({
                message: "Longitude must be between -180 and 180"
            });
        }

        const existingVehicle = await Transporter.findOne({
            vehicleNumber: vehicleNumber.trim().toUpperCase()
        });

        if (existingVehicle) {
            return res.status(409).json({
                message: "This vehicle number is already registered"
            });
        }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || "",
        role
    });

    let transporterProfile = null;

    if (role === "transporter") {
        const currentLocation = {};

        if (latitude !== undefined && latitude !== "") {
            currentLocation.latitude = Number(latitude);
        }

        if (longitude !== undefined && longitude !== "") {
            currentLocation.longitude = Number(longitude);
        }

        try {
            transporterProfile = await Transporter.create({
                user: user._id,
                vehicleType: vehicleType.trim(),
                vehicleNumber: vehicleNumber.trim().toUpperCase(),
                currentLocation
            });
        } catch (profileError) {
            await User.findByIdAndDelete(user._id);
            user = null;
            throw profileError;
        }
    }

    try {
        await sendEmail(
            user.email,
            "Welcome to BRIKRO",
            `
                <h2>Welcome to BRIKRO, ${user.name}!</h2>
                <p>Your BRIKRO account has been created successfully.</p>
                <p>You can now use the BRIKRO platform.</p>
                <p>Smart Supplies. Smart Savings. Smarter Sites.</p>
            `
        );
    } catch (emailError) {
        console.error("Welcome email failed:", emailError.message);
    }

    return res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            approvalStatus: user.approvalStatus,
            transporterStatus: user.transporterStatus
        },
        ...(transporterProfile
            ? { transporter: transporterProfile }
            : {})
    });
} catch (error) {
    if (user) {
        await User.findByIdAndDelete(user._id).catch(() => {});
    }

    if (error.code === 11000) {
        return res.status(409).json({
            message: "Email or vehicle number is already registered"
        });
    }

    console.error("REGISTER USER ERROR:", error);

    return res.status(500).json({
        message: "Registration failed"
    });
}

};

const loginUser = async (req, res) => {
try {
const { email, password } = req.body;

      const user = await User.findOne({
        email: email?.trim().toLowerCase()
    });

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }
  
    sendEmail(
        user.email,
        "New Login to Your BRIKRO Account",
        `
            <h2>Login Successful</h2>
            <p>Hello ${user.name},</p>
            <p>Your BRIKRO account was just logged in successfully.</p>
            <p>If this was not you, please reset your password immediately.</p>
            <p>Smart Supplies. Smart Savings. Smarter Sites.</p>
        `
    ).catch((emailError) => {
        console.error("Login email failed:", emailError.message);
    });


    const token = jwt.sign(
        {
            id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    return res.status(200).json({
        message: "Login successful",
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
} catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
        message: "Login failed"
    });
}

};

const getMyProfile = async (req, res) => {
try {
const user = await User.findById(req.user.id).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found"
        });
    }

    return res.status(200).json({ user });
} catch (error) {
    return res.status(500).json({
        message: "Failed to fetch profile",
        error: error.message
    });
}


};

const forgotPassword = async (req, res) => {
try {
const { email } = req.body;
const user = await User.findOne({
email: email?.trim().toLowerCase()
});


    if (!user) {
        return res.status(404).json({
            message: "No account found with this email"
        });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
        throw new Error("FRONTEND_URL is not configured");
    }
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    await sendEmail(
        user.email,
        "Hey! Reset Your BRIKRO Password",
        `
            <h2>Reset Your BRIKRO Password</h2>
            <p>Hello ${user.name},</p>
            <p>We received a request to reset your password.</p>
            <p>Click the link below to create a new password:</p>
            <a href="${resetLink}">Reset Password</a>
            <p>This link will expire in 15 minutes.</p>
            <p>If you did not request this, you can ignore this email.</p>
        `
    );

    return res.status(200).json({
        message: "Password reset link sent to your email"
    });
} catch (error) {
    return res.status(500).json({
        message: "Failed to send password reset email",
        error: error.message
    });
}

};

const resetPassword = async (req, res) => {
try {
const { token } = req.params;
const { password } = req.body;

    if (!password) {
        return res.status(400).json({
            message: "Password is required"
        });
    }

    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            message: "Invalid or expired reset link"
        });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
        message: "Password reset successfully"
    });
} catch (error) {
    return res.status(500).json({
        message: "Failed to reset password",
        error: error.message
    });
}


};

module.exports = {registerUser,loginUser,getMyProfile,forgotPassword,resetPassword};
