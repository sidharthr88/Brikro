const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const user = await User.findOne({
            email: "sidharthrajesh8@gmail.com"
        });

        if (!user) {
            const hashedPassword = await bcrypt.hash(
                "sidharth",
                10
            );

            await User.create({
                name: "Sidharth Rajesh",
                email: "sidharthrajesh8@gmail.com",
                password: hashedPassword,
                role: "admin",
                isActive: true
            });

            console.log("Admin account created successfully");
        } else {
            user.role = "admin";
            user.isActive = true;

            await user.save();

            console.log("Existing account converted to admin successfully");
        }

        process.exit();

    } catch (error) {
        console.error(
            "ADMIN CREATION ERROR:",
            error.message
        );

        process.exit(1);
    }
};

createAdmin();