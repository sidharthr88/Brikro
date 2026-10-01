const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const registerUser = async(req,res)=>{
const{name, email, password} = req.body;
    
    if (!name || !email || !password) {
    return res.status(400).json({
        message: "Name, email and password are required"
    });
}
const existingUser = await User.findOne({email});
    if (existingUser){
    return res.status(400).json({
        message: "User with this email already exists"
    });
}
const hashedPassword = await bcrypt.hash(password, 10);
const user = await User.create({
    name,
    email,
    password: hashedPassword
});

return res.status(201).json({
    message:"User registered successfully",
    user:{
        id:user._id,
        name:user.name,
        email: user.email,
        role: user.role
        }
});
};
const loginUser = async(req,res)=>{
    const{email, password} = req.body;

    const user = await User.findOne({email});

    if(!user){
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }
    const isPasswordCorrect = await bcrypt.compare(
        password,user.password
    );
    if(!isPasswordCorrect){
        return res.status(400).json({
            message: "Invalid email or password"
        });
    }
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

};


module.exports = { registerUser,loginUser };