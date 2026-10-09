import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import api from "../api/axios";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", response.data.token);

    const user = response.data.user;
    const from = location.state?.from;

    if (user.role === "admin") {
      navigate("/admin", { replace: true });
      return;
    }

    navigate(
      {
        pathname: from?.pathname || "/materials",
        search: from?.search || "",
        hash: from?.hash || "",
      },
      {
        replace: true,
        state: from?.state || null,
      }
    );
  } catch (error) {
    setError(
      error.response?.data?.message || "Login failed"
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
            fontWeight: 200,
            mb: 1,
          }}
        >
          Login
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            mb: 4,
          }}
        >
          or{" "}
          <Box
            component="span"
            onClick={() => navigate("/register")}
            sx={{
              color: "#FFFFFF",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            create an account
          </Box>
        </Typography>

        <Box
          component="form"
          onSubmit={handleLogin}
        >
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

          <Button
            component={Link}
            to="/forgot-password"
            sx={{
              display: "block",
              ml: "auto",
              mb: 2,
              textTransform: "none",
            }}
          >
            Forgot password?
          </Button>

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

          <Button
            type="submit"
            fullWidth
            size="large"
            variant="contained"
            color="primary"
          >
            Login
          </Button>
        </Box>

        <Box
          component="footer"
          sx={{
            py: 4,
            borderTop: "1px solid #262626",
            textAlign: "center",
          }}
        >
          <Container maxWidth="lg">
            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.85rem",
                mb: 1,
              }}
            >
              Smart Supplies. Smart Savings. Smarter Sites.
            </Typography>

            <Typography
              sx={{
                color: "#666666",
                fontSize: "0.7rem",
              }}
            >
              © 2026 BRIKRO. All rights reserved. | Privacy Policy | Terms of Service
            </Typography>
          </Container>
        </Box>
      </Box>
    </Container>
  );
}

export default Login;