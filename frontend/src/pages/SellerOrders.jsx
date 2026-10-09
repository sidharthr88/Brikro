import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Chip, CircularProgress, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const handleStatusUpdate = async (orderId, status) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, {
      status,
    });

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order._id === orderId ? response.data.order : order
      )
    );
  } catch (error) {
    alert(
      error.response?.data?.message ||
        "Unable to update order status."
    );
  }
};

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const response = await api.get("/orders/sellerorders");

        const paidOrders = (response.data.orders || []).filter(
          (order) => order.paymentStatus === "paid"
        );

        setOrders(paidOrders);
      } catch (error) {
        console.error(
          "Failed to fetch seller orders:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
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
        Seller Orders
      </Typography>

      <Typography color="text.secondary" mb={5}>
        Manage orders placed for your materials.
      </Typography>

      {orders.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 7 }}>
            <Typography variant="h5" fontWeight={600} mb={1}>
              No sales yet
            </Typography>

            <Typography color="text.secondary" mb={3}>
              Orders for your materials will appear here.
            </Typography>

            <Button
              variant="contained"
              onClick={() => navigate("/my-listings")}
            >
              View My Listings
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
                      Buyer: {order.buyer?.name || "Buyer"}
                    </Typography>

                    <Typography color="text.secondary">
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
                      label="Payment: paid"
                      color="success"
                    />

                    <Chip
                      label={`Order: ${order.status}`}
                      variant="outlined"
                    />
                  </Box>
                </Box>

               <Box
  sx={{
    display: "flex",
    gap: 2,
    mt: 3,
    flexWrap: "wrap",
  }}
>
  <Button
    variant="outlined"
    onClick={() => navigate(`/orders/${order._id}`)}
  >
    View Order
  </Button>

  {order.status === "pending" && (
    <Button
      variant="contained"
      onClick={() => handleStatusUpdate(order._id, "confirmed")}
    >
      Confirm Order
    </Button>
  )}

  {order.status === "confirmed" &&
    order.deliveryMethod === "transporter" && (
      <Button
        variant="contained"
        onClick={() => handleStatusUpdate(order._id, "picked_up")}
      >
        Mark Picked Up
      </Button>
    )}

  {order.status === "picked_up" && (
    <Button
      variant="contained"
      onClick={() => handleStatusUpdate(order._id, "in_transit")}
    >
      Mark In Transit
    </Button>
  )}

  {order.status === "in_transit" && (
    <Button
      variant="contained"
      onClick={() => handleStatusUpdate(order._id, "delivered")}
    >
      Mark Delivered
    </Button>
  )}

  {order.status === "confirmed" &&
    order.deliveryMethod === "self_pickup" && (
      <Button
        variant="contained"
        onClick={() => handleStatusUpdate(order._id, "delivered")}
      >
        Mark Delivered
      </Button>
    )}
</Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default SellerOrders;