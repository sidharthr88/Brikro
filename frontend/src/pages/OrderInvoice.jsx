import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {Alert,Box,Button,CircularProgress,Container,Divider,Paper,Stack,Typography} from "@mui/material";
import api from "../api/axios";

function OrderInvoice() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await api.get(`/orders/${id}/invoice`);
        setInvoice(response.data.invoice);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load invoice."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Container>
    );
  }

  if (!invoice) return null;

  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 3 }}
        className="invoice-actions"
      >
        <Button onClick={() => navigate(-1)}>Back</Button>
        <Button
          variant="contained"
          onClick={() => window.print()}
          sx={{
            backgroundColor: "#ff7900",
            color: "#111",
            "&:hover": { backgroundColor: "#ff922e" }
          }}
        >
          Print / Save as PDF
        </Button>
      </Stack>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          backgroundColor: "#151515",
          color: "#f5f5f5",
          border: "1px solid #303030",
          borderRadius: 3
        }}
        className="invoice-paper"
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ color: "#ff7900", fontWeight: 600 }}
            >
              BRIKRO
            </Typography>
            <Typography color="text.secondary">
              Smart Supplies. Smart Savings. Smarter Sites.
            </Typography>
          </Box>

          <Box sx={{ textAlign: "right" }}>
            <Typography variant="h5">INVOICE</Typography>
            <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
              {invoice.invoiceNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatDate(invoice.orderDate)}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ borderColor: "#444", mb: 3 }} />

        <Typography variant="h6" sx={{ mb: 1 }}>
          Bill to
        </Typography>
        <Typography>{invoice.buyer?.name || "Customer"}</Typography>
        <Typography color="text.secondary">
          {invoice.buyer?.email || ""}
        </Typography>
        <Typography color="text.secondary">
          {invoice.buyer?.phone || ""}
        </Typography>

        <Box sx={{ mt: 4, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Order details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Order ID: {invoice.orderId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Order status: {invoice.orderStatus}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Payment status: {invoice.paymentStatus}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "#444", mb: 2 }} />

        <Typography variant="h6">
          {invoice.material?.title || "Material"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Category: {invoice.material?.category || "—"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Listing location: {invoice.material?.location || "—"}
        </Typography>

        <Stack spacing={1.5} sx={{ mt: 3 }}>
          <Stack direction="row" justifyContent="space-between" gap={2}>
            <Typography>Unit price</Typography>
            <Typography>
              ₹{Number(invoice.material?.price || 0).toLocaleString("en-IN")}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" gap={2}>
            <Typography>Quantity</Typography>
            <Typography>{invoice.quantity}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" gap={2}>
            <Typography>Material subtotal</Typography>
            <Typography>
              ₹{Number(invoice.materialAmount).toLocaleString("en-IN")}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" gap={2}>
            <Typography>Transport fee (paid separately)</Typography>
            <Typography>
              ₹{Number(invoice.transportFee).toLocaleString("en-IN")}
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ borderColor: "#444", my: 3 }} />

        <Stack direction="row" justifyContent="space-between" gap={2}>
          <Typography variant="h6">Amount payable to BRIKRO</Typography>
          <Typography variant="h6" sx={{ color: "#ff7900" }}>
            ₹{Number(invoice.materialAmount).toLocaleString("en-IN")}
          </Typography>
        </Stack>

        <Typography sx={{ mt: 2 }} color="text.secondary" variant="body2">
          Amount paid to BRIKRO: ₹
          {Number(invoice.amountPaidToBrikro).toLocaleString("en-IN")}
        </Typography>

        <Typography sx={{ mt: 1 }} color="text.secondary" variant="body2">
          Transport charges are separate and are payable directly to the
          transporter. They are not included in the material payment received
          by BRIKRO.
        </Typography>

        {invoice.paymentStatus !== "paid" && (
          <Alert severity="warning" sx={{ mt: 3 }} className="invoice-actions">
            This order has not been marked as paid. This is an order summary,
            not a payment receipt.
          </Alert>
        )}

        <Divider sx={{ borderColor: "#444", mt: 4, mb: 2 }} />

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center" }}
        >
          Thank you for choosing BRIKRO.
        </Typography>
      </Paper>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          body {
            background: white !important;
            color: black !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .invoice-actions {
            display: none !important;
          }

          .invoice-paper {
            background: white !important;
            color: black !important;
            border: 1px solid #ddd !important;
            box-shadow: none !important;
          }

          .invoice-paper .MuiTypography-root {
            color: black !important;
          }
        }
      `}</style>
    </Container>
  );
}

export default OrderInvoice;
