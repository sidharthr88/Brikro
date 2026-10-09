import { useCallback, useEffect, useState } from "react";
import {Alert,Box,Button,CircularProgress,Container,Paper,Typography,} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function AvailableDeliveries() {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/transporters/available");
      setDeliveries(response.data.deliveries || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load available deliveries."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleAcceptDelivery = async (orderId) => {
    setAcceptingId(orderId);
    setError("");
    setSuccess("");

    try {
      const response = await api.post(
        `/transporters/accept/${orderId}`
      );

      setSuccess(
        response.data.message || "Delivery accepted successfully."
      );

      // Remove the accepted delivery from the current list.
      setDeliveries((current) =>
        current.filter((delivery) => delivery._id !== orderId)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to accept this delivery. Please try again."
      );

      // Refresh because another transporter may have accepted it.
      await fetchDeliveries();
    } finally {
      setAcceptingId("");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#0A0A0A",
        color: "#FFFFFF",
        pt: 12,
        pb: 8,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ mb: 5 }}>
          <Typography
            sx={{
              color: "#FF6B00",
              fontWeight: 700,
              letterSpacing: "2px",
              mb: 1,
            }}
          >
            BRIKRO TRANSPORT
          </Typography>

          <Typography
            variant="h3"
            sx={{
              color: "#FFFFFF",
              fontWeight: 800,
              mb: 1,
              fontSize: { xs: "2rem", md: "3rem" },
            }}
          >
            Available Deliveries
          </Typography>

          <Typography sx={{ color: "#B0B0B0", lineHeight: 1.7 }}>
            View and accept paid delivery requests assigned to transporters.
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            onClose={() => setSuccess("")}
            sx={{ mb: 3 }}
          >
            {success}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              py: 10,
            }}
          >
            <CircularProgress sx={{ color: "#FF6B00" }} />
          </Box>
        ) : deliveries.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              backgroundColor: "#151515",
              border: "1px solid #292929",
              borderRadius: 4,
              p: { xs: 4, md: 6 },
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{ color: "#FFFFFF", fontWeight: 700, mb: 2 }}
            >
              No deliveries available
            </Typography>

            <Typography sx={{ color: "#B0B0B0", mb: 4 }}>
              New eligible delivery requests will appear here when available.
            </Typography>

            <Button
              variant="outlined"
              onClick={fetchDeliveries}
              sx={{
                borderColor: "#FF6B00",
                color: "#FF6B00",
                mr: 1,
                "&:hover": {
                  borderColor: "#FF6B00",
                  backgroundColor: "rgba(255,107,0,0.08)",
                },
              }}
            >
              Refresh
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate("/dashboard")}
              sx={{
                borderColor: "#555555",
                color: "#FFFFFF",
                "&:hover": {
                  borderColor: "#FFFFFF",
                  backgroundColor: "#222222",
                },
              }}
            >
              Back to Dashboard
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {deliveries.map((delivery) => (
              <Paper
                key={delivery._id}
                elevation={0}
                sx={{
                  backgroundColor: "#151515",
                  border: "1px solid #292929",
                  borderRadius: 4,
                  p: { xs: 3, md: 4 },
                }}
              >
                <Typography
                  sx={{
                    color: "#FF6B00",
                    fontWeight: 700,
                    mb: 2,
                    letterSpacing: "1px",
                  }}
                >
                  DELIVERY REQUEST
                </Typography>

                <Typography
                  variant="h5"
                  sx={{ color: "#FFFFFF", fontWeight: 800, mb: 2 }}
                >
                  {delivery.material?.title || "Construction material"}
                </Typography>

                <Typography sx={{ color: "#B0B0B0", mb: 1 }}>
                  Category: {delivery.material?.category || "Not specified"}
                </Typography>

                <Typography sx={{ color: "#B0B0B0", mb: 1 }}>
                  Quantity: {delivery.quantity}
                </Typography>

                <Typography sx={{ color: "#B0B0B0", mb: 1 }}>
                  Pickup: {delivery.material?.location || "Not specified"}
                </Typography>

                <Typography sx={{ color: "#B0B0B0", mb: 1 }}>
                  Delivery: {delivery.deliveryAddress || "Not specified"}
                </Typography>

                <Typography sx={{ color: "#B0B0B0", mb: 3 }}>
                  Distance from you:{" "}
                  {typeof delivery.distanceInKm === "number"
                    ? `${delivery.distanceInKm} km`
                    : "Unavailable"}
                </Typography>

                <Button
                  variant="contained"
                  disabled={Boolean(acceptingId)}
                  onClick={() => handleAcceptDelivery(delivery._id)}
                  sx={{
                    backgroundColor: "#FF6B00",
                    color: "#FFFFFF",
                    fontWeight: 700,
                    px: 4,
                    py: 1.2,
                    "&:hover": {
                      backgroundColor: "#E85F00",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "#75401F",
                      color: "#DDDDDD",
                    },
                  }}
                >
                  {acceptingId === delivery._id ? (
                    <>
                      <CircularProgress
                        size={18}
                        sx={{ color: "#FFFFFF", mr: 1 }}
                      />
                      Accepting...
                    </>
                  ) : (
                    "Accept Delivery"
                  )}
                </Button>
              </Paper>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default AvailableDeliveries;
