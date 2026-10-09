import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "rgba(10, 10, 10, 0.9)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #262626"
      }}
    >
      <Toolbar
        sx={{
          maxWidth: "1200px",
          width: "100%",
          mx: "auto",
          justifyContent: "space-between"
        }}
      >
        <Typography
          onClick={() => navigate("/")}
          sx={{
            fontSize: "1.3rem",
            fontWeight: 800,
            letterSpacing: "1px",
            cursor: "pointer"
          }}
        >
          BRIKRO <Box component="span" sx={{ color: "#FF6B00" }}>TRANSPORT</Box>
        </Typography>

        <Button
          variant="contained"
          onClick={() => navigate("/login")}
          sx={{
            backgroundColor: "#FF6B00",
            color: "#fff",
            fontWeight: 700,
            px: 3,
            "&:hover": {
              backgroundColor: "#e85f00"
            }
          }}
        >
          Transporter Login
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;