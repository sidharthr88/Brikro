import { useEffect, useState } from "react";
import {Container, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import api from "../../api/axios";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/admin/orders");
      setOrders(response.data.orders);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 500,
          mb: 1
        }}
      >
        Orders
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          mb: 4
        }}
      >
        Monitor all BRIKRO orders.
      </Typography>

      {loading ? (
        <Typography>Loading orders...</Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "#151515",
            border: "1px solid #262626",
            borderRadius: 3
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Order ID</TableCell>
                <TableCell>Buyer</TableCell>
                <TableCell>Material</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Payment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Delivery</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {orders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    {order._id.slice(-6)}
                  </TableCell>

                  <TableCell>
                    {order.buyer?.name || "Unknown"}
                  </TableCell>

                  <TableCell>
                    {order.material?.title || "Unknown"}
                  </TableCell>

                  <TableCell>
                    {order.quantity}
                  </TableCell>

                  <TableCell>
                    ₹{order.totalAmount}
                  </TableCell>

                  <TableCell>
                    {order.paymentStatus}
                  </TableCell>

                  <TableCell>
                    {order.status}
                  </TableCell>

                  <TableCell>
                    {order.deliveryMethod === "self_pickup"
                      ? "Self Pickup"
                      : "Transporter"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default AdminOrders;