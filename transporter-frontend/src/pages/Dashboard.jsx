import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Dashboard() {
  const navigate = useNavigate();

  const [availableJobs, setAvailableJobs] = useState(0);
  const [activeDeliveries, setActiveDeliveries] = useState(0);
  const [availability, setAvailability] = useState("Loading...");
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [availableResponse, myDeliveriesResponse] =
          await Promise.all([
            api.get("/transporters/available"),
            api.get("/transporters/my-deliveries"),
          ]);

        const available =
          availableResponse.data.deliveries || [];

        const assigned =
          myDeliveriesResponse.data.deliveries || [];

        const active = assigned.filter(
          (delivery) =>
            !["delivered", "cancelled"].includes(delivery.status)
        );

        setAvailableJobs(available.length);
        setActiveDeliveries(active.length);

        // The availability endpoint is also used by the backend
        // to prevent accepting more jobs while a delivery is active.
        setAvailability(
          active.length > 0 ? "Busy" : "Available"
        );
      } catch (error) {
        setStatsError(
          error.response?.data?.message ||
            "Unable to load dashboard statistics."
        );
      } finally {
        setStatsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("transporterToken");
    navigate("/login");
  };

  const cardStyle = {
    backgroundColor: "#151515",
    border: "1px solid #292929",
    borderRadius: 3,
    p: 4,
    height: "100%",
  };

  const clickableCardStyle = {
    ...cardStyle,
    cursor: "pointer",
    transition: "0.2s",
    "&:hover": {
      borderColor: "#FF6B00",
      transform: "translateY(-3px)",
    },
  };

  const cardNumberStyle = {
    color: "#FF6B00",
    fontWeight: 800,
    fontSize: "1.5rem",
    mb: 2,
  };

  const cardTitleStyle = {
    color: "#FFFFFF",
    fontWeight: 700,
    fontSize: "1.2rem",
    mb: 1,
  };

  const cardDescriptionStyle = {
    color: "#B0B0B0",
    lineHeight: 1.7,
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#0A0A0A",
        color: "#FFFFFF",
        pt: 10,
        pb: 8,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
            mb: 6,
          }}
        >
          <Box>
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
              Transporter Dashboard
            </Typography>

            <Typography sx={{ color: "#B0B0B0", fontSize: "1rem" }}>
              Manage your delivery operations from one place.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            onClick={handleLogout}
            sx={{
              borderColor: "#555555",
              color: "#FFFFFF",
              px: 3,
              py: 1.2,
              fontWeight: 700,
              "&:hover": {
                borderColor: "#FF6B00",
                color: "#FF6B00",
                backgroundColor: "rgba(255,107,0,0.06)",
              },
            }}
          >
            Logout
          </Button>
        </Box>

        {statsError && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {statsError}
          </Alert>
        )}

        {/* Dashboard summary cards */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={cardStyle}>
              <Typography sx={{ color: "#B0B0B0", mb: 2 }}>
                Availability
              </Typography>

              <Typography
                sx={{
                  color: "#FFFFFF",
                  fontSize: "2rem",
                  fontWeight: 800,
                  mb: 1,
                }}
              >
                {statsLoading ? (
                  <CircularProgress
                    size={24}
                    sx={{ color: "#FF6B00" }}
                  />
                ) : (
                  availability
                )}
              </Typography>

              <Typography
                sx={{
                  color:
                    availability === "Busy" ? "#FFB74D" : "#66BB6A",
                  fontWeight: 700,
                }}
              >
                {statsLoading
                  ? "Checking status..."
                  : availability === "Busy"
                    ? "Currently handling a delivery"
                    : "Ready for deliveries"}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={cardStyle}>
              <Typography sx={{ color: "#B0B0B0", mb: 2 }}>
                Available Jobs
              </Typography>

              <Typography
                sx={{
                  color: "#FFFFFF",
                  fontSize: "2rem",
                  fontWeight: 800,
                  mb: 1,
                }}
              >
                {statsLoading ? "—" : availableJobs}
              </Typography>

              <Typography sx={{ color: "#B0B0B0" }}>
                View requests ready to be accepted
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={cardStyle}>
              <Typography sx={{ color: "#B0B0B0", mb: 2 }}>
                Active Deliveries
              </Typography>

              <Typography
                sx={{
                  color: "#FFFFFF",
                  fontSize: "2rem",
                  fontWeight: 800,
                  mb: 1,
                }}
              >
                {statsLoading ? "—" : activeDeliveries}
              </Typography>

              <Typography sx={{ color: "#B0B0B0" }}>
                Accepted deliveries not yet completed
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Paper
          elevation={0}
          sx={{
            backgroundColor: "#151515",
            border: "1px solid #292929",
            borderRadius: 4,
            p: { xs: 4, md: 5 },
            mb: 5,
          }}
        >
          <Typography
            sx={{
              color: "#FF6B00",
              fontWeight: 700,
              letterSpacing: "1px",
              mb: 1,
            }}
          >
            DELIVERY OPERATIONS
          </Typography>

          <Typography
            variant="h4"
            sx={{
              color: "#FFFFFF",
              fontWeight: 800,
              mb: 2,
              fontSize: { xs: "1.6rem", md: "2.125rem" },
            }}
          >
            Ready for your next delivery?
          </Typography>

          <Typography
            sx={{
              color: "#B0B0B0",
              maxWidth: "700px",
              lineHeight: 1.8,
              mb: 4,
            }}
          >
            View available delivery requests, accept jobs and manage
            deliveries assigned to you through the BRIKRO transport network.
          </Typography>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/available-deliveries")}
              sx={{
                backgroundColor: "#FF6B00",
                color: "#FFFFFF",
                px: 4,
                py: 1.5,
                fontWeight: 800,
                "&:hover": { backgroundColor: "#E85F00" },
              }}
            >
              View Available Deliveries
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/my-deliveries")}
              sx={{
                borderColor: "#FF6B00",
                color: "#FF6B00",
                px: 4,
                py: 1.5,
                fontWeight: 800,
                "&:hover": {
                  borderColor: "#FF8A33",
                  backgroundColor: "rgba(255,107,0,0.08)",
                },
              }}
            >
              My Deliveries
            </Button>
          </Box>
        </Paper>

        {/* Navigation cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              onClick={() => navigate("/available-deliveries")}
              sx={clickableCardStyle}
            >
              <Typography sx={cardNumberStyle}>01</Typography>
              <Typography sx={cardTitleStyle}>
                Available Deliveries
              </Typography>
              <Typography sx={cardDescriptionStyle}>
                Find delivery requests that are ready to be accepted.
              </Typography>
              <Typography
                sx={{ color: "#FF6B00", fontWeight: 700, mt: 3 }}
              >
                View requests →
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              onClick={() => navigate("/my-deliveries")}
              sx={clickableCardStyle}
            >
              <Typography sx={cardNumberStyle}>02</Typography>
              <Typography sx={cardTitleStyle}>
                Manage Deliveries
              </Typography>
              <Typography sx={cardDescriptionStyle}>
                View accepted jobs and update their progress from pickup
                to delivery.
              </Typography>
              <Typography
                sx={{ color: "#FF6B00", fontWeight: 700, mt: 3 }}
              >
                Manage jobs →
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              onClick={() => navigate("/my-deliveries")}
              sx={clickableCardStyle}
            >
              <Typography sx={cardNumberStyle}>03</Typography>
              <Typography sx={cardTitleStyle}>
                Delivery History
              </Typography>
              <Typography sx={cardDescriptionStyle}>
                Review your completed and previous delivery assignments.
              </Typography>
              <Typography
                sx={{ color: "#FF6B00", fontWeight: 700, mt: 3 }}
              >
                View deliveries →
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default Dashboard;
