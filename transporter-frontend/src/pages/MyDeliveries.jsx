import { useCallback, useEffect, useState } from "react";
import {Alert,Box,Button,CircularProgress,Container,Paper,Typography,} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const nextStatus = {
  confirmed: { value: "picked_up", label: "Mark as Picked Up" },
  picked_up: { value: "in_transit", label: "Mark as In Transit" },
  in_transit: { value: "delivered", label: "Mark as Delivered" },
};

const statusLabel = {
  confirmed: "Accepted",
  picked_up: "Picked Up",
  in_transit: "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

function MyDeliveries() {
  const navigate = useNavigate();

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/transporters/my-deliveries");
      setDeliveries(response.data.deliveries || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load your deliveries."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingId(orderId);
    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        `/transporters/delivery/${orderId}/status`,
        { status }
      );

      setSuccess(response.data.message || "Delivery status updated.");

      // Refresh to display the latest status returned by the backend.
      await fetchDeliveries();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to update delivery status."
      );
    } finally {
      setUpdatingId("");
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
            My Deliveries
          </Typography>

          <Typography sx={{ color: "#B0B0B0", lineHeight: 1.7 }}>
            View your accepted deliveries and update their progress.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
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
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
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
              No deliveries yet
            </Typography>

            <Typography sx={{ color: "#B0B0B0", mb: 4 }}>
              Deliveries you accept will appear here.
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/available-deliveries")}
              sx={{
                backgroundColor: "#FF6B00",
                color: "#FFFFFF",
                fontWeight: 700,
                "&:hover": { backgroundColor: "#E85F00" },
              }}
            >
              Find Deliveries
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {deliveries.map((delivery) => {
              const currentStatus = delivery.status;
              const action = nextStatus[currentStatus];

              return (
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
                      letterSpacing: "1px",
                      mb: 2,
                    }}
                  >
                    ASSIGNED DELIVERY
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{ color: "#FFFFFF", fontWeight: 800, mb: 2 }}
                  >
                    {delivery.material?.title || "Construction material"}
                  </Typography>

                  <Typography sx={{ color: "#B0B0B0", mb: 1 }}>
                    Quantity: {delivery.quantity}
                  </Typography>

                  <Typography sx={{ color: "#B0B0B0", mb: 1 }}>
                    Pickup: {delivery.material?.location || "Not specified"}
                  </Typography>

                  <Typography sx={{ color: "#B0B0B0", mb: 2 }}>
                    Delivery: {delivery.deliveryAddress || "Not specified"}
                  </Typography>

                  <Box
                    sx={{
                      display: "inline-flex",
                      backgroundColor: "#292929",
                      border: "1px solid #444444",
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                      mb: 3,
                    }}
                  >
                    <Typography sx={{ color: "#FFFFFF", fontWeight: 700 }}>
                      Status: {statusLabel[currentStatus] || currentStatus}
                    </Typography>
                  </Box>

                  <Box>
                    {action ? (
                      <Button
                        variant="contained"
                        disabled={Boolean(updatingId)}
                        onClick={() =>
                          handleStatusUpdate(delivery._id, action.value)
                        }
                        sx={{
                          backgroundColor: "#FF6B00",
                          color: "#FFFFFF",
                          fontWeight: 700,
                          px: 3,
                          py: 1.2,
                          "&:hover": { backgroundColor: "#E85F00" },
                          "&.Mui-disabled": {
                            backgroundColor: "#75401F",
                            color: "#DDDDDD",
                          },
                        }}
                      >
                        {updatingId === delivery._id ? (
                          <>
                            <CircularProgress
                              size={18}
                              sx={{ color: "#FFFFFF", mr: 1 }}
                            />
                            Updating...
                          </>
                        ) : (
                          action.label
                        )}
                      </Button>
                    ) : (
                      <Typography
                        sx={{
                          color:
                            currentStatus === "delivered"
                              ? "#81C784"
                              : "#B0B0B0",
                          fontWeight: 700,
                        }}
                      >
                        {currentStatus === "delivered"
                          ? "Delivery completed"
                          : "No further status updates available"}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}

        <Button
          variant="outlined"
          onClick={() => navigate("/dashboard")}
          sx={{
            mt: 4,
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
      </Container>
    </Box>
  );
}

export default MyDeliveries;

