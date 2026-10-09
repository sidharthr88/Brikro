import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Chip, CircularProgress, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders/myorders");
        const paidOrders = (response.data.orders || []).filter(
        (order) => order.paymentStatus === "paid"
        );

setOrders(paidOrders);

      } catch (error) {
        console.error(
          "Failed to fetch orders:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={700} mb={1}>
        My Orders
      </Typography>

      <Typography color="text.secondary" mb={5}>
        Track your purchases and order status.
      </Typography>

      {orders.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 7 }}>
            <Typography variant="h5" fontWeight={600} mb={1}>
               No completed purchases yet
            </Typography>

            <Typography color="text.secondary" mb={3}>
              Your purchased materials will appear here.
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/materials")}
            >
              Browse Materials
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 3,
                    flexWrap: "wrap",
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {order.material?.title || "Material"}
                    </Typography>

                    <Typography color="text.secondary" mt={1}>
                      Quantity: {order.quantity}
                    </Typography>

                    <Typography color="text.secondary">
                      Total: ₹{order.totalAmount}
                    </Typography>

                    <Typography color="text.secondary">
                      Delivery:{" "}
                      {order.deliveryMethod === "transporter"
                        ? "Transporter"
                        : "Self Pickup"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={`Payment: ${order.paymentStatus}`}
                      color={
                        order.paymentStatus === "paid"
                          ? "success"
                          : "warning"
                      }
                    />

                    <Chip
                      label={`Order: ${order.status}`}
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Button
                  variant="outlined"
                  sx={{ mt: 3 }}
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  View Order
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default MyOrders;