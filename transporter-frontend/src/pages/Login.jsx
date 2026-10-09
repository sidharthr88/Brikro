import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {Box,Button,Container,Paper,TextField,Typography} from "@mui/material";
import api from "../api/axios";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password
      });

      if (response.data.user.role !== "transporter") {
        setError(
          "Only transporter accounts can access this application."
        );
        return;
      }

      localStorage.setItem(
        "transporterToken",
        response.data.token
      );

      navigate("/dashboard");
    } catch (error) {
      setError(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#0A0A0A",
        color: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        pt: 10,
        pb: 6,
        background:
          "radial-gradient(circle at 50% 35%, rgba(255,107,0,0.10), transparent 40%)"
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            backgroundColor: "#151515",
            border: "1px solid #292929",
            borderRadius: 4,
            p: {
              xs: 4,
              md: 6
            },
            boxShadow:
              "0 25px 80px rgba(0,0,0,0.45)"
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              mb: 5
            }}
          >
            <Typography
              sx={{
                color: "#FFFFFF",
                fontSize: "1.5rem",
                fontWeight: 800,
                letterSpacing: "1px",
                mb: 1
              }}
            >
              BRIKRO{" "}
              <Box
                component="span"
                sx={{
                  color: "#FF6B00"
                }}
              >
                TRANSPORT
              </Box>
            </Typography>

            <Typography
              sx={{
                color: "#FF6B00",
                fontWeight: 700,
                letterSpacing: "1px",
                mb: 2
              }}
            >
              TRANSPORTER PORTAL
            </Typography>

            <Typography
              variant="h4"
              sx={{
                color: "#FFFFFF",
                fontWeight: 800,
                mb: 1
              }}
            >
              Welcome back
            </Typography>

            <Typography
              sx={{
                color: "#B0B0B0",
                lineHeight: 1.7
              }}
            >
              Sign in to manage your BRIKRO deliveries.
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5
            }}
          >
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              sx={{
                "& .MuiInputLabel-root": {
                  color: "#FFFFFF"
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#FF6B00"
                },
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  backgroundColor: "#101010",
                  "& fieldset": {
                    borderColor: "#555555"
                  },
                  "&:hover fieldset": {
                    borderColor: "#FFFFFF"
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF6B00"
                  }
                },
                "& .MuiOutlinedInput-input": {
                  color: "#FFFFFF"
                }
              }}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              sx={{
                "& .MuiInputLabel-root": {
                  color: "#FFFFFF"
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#FF6B00"
                },
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF",
                  backgroundColor: "#101010",
                  "& fieldset": {
                    borderColor: "#555555"
                  },
                  "&:hover fieldset": {
                    borderColor: "#FFFFFF"
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#FF6B00"
                  }
                },
                "& .MuiOutlinedInput-input": {
                  color: "#FFFFFF"
                }
              }}
            />

            {error && (
              <Typography
                sx={{
                  color: "#ff5252",
                  fontSize: "0.9rem"
                }}
              >
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                backgroundColor: "#FF6B00",
                color: "#FFFFFF",
                py: 1.5,
                fontWeight: 800,
                fontSize: "1rem",
                mt: 1,
                "&:hover": {
                  backgroundColor: "#E85F00"
                }
              }}
            >
              Sign In
            </Button>
          </Box>

          <Box
            sx={{
              textAlign: "center",
              mt: 3
            }}
          >
            <Typography
              component="span"
              sx={{
                color: "#B0B0B0",
                fontSize: "0.95rem"
              }}
            >
              New here?{" "}
            </Typography>

            <Button
              onClick={() => navigate("/register")}
              sx={{
                color: "#FF6B00",
                fontWeight: 700,
                minWidth: "auto",
                padding: 0,
                fontSize: "0.95rem",
                "&:hover": {
                  backgroundColor: "transparent",
                  color: "#FF8533"
                }
              }}
            >
              Register
            </Button>
          </Box>

          <Box
            sx={{
              mt: 5,
              pt: 3,
              borderTop: "1px solid #292929",
              textAlign: "center"
            }}
          >
            <Typography
              sx={{
                color: "#666666",
                fontSize: "0.8rem"
              }}
            >
              BRIKRO TRANSPORT
            </Typography>

            <Typography
              sx={{
                color: "#888888",
                fontSize: "0.8rem",
                mt: 0.5
              }}
            >
              Moving materials. Connecting sites. Powering reuse.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login;

