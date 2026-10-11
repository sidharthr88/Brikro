
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

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
  const [otpValues, setOtpValues] = useState({});

  const fetchDeliveries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/transporters/my-deliveries");
      setDeliveries(response.data.deliveries || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load your deliveries."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [fetchDeliveries]);

  const handleResendPickupOtp = async (orderId) => {
    setUpdatingId(orderId);
    setError("");
    setSuccess("");

    try {
      const response = await api.post(
        `/transporters/delivery/${orderId}/resend-pickup-otp`
      );

      setSuccess(
        response.data.message ||
          "A fresh pickup OTP has been sent to the seller."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to resend pickup OTP."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const handleCancelDelivery = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this delivery? It will become available for another transporter."
    );

    if (!confirmed) return;

    setUpdatingId(orderId);
    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        `/transporters/delivery/${orderId}/cancel`
      );

      setSuccess(
        response.data.message || "Delivery cancelled successfully."
      );

      setOtpValues((current) => ({
        ...current,
        [orderId]: "",
      }));

      await fetchDeliveries();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to cancel delivery."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const handleOtpVerification = async (orderId, type) => {
    const otp = otpValues[orderId] || "";

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the six-digit OTP.");
      setSuccess("");
      return;
    }

    setUpdatingId(orderId);
    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        `/transporters/delivery/${orderId}/verify-${type}`,
        { otp }
      );

      setSuccess(
        response.data.message || "OTP verified successfully."
      );

      setOtpValues((current) => ({
        ...current,
        [orderId]: "",
      }));

      await fetchDeliveries();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "OTP verification failed."
      );
    } finally {
      setUpdatingId("");
    }
  };

  const handleStatusUpdate = async (orderId, status) => {
    setUpdatingId(orderId);
    setError("");
    setSuccess("");

    try {
      const response = await api.put(
        `/transporters/delivery/${orderId}/status`,
        { status }
      );

      setSuccess(
        response.data.message || "Delivery status updated."
      );

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

  const handleOtpChange = (orderId, value) => {
    setOtpValues((current) => ({
      ...current,
      [orderId]: value.replace(/\D/g, "").slice(0, 6),
    }));
  };

  const actionButtonStyles = {
    backgroundColor: "#FF6B00",
    color: "#FFFFFF",
    fontWeight: 700,
    px: 3,
    py: 1.2,
    "&:hover": {
      backgroundColor: "#E85F00",
    },
    "&.Mui-disabled": {
      backgroundColor: "#75401F",
      color: "#DDDDDD",
    },
  };

  const otpFieldStyles = {
    "& .MuiOutlinedInput-root": {
      backgroundColor: "#202020",
      color: "#FFFFFF",
      "& fieldset": {
        borderColor: "#555555",
      },
      "&:hover fieldset": {
        borderColor: "#FF6B00",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#FF6B00",
      },
    },
    "& .MuiInputLabel-root": {
      color: "#B0B0B0",
    },
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
              No deliveries yet
            </Typography>

            <Typography sx={{ color: "#B0B0B0", mb: 4 }}>
              Deliveries you accept will appear here.
            </Typography>

            <Button
              variant="contained"
              onClick={() =>
                navigate("/transporter/available-deliveries")
              }
              sx={actionButtonStyles}
            >
              Find Deliveries
            </Button>
          </Paper>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
            }}
          >
            {deliveries.map((delivery) => {
              const currentStatus = delivery.status;
              const isUpdating = updatingId === delivery._id;

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
                    sx={{
                      color: "#FFFFFF",
                      fontWeight: 800,
                      mb: 2,
                    }}
                  >
                    {delivery.material?.title ||
                      "Construction material"}
                  </Typography>

                  <Typography sx={{ color: "#B0B0B0", mb: 1 }}>
                    Quantity: {delivery.quantity}
                  </Typography>

                  <Typography sx={{ color: "#B0B0B0", mb: 1 }}>
                    Pickup:{" "}
                    {delivery.material?.location || "Not specified"}
                  </Typography>

                  <Typography sx={{ color: "#B0B0B0", mb: 2 }}>
                    Delivery:{" "}
                    {delivery.deliveryAddress || "Not specified"}
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
                    <Typography
                      sx={{ color: "#FFFFFF", fontWeight: 700 }}
                    >
                      Status:{" "}
                      {statusLabel[currentStatus] || currentStatus}
                    </Typography>
                  </Box>

                  {currentStatus === "confirmed" && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 2,
                      }}
                    >
                      <Typography sx={{ color: "#B0B0B0" }}>
                        Enter the six-digit pickup OTP provided to the
                        seller.
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          flexWrap: "wrap",
                          alignItems: "flex-start",
                        }}
                      >
                        <TextField
                          label="Pickup OTP"
                          value={otpValues[delivery._id] || ""}
                          onChange={(event) =>
                            handleOtpChange(
                              delivery._id,
                              event.target.value
                            )
                          }
                          inputProps={{
                            inputMode: "numeric",
                            maxLength: 6,
                          }}
                          sx={otpFieldStyles}
                        />

                        <Button
                          variant="contained"
                          disabled={Boolean(updatingId)}
                          onClick={() =>
                            handleOtpVerification(
                              delivery._id,
                              "pickup"
                            )
                          }
                          sx={actionButtonStyles}
                        >
                          {isUpdating ? (
                            <CircularProgress
                              size={22}
                              color="inherit"
                            />
                          ) : (
                            "Verify Pickup OTP"
                          )}
                        </Button>
                      </Box>

                      <Button
                        variant="outlined"
                        disabled={Boolean(updatingId)}
                        onClick={() =>
                          handleResendPickupOtp(delivery._id)
                        }
                        sx={{
                          borderColor: "#FF6B00",
                          color: "#FF6B00",
                          fontWeight: 700,
                          "&:hover": {
                            borderColor: "#FF8C33",
                            backgroundColor: "#22150D",
                          },
                          "&.Mui-disabled": {
                            borderColor: "#75401F",
                            color: "#75401F",
                          },
                        }}
                      >
                        {isUpdating ? (
                          <CircularProgress
                            size={20}
                            sx={{ color: "#FF6B00" }}
                          />
                        ) : (
                          "Resend Pickup OTP"
                        )}
                      </Button>
                      
                    <Button
                      variant="outlined"
                      color="error"
                      disabled={Boolean(updatingId)}
                      onClick={() => handleCancelDelivery(delivery._id)}
                      sx={{
                        borderColor: "#F44336",
                        color: "#F44336",
                        fontWeight: 700,
                        "&:hover": {
                          borderColor: "#FF6659",
                          backgroundColor: "#241010",
                        },
                      }}
                    >
                      {isUpdating ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        "Cancel Delivery"
                      )}
                    </Button>

                    </Box>
                  )}

                  {currentStatus === "picked_up" && (
                    <Button
                      variant="contained"
                      disabled={Boolean(updatingId)}
                      onClick={() =>
                        handleStatusUpdate(
                          delivery._id,
                          "in_transit"
                        )
                      }
                      sx={actionButtonStyles}
                    >
                      {isUpdating ? (
                        <CircularProgress
                          size={22}
                          color="inherit"
                        />
                      ) : (
                        "Mark as In Transit"
                      )}
                    </Button>
                  )}

                  {currentStatus === "in_transit" && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                      }}
                    >
                      <Typography sx={{ color: "#B0B0B0" }}>
                        Enter the six-digit delivery OTP provided to the
                        buyer.
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          flexWrap: "wrap",
                          alignItems: "flex-start",
                        }}
                      >
                        <TextField
                          label="Delivery OTP"
                          value={otpValues[delivery._id] || ""}
                          onChange={(event) =>
                            handleOtpChange(
                              delivery._id,
                              event.target.value
                            )
                          }
                          inputProps={{
                            inputMode: "numeric",
                            maxLength: 6,
                          }}
                          sx={otpFieldStyles}
                        />

                        <Button
                          variant="contained"
                          disabled={Boolean(updatingId)}
                          onClick={() =>
                            handleOtpVerification(
                              delivery._id,
                              "delivery"
                            )
                          }
                          sx={actionButtonStyles}
                        >
                          {isUpdating ? (
                            <CircularProgress
                              size={22}
                              color="inherit"
                            />
                          ) : (
                            "Verify Delivery OTP"
                          )}
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {currentStatus === "delivered" && (
                    <Typography
                      sx={{ color: "#81C784", fontWeight: 700 }}
                    >
                      Delivery completed successfully.
                    </Typography>
                  )}

                  {currentStatus === "cancelled" && (
                    <Typography
                      sx={{ color: "#B0B0B0", fontWeight: 700 }}
                    >
                      This delivery was cancelled.
                    </Typography>
                  )}
                </Paper>
              );
            })}
          </Box>
        )}

        <Button
          variant="outlined"
          onClick={() => navigate("/transporter/dashboard")}
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
