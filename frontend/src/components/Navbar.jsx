import { useEffect, useState } from "react";
import { AppBar, Toolbar, Typography, Button, Box, Avatar, Menu, MenuItem, Divider } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

function Navbar() {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");
  
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, [token]);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    handleClose();
    navigate("/");
    window.location.reload();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backgroundColor: "rgba(11, 11, 11, 0.9)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #262626",
      }}
    >
      <Toolbar
        sx={{
          maxWidth: "1200px",
          width: "100%",
          margin: "0 auto",
          justifyContent: "space-between",
        }}
      >
        <Typography
          component={Link}
          to="/"
          sx={{
            fontWeight: 900,
            letterSpacing: "0.08em",
            color: "primary.main",
            textDecoration: "none",
          }}
        >
          BRIKRO
        </Typography>

        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            component={Link}
            to="/materials"
            color="inherit"
          >
            Browse
          </Button>

          <Button 
            component={Link}
            to="/sell"
            color="inherit"
          >
            Sell
          </Button>

          <Button 
            component={Link}
            to="/my-orders"
            color="inherit"
          >
            My Orders
          </Button>

          {token ? (
            <>
              <Button
                onClick={handleProfileClick}
                color="inherit"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  ml: 1,
                }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: "primary.main",
                    color: "#000",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                  }}
                >
                  {user?.name.charAt(0).toUpperCase()}
                </Avatar>

                <Typography
                  sx={{
                    fontSize: "0.9rem",
                    fontWeight: 600,
                  }}
                >
                  Profile
                </Typography>
              </Button>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    width: 280,
                    backgroundColor: "#151515",
                    border: "1px solid #262626",
                    borderRadius: 3,
                  },
                }}
              >
                <Box sx={{ px: 2.5, py: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: "primary.main",
                        color: "#000",
                        fontWeight: 700,
                      }}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </Avatar>

                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#FFFFFF",
                        }}
                      >
                        {user?.name}
                      </Typography>

                      <Typography
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.8rem",
                          mt: 0.3,
                        }}
                      >
                        {user?.email}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ borderColor: "#262626" }} />

                <MenuItem onClick={() => navigate("/seller-orders")}>
                  Seller Orders
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/my-listings");
                  }}
                >
                  My Listings
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleClose();
                    navigate("/my-orders");
                  }}
                >
                  My Orders
                </MenuItem>

                <Divider sx={{ borderColor: "#262626" }} />

                <MenuItem
                  onClick={handleLogout}
                  sx={{
                    color: "#ff5252",
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              component={Link}
              to="/login"
              variant="contained"
              color="primary"
            >
              Get Started
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;