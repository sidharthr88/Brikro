const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const sendEmail = require("./config/email");

const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes")
const authMiddleware = require("./middleware/authMiddleware");
const materialRoutes = require("./routes/materialRoutes");
const orderRoutes = require("./routes/orderRoutes");
const transporterRoutes = require("./routes/transporterRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(cors());
const PORT = process.env.PORT||5000;
app.use(express.json());
app.get("/test-email", async (req, res) => {
    try {
        await sendEmail(
            process.env.EMAIL_USER,
            "BRIKRO Email Test",
            "<h2>BRIKRO email system is working.</h2><p>This is a test email.</p>"
        );

        res.json({
            message: "Test email sent successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to send test email",
            error: error.message
        });
    }
});
app.use("/api/auth", authRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/transporters", transporterRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
connectDB();

app.get("/",(req,res)=>{
    res.json({
        message:"Brikro API is running"
    });
});
app.get("/api/protected", authMiddleware, (req, res) => {
    res.json({
        message: "You accessed a protected route",
        user: req.user
    });
});
app.listen(PORT,()=>{
    console.log(`BRIKRO server running on port ${PORT}`);
});