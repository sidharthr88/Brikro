import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data.order);
      } catch (error) {
        console.error(
          "Failed to fetch order:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelling(true);

    try {
      const response = await api.put(`/orders/${id}/cancel`);
      setOrder(response.data.order);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Unable to cancel the order."
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!order) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h5" mb={3}>
          Order not found
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/my-orders")}
        >
          Back to My Orders
        </Button>
      </Container>
    );
  }

  const canCancel =
    order.status === "pending" ||
    order.status === "confirmed";

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Button
        onClick={() => navigate("/my-orders")}
        sx={{ mb: 4 }}
      >
        ← Back to My Orders
      </Button>

      <Typography variant="h3" fontWeight={700} mb={1}>
        Order Details
      </Typography>

      <Typography color="text.secondary" mb={4}>
        Order ID: {order._id}
      </Typography>

      <Card>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Typography
            variant="h5"
            fontWeight={700}
            mb={1}
          >
            {order.material?.title || "Material"}
          </Typography>

          <Typography
            color="text.secondary"
            mb={4}
          >
            {order.material?.category || "Construction Material"}
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap",
              mb: 4,
            }}
          >
            <Chip
              label={`Order: ${order.status}`}
              variant="outlined"
            />

            <Chip
              label={`Payment: ${order.paymentStatus}`}
              color={
                order.paymentStatus === "paid"
                  ? "success"
                  : "warning"
              }
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: "grid", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Typography color="text.secondary">
                Quantity
              </Typography>

              <Typography fontWeight={600}>
                {order.quantity}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Typography color="text.secondary">
                Delivery Method
              </Typography>

              <Typography fontWeight={600}>
                {order.deliveryMethod === "transporter"
                  ? "Transporter Delivery"
                  : "Self Pickup"}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Typography color="text.secondary">
                Transport Fee
              </Typography>

              <Typography fontWeight={600}>
                ₹{order.transportFee || 0}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Typography color="text.secondary">
                Total Amount
              </Typography>

              <Typography
                fontWeight={700}
                color="primary.main"
              >
                ₹{order.totalAmount}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />

          {order.deliveryMethod === "transporter" ? (
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                mb={1}
              >
                Delivery Address
              </Typography>

              <Typography color="text.secondary">
                {order.deliveryAddress || "Not provided"}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
                mb={1}
              >
                Pickup
              </Typography>

              <Typography color="text.secondary">
                Collect the material from the seller's location.
              </Typography>
            </Box>
          )}
        
          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 4,
              mb: 2,
              backgroundColor: "#ff7900",
              color: "#111",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#ff922e",
              },
            }}
            onClick={() => navigate(`/orders/${id}/invoice`)}
          >
            Download BRIKRO Invoice
            
          </Button>

          {canCancel && (
            <Button
              fullWidth
              variant="outlined"
              color="error"
              sx={{ mt: 1 }}
              onClick={handleCancelOrder}
              disabled={cancelling}
            >
              {cancelling ? "Cancelling..." : "Cancel Order"}
            </Button>
          )}

        </CardContent>
      </Card>
    </Container>
  );
}

export default OrderDetails;