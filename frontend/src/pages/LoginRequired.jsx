import { Box, Button, Container, Typography } from "@mui/material";
import {  useNavigate } from "react-router-dom";

function LoginRequired({ from }) {
  const navigate = useNavigate();

  const handleLogin = () => {
  navigate("/login", {
    state: {
      from,
    },
  });
};

  return (
    <Container maxWidth="sm" sx={{ py: 12 }}>
      <Box
        sx={{
          backgroundColor: "#151515",
          border: "1px solid #262626",
          borderRadius: 4,
          p: { xs: 4, md: 6 },
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 400,
            mb: 2,
          }}
        >
          You are not Logged In
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            mb: 4,
          }}
        >
          Please log in to continue.
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={handleLogin}
        >
          Login
        </Button>
      </Box>
    </Container>
  );
}

export default LoginRequired;