const crypto = require("crypto");

const generateOtp = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

const hashOtp = (otp) => {
    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
};

const OTP_EXPIRY_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

module.exports = {
    generateOtp,
    hashOtp,
    OTP_EXPIRY_MINUTES,
    OTP_MAX_ATTEMPTS
};
