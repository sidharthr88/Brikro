import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Box, Button, Container, TextField, Typography} from "@mui/material";
import api from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      setSuccess("Account created successfully. Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      setError(
        error.response?.data?.message || "Registration failed"
      );
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Box
        sx={{
          backgroundColor: "#151515",
          border: "1px solid #262626",
          borderRadius: 4,
          p: { xs: 3, md: 5 },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 600,
            mb: 1,
          }}
        >
          Sign Up
        </Typography>

        <Typography
        sx={{
            color: "text.secondary",
            mb: 4,
            }}
        >
        or {" "}
        <Box
            component="span"
            onClick={() => navigate("/login")}
            sx={{
                 color: "#FFFFFF",
                 cursor: "pointer",
                 fontWeight: 600,
                }}
        >
            Login to your account
        </Box>
        </Typography>

        <Box
          component="form"
          onSubmit={handleRegister}
        >
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          {error && (
            <Typography
              sx={{
                color: "#ff5252",
                fontSize: "0.9rem",
                mb: 2,
              }}
            >
              {error}
            </Typography>
          )}

          {success && (
            <Typography
              sx={{
                color: "primary.main",
                fontSize: "0.9rem",
                mb: 2,
              }}
            >
              {success}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            size="large"
            variant="contained"
            color="primary"
          >
            Create Account
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default Register;