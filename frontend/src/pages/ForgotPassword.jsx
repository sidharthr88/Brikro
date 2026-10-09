import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import api from "../api/axios";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/forgot-password", {
        email,
      });

      setMessage(response.data.message);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to send reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Card>
        <CardContent sx={{ p: 5 }}>
          <Typography variant="h4" fontWeight={700} mb={1}>
            Forgot Password?
          </Typography>

          <Typography color="text.secondary" mb={4}>
            Enter your email and we'll send you a password reset link.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </Box>

          {message && (
            <Typography color="success.main" mt={3}>
              {message}
            </Typography>
          )}

          {error && (
            <Typography color="error.main" mt={3}>
              {error}
            </Typography>
          )}

          <Button
            component={Link}
            to="/login"
            fullWidth
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

export default ForgotPassword;