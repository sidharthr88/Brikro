const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const authRoutes = require("./routes/authRoutes")
const authMiddleware = require("./middleware/authMiddleware");
const materialRoutes = require("./routes/materialRoutes");
const orderRoutes = require("./routes/orderRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT||5000;
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/orders", orderRoutes);
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