import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Alert,Box,Button,Container,MenuItem,Paper,TextField,Typography} from "@mui/material";
import api from "../api/axios";

function Register() {
const navigate = useNavigate();

const [form, setForm] = useState({
name: "",
email: "",
phone: "",
password: "",
vehicleType: "Truck",
vehicleNumber: "",
latitude: "",
longitude: ""
});

const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [loading, setLoading] = useState(false);

const handleChange = (e) => {
setForm((prev) => ({
...prev,
[e.target.name]: e.target.value
}));
};

const handleRegister = async (e) => {
e.preventDefault();
setError("");
setSuccess("");


if (!form.name.trim() || !form.email.trim() ||
    !form.password || !form.vehicleType ||
    !form.vehicleNumber.trim()) {
  setError("Please complete all required fields.");
  return;
}

if (
  (form.latitude !== "" &&
    (!Number.isFinite(Number(form.latitude)) ||
      Number(form.latitude) < -90 ||
      Number(form.latitude) > 90)) ||
  (form.longitude !== "" &&
    (!Number.isFinite(Number(form.longitude)) ||
      Number(form.longitude) < -180 ||
      Number(form.longitude) > 180))
) {
  setError("Please enter valid latitude and longitude values.");
  return;
}

setLoading(true);

try {
  await api.post("/auth/register", {
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim(),
    password: form.password,
    role: "transporter",
    vehicleType: form.vehicleType,
    vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
    latitude: form.latitude === "" ? undefined : Number(form.latitude),
    longitude: form.longitude === "" ? undefined : Number(form.longitude)
  });

  setSuccess(
  "Registration submitted successfully. Your transporter account is awaiting admin approval. Redirecting to login..."
);

  setTimeout(() => navigate("/login"), 1500);
} catch (err) {
  setError(
    err.response?.data?.message || "Registration failed."
  );
} finally {
  setLoading(false);
}


};

const fieldStyle = {
"& .MuiInputLabel-root": { color: "#FFFFFF" },
"& .MuiInputLabel-root.Mui-focused": { color: "#FF6B00" },
"& .MuiOutlinedInput-root": {
color: "#FFFFFF",
backgroundColor: "#242424",
"& fieldset": { borderColor: "#555555" },
"&:hover fieldset": { borderColor: "#FFFFFF" },
"&.Mui-focused fieldset": { borderColor: "#FF6B00" }
},
"& .MuiSvgIcon-root": { color: "#FFFFFF" }
};

return (
<Box
sx={{
minHeight: "100vh",
backgroundColor: "#0A0A0A",
color: "#FFFFFF",
display: "flex",
alignItems: "center",
py: 10,
backgroundImage:
"radial-gradient(circle at 50% 35%, rgba(255,107,0,0.10), transparent 40%)"
}}
> <Container maxWidth="sm">
<Paper
elevation={0}
sx={{
backgroundColor: "#151515",
border: "1px solid #292929",
borderRadius: 4,
p: { xs: 3, md: 5 },
boxShadow: "0 25px 80px rgba(0,0,0,0.45)"
}}
>
<Box sx={{ textAlign: "center", mb: 4 }}>
<Typography sx={{ fontSize: "1.5rem", fontWeight: 800 }}>
BRIKRO{" "}
<Box component="span" sx={{ color: "#FF6B00" }}>
TRANSPORT </Box> </Typography>

```
        <Typography sx={{ color: "#FF6B00", fontWeight: 700, mt: 2 }}>
          TRANSPORTER PORTAL
        </Typography>

        <Typography variant="h4" sx={{ fontWeight: 800, my: 2 }}>
          Create your account
        </Typography>

        <Typography sx={{ color: "#B0B0B0" }}>
          Join the BRIKRO transport network.
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleRegister}
        sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
      >
        <Typography sx={{ color: "#FF6B00", fontWeight: 700 }}>
          ACCOUNT DETAILS
        </Typography>

        <TextField
          label="Full Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          fullWidth
          sx={fieldStyle}
        />

        <TextField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          fullWidth
          sx={fieldStyle}
        />

        <TextField
          label="Phone Number"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          fullWidth
          sx={fieldStyle}
        />

        <TextField
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          inputProps={{ minLength: 6 }}
          fullWidth
          sx={fieldStyle}
        />

        <Typography sx={{ color: "#FF6B00", fontWeight: 700, mt: 1 }}>
          VEHICLE DETAILS
        </Typography>

        <TextField
          select
          label="Vehicle Type"
          name="vehicleType"
          value={form.vehicleType}
          onChange={handleChange}
          required
          fullWidth
          sx={fieldStyle}
        >
          {["Truck", "Pickup", "Van", "Three-wheeler"].map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Vehicle Registration Number"
          name="vehicleNumber"
          value={form.vehicleNumber}
          onChange={handleChange}
          placeholder="e.g. KL01CD5678"
          required
          fullWidth
          sx={fieldStyle}
        />

        <Typography sx={{ color: "#B0B0B0", fontSize: "0.85rem" }}>
          Location coordinates are optional. You can leave them blank for now.
        </Typography>

        <TextField
          label="Latitude (optional)"
          name="latitude"
          type="number"
          value={form.latitude}
          onChange={handleChange}
          inputProps={{ step: "any", min: -90, max: 90 }}
          fullWidth
          sx={fieldStyle}
        />

        <TextField
          label="Longitude (optional)"
          name="longitude"
          type="number"
          value={form.longitude}
          onChange={handleChange}
          inputProps={{ step: "any", min: -180, max: 180 }}
          fullWidth
          sx={fieldStyle}
        />

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={loading}
          sx={{
            backgroundColor: "#FF6B00",
            color: "#FFFFFF",
            py: 1.5,
            fontWeight: 800,
            mt: 1,
            "&:hover": { backgroundColor: "#E85F00" }
          }}
        >
          {loading ? "Creating Account..." : "Create Transporter Account"}
        </Button>
      </Box>

      <Box sx={{ textAlign: "center", mt: 3 }}>
        <Typography component="span" sx={{ color: "#B0B0B0" }}>
          Already have an account?{" "}
        </Typography>
        <Button
          onClick={() => navigate("/login")}
          sx={{ color: "#FF6B00", fontWeight: 700 }}
        >
          Login
        </Button>
      </Box>

      <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #292929", textAlign: "center" }}>
        <Typography sx={{ color: "#888888", fontSize: "0.8rem" }}>
          Moving materials. Connecting sites. Powering reuse.
        </Typography>
      </Box>
    </Paper>
  </Container>
</Box>

);
}

export default Register;
