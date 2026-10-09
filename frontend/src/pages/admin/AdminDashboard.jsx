import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMaterials: 0,
    totalOrders: 0,
    totalTransporters: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/admin/stats");
        setStats(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: "Users",
      value: stats.totalUsers,
      path: "/admin/users"
    },
    {
      title: "Materials",
      value: stats.totalMaterials,
      path: "/admin/materials"
    },
    {
      title: "Orders",
      value: stats.totalOrders,
      path: "/admin/orders"
    },
    {
      title: "Transporters",
      value: stats.totalTransporters,
      path: "/admin/transporters"
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 500,
          mb: 1
        }}
      >
        Admin Dashboard
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          mb: 5
        }}
      >
        Overview of the BRIKRO platform
      </Typography>

      <Grid container spacing={3}>
        {cards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card
              sx={{
                backgroundColor: "#151515",
                border: "1px solid #262626",
                borderRadius: 3
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  sx={{
                    color: "text.secondary",
                    mb: 1
                  }}
                >
                  {card.title}
                </Typography>

                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 500,
                    mb: 3
                  }}
                >
                  {card.value}
                </Typography>

                <Button
                  variant="outlined"
                  onClick={() => navigate(card.path)}
                >
                  Manage {card.title}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Platform Overview
        </Typography>

        <Typography sx={{ color: "text.secondary" }}>
          Manage users, materials, orders and transporters from the admin panel.
        </Typography>
      </Box>
    </Container>
  );
}

export default AdminDashboard;