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
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        `/auth/reset-password/${token}`,
        {
          password,
        }
      );

      setMessage(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to reset password."
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
            Reset Password
          </Typography>

          <Typography color="text.secondary" mb={4}>
            Create a new password for your BRIKRO account.
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              required
              sx={{ mb: 3 }}
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;