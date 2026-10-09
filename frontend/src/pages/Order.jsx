import { useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {Box,Button,Container,TextField,Typography} from "@mui/material";
import {MapContainer,TileLayer,Marker,useMapEvents} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api/axios";

function DeliveryMarker({ setDeliveryLocation }) {
  useMapEvents({
    click(event) {
      setDeliveryLocation({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng
      });
    }
  });

  return null;
}

function Order() {
  const location = useLocation();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const material = location.state?.material;

  const [quantity, setQuantity] = useState(1);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState(null);
  const [locationSearch, setLocationSearch] = useState("");
  const [transporterNeeded, setTransporterNeeded] = useState(false);
  const [transportFee, setTransportFee] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!material) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Material information not available
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/materials")}
        >
          Back to Materials
        </Button>
      </Container>
    );
  }

  const materialAmount = material.price * quantity;
  const estimatedTotal = materialAmount + transportFee;

  const handlePlaceOrder = async () => {
    setError("");

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > material.quantity
    ) {
      setError("Please enter a valid quantity within the available stock.");
      return;
    }

    if (transporterNeeded && !deliveryAddress.trim()) {
      setError("Please enter your delivery address.");
      return;
    }

    if (transporterNeeded && !deliveryLocation) {
      setError("Please select your delivery location on the map.");
      return;
    }

    setLoading(true);

    try {
      let calculatedTransportFee = 0;

      if (transporterNeeded) {
        const response = await api.post(
          "/orders/calculate-transport-fee",
          {
            materialId: material._id,
            quantity
          }
        );

        calculatedTransportFee = response.data.transportFee;
      }

      setTransportFee(calculatedTransportFee);
      setShowSummary(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to calculate the transport fee."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError("");

    try {
      const orderResponse = await api.post("/orders", {
        materialId: material._id,
        quantity,
        deliveryAddress: transporterNeeded ? deliveryAddress : "",
        deliveryLocation: transporterNeeded ? deliveryLocation : null,
        deliveryMethod: transporterNeeded
          ? "transporter"
          : "self_pickup"
      });

      const order = orderResponse.data.order;

      const paymentResponse = await api.post(
        `/payments/create/${order._id}`
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: paymentResponse.data.amount,
        currency: paymentResponse.data.currency,
        name: "BRIKRO",
        description: `Material payment: ${material.title}`,
        order_id: paymentResponse.data.razorpayOrderId,
        handler: async function (response) {
          try {
            await api.post(`/payments/verify/${order._id}`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            navigate("/my-orders", {
              state: {
                order: {
                  ...order,
                  paymentStatus: "paid"
                }
              }
            });
          } catch (error) {
            setError(
              error.response?.data?.message ||
                "Payment verification failed. Please check your orders before retrying."
            );
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        },
        prefill: {
          name: "",
          email: ""
        },
        theme: {
          color: "#FF6B00"
        }
      };

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay checkout could not be loaded. Please refresh and try again."
        );
      }

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        );
        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong. Please try again."
      );
      setLoading(false);
    }
  };

  const handleLocationSearch = async () => {
    if (!locationSearch.trim()) {
      setError("Enter a location to search.");
      return;
    }

    setError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          `${locationSearch}, Thiruvananthapuram, Kerala, India`
        )}&limit=5&countrycodes=in`
      );

      if (!response.ok) {
        throw new Error("Location search failed.");
      }

      const data = await response.json();

      const result =
        data.find((item) =>
          item.display_name
            .toLowerCase()
            .includes("thiruvananthapuram")
        ) || data[0];

      if (!result) {
        setError("No matching location found.");
        return;
      }

      const latitude = parseFloat(result.lat);
      const longitude = parseFloat(result.lon);

      setDeliveryLocation({
        latitude,
        longitude
      });

      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], 16);
      }
    } catch (error) {
      setError(error.message || "Location search failed.");
    }
  };

  if (showSummary) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "2.2rem", md: "3rem" },
            mb: 2
          }}
        >
          Order Summary
        </Typography>

        <Typography sx={{ color: "text.secondary", mb: 5 }}>
          Review your order and payment details before proceeding.
        </Typography>

        <Box
          sx={{
            backgroundColor: "#151515",
            border: "1px solid #262626",
            borderRadius: 4,
            p: { xs: 3, md: 5 }
          }}
        >
          <Typography
            sx={{
              color: "primary.main",
              fontWeight: 600,
              mb: 1
            }}
          >
            {material.category}
          </Typography>

          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            {material.title}
          </Typography>

          <Typography sx={{ color: "text.secondary", mb: 4 }}>
            ₹{material.price} per unit
          </Typography>

          <Box
            sx={{
              borderTop: "1px solid #262626",
              borderBottom: "1px solid #262626",
              py: 3,
              mb: 3
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ color: "text.secondary" }}>
                Quantity
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {quantity}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ color: "text.secondary" }}>
                Material Amount
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                ₹{materialAmount}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ color: "text.secondary" }}>
                Delivery Method
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>
                {transporterNeeded ? "Transporter Delivery" : "Self Pickup"}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Typography sx={{ color: "text.secondary" }}>
                Transport Fee
              </Typography>
              <Typography sx={{ fontWeight: 600, textAlign: "right" }}>
                ₹{transportFee}
              </Typography>
            </Box>
          </Box>

          {transporterNeeded && (
            <Box
              sx={{
                p: 3,
                mb: 3,
                backgroundColor: "#242424",
                border: "1px solid #383838",
                borderRadius: 3
              }}
            >
              <Typography sx={{ fontWeight: 600, mb: 1 }}>
                Delivery Address
              </Typography>

              <Typography sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                {deliveryAddress}
              </Typography>
            </Box>
          )}

          {!transporterNeeded && (
            <Box
              sx={{
                p: 3,
                mb: 3,
                backgroundColor: "#242424",
                border: "1px solid #383838",
                borderRadius: 3
              }}
            >
              <Typography sx={{ fontWeight: 600, mb: 1 }}>
                Pickup Location
              </Typography>

              <Typography sx={{ color: "text.secondary" }}>
                {material.location}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              p: 3,
              mb: 3,
              backgroundColor: "#242424",
              border: "1px solid #383838",
              borderRadius: 3
            }}
          >
            <Typography sx={{ fontWeight: 700, mb: 2 }}>
              Payment Breakdown
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}>
              <Typography sx={{ color: "text.secondary" }}>
                Pay through BRIKRO
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                ₹{materialAmount}
              </Typography>
            </Box>

            <Typography
              sx={{
                color: "#B0B0B0",
                fontSize: "0.85rem",
                mb: 3
              }}
            >
              This is the material payment processed through Razorpay.
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 1 }}>
              <Typography sx={{ color: "text.secondary" }}>
                Pay transporter directly
              </Typography>
              <Typography sx={{ fontWeight: 700 }}>
                ₹{transportFee}
              </Typography>
            </Box>

            <Typography sx={{ color: "#B0B0B0", fontSize: "0.85rem" }}>
              {transporterNeeded
                ? "The transport fee is paid directly to the transporter, not through BRIKRO."
                : "No transport fee applies to self pickup."}
            </Typography>

            <Box
              sx={{
                borderTop: "1px solid #444444",
                mt: 3,
                pt: 2,
                display: "flex",
                justifyContent: "space-between",
                gap: 2
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>
                Estimated Total Cost
              </Typography>
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: "1.5rem",
                  fontWeight: 800
                }}
              >
                ₹{estimatedTotal}
              </Typography>
            </Box>
          </Box>

          {error && (
            <Typography sx={{ color: "#ff5252", mb: 3 }}>
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            size="large"
            variant="contained"
            color="primary"
            onClick={handleConfirmPayment}
            disabled={loading}
          >
            {loading ? "Preparing Payment..." : `Pay ₹${materialAmount} for Materials`}
          </Button>

          <Button
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => {
              setShowSummary(false);
              setError("");
            }}
            disabled={loading}
          >
            Back to Order
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography
        variant="h2"
        sx={{
          fontWeight: 600,
          fontSize: { xs: "2.2rem", md: "3rem" },
          mb: 2
        }}
      >
        Place Your Order
      </Typography>

      <Typography sx={{ color: "text.secondary", mb: 5 }}>
        Confirm the quantity and delivery details for your purchase.
      </Typography>

      <Box
        sx={{
          backgroundColor: "#151515",
          border: "1px solid #262626",
          borderRadius: 4,
          p: { xs: 3, md: 5 }
        }}
      >
        <Typography
          sx={{
            color: "primary.main",
            fontWeight: 600,
            mb: 1
          }}
        >
          {material.category}
        </Typography>

        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          {material.title}
        </Typography>

        <Typography sx={{ color: "text.secondary", mb: 4 }}>
          ₹{material.price} per unit
        </Typography>

        <TextField
          fullWidth
          type="number"
          label="Quantity"
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          inputProps={{
            min: 1,
            max: material.quantity,
            step: 1
          }}
          sx={{ mb: 3 }}
        />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 4,
            p: 2,
            border: "1px solid #383838",
            borderRadius: 3,
            backgroundColor: "#242424"
          }}
        >
          <input
            type="checkbox"
            checked={transporterNeeded}
            onChange={(event) => {
              setTransporterNeeded(event.target.checked);
              setTransportFee(0);
              setError("");
            }}
            style={{
              width: 18,
              height: 18,
              accentColor: "#FF6B00"
            }}
          />

          <Box>
            <Typography sx={{ fontWeight: 600 }}>
              I need a transporter
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.8rem",
                mt: 0.3
              }}
            >
              BRIKRO calculates the fee. You pay the transporter directly.
            </Typography>
          </Box>
        </Box>

        {transporterNeeded && (
          <>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Delivery Address"
              placeholder="Enter your complete delivery address"
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              sx={{ mb: 4 }}
            />

            <Typography sx={{ fontSize: "1rem", fontWeight: 600, mb: 1 }}>
              Delivery Location
            </Typography>

            <TextField
              fullWidth
              label="Search Delivery Location"
              placeholder="Example: Kariavattom, Thiruvananthapuram"
              value={locationSearch}
              onChange={(event) => setLocationSearch(event.target.value)}
              sx={{ mb: 2 }}
            />

            <Button
              variant="outlined"
              color="primary"
              onClick={handleLocationSearch}
              sx={{ mb: 3 }}
            >
              Search Location
            </Button>

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.85rem",
                mb: 2
              }}
            >
              Select the exact delivery location on the map.
            </Typography>

            <Box
              sx={{
                height: 400,
                borderRadius: 3,
                overflow: "hidden",
                mb: 2
              }}
            >
              <MapContainer
                center={[8.5241, 76.9366]}
                zoom={13}
                style={{
                  height: "100%",
                  width: "100%"
                }}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />

                <DeliveryMarker
                  setDeliveryLocation={setDeliveryLocation}
                />

                {deliveryLocation && (
                  <Marker
                    position={[
                      deliveryLocation.latitude,
                      deliveryLocation.longitude
                    ]}
                  />
                )}
              </MapContainer>
            </Box>

            {deliveryLocation && (
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: "0.85rem",
                  mb: 4
                }}
              >
                Delivery location selected
              </Typography>
            )}
          </>
        )}

        {!transporterNeeded && (
          <Box
            sx={{
              p: 3,
              mb: 4,
              border: "1px solid #383838",
              borderRadius: 3,
              backgroundColor: "#242424"
            }}
          >
            <Typography sx={{ fontWeight: 600, mb: 1 }}>
              Self Pickup
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "0.9rem",
                lineHeight: 1.6
              }}
            >
              You will collect the material from the seller's location.
            </Typography>

            <Typography
              sx={{
                color: "primary.main",
                fontSize: "0.9rem",
                fontWeight: 600,
                mt: 1
              }}
            >
              Pickup location: {material.location}
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            borderTop: "1px solid #262626",
            pt: 3,
            mb: 3
          }}
        >
          <Typography sx={{ color: "text.secondary", mb: 1 }}>
            Material Amount
          </Typography>

          <Typography sx={{ fontSize: "1.2rem", fontWeight: 600 }}>
            ₹{materialAmount}
          </Typography>
        </Box>

        {error && (
          <Typography sx={{ color: "#ff5252", mb: 3 }}>
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          size="large"
          variant="contained"
          color="primary"
          onClick={handlePlaceOrder}
          disabled={loading || material.quantity === 0}
        >
          {material.quantity === 0
            ? "Out of Stock"
            : loading
              ? "Calculating..."
              : "Review Order"}
        </Button>
      </Box>
    </Container>
  );
}

export default Order;

