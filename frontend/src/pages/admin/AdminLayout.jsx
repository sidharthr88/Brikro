import { Box, Button, Container, Paper, Typography } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";

function AdminLayout() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper
        sx={{
          backgroundColor: "#151515",
          border: "1px solid #262626",
          borderRadius: 3,
          p: 2,
          mb: 4
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600
            }}
          >
            BRIKRO ADMIN
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexWrap: "wrap"
            }}
          >
            <Button onClick={() => navigate("/admin")}>
              Dashboard
            </Button>

            <Button onClick={() => navigate("/admin/users")}>
              Users
            </Button>

            <Button onClick={() => navigate("/admin/materials")}>
              Materials
            </Button>

            <Button onClick={() => navigate("/admin/orders")}>
              Orders
            </Button>

            <Button onClick={() => navigate("/admin/transporters")}>
              Transporters
            </Button>
          </Box>
        </Box>
      </Paper>

      <Outlet />
    </Container>
  );
}

export default AdminLayout;