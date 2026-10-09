import {Box,Button,Container,Grid,Paper,Typography} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        backgroundColor: "#0A0A0A",
        minHeight: "100vh",
        color: "#FFFFFF"
      }}
    >
      <Navbar />

      <Box
        sx={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          pt: 12,
          pb: 8,
          background:
            "radial-gradient(circle at 75% 40%, rgba(255,107,0,0.12), transparent 35%)"
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                sx={{
                  color: "#FF6B00",
                  fontWeight: 600,
                  letterSpacing: "2px",
                  mb: 2
                }}
              >
                BRIKRO TRANSPORT
              </Typography>

              <Typography
                variant="h1"
                sx={{
                  color: "#FFFFFF",
                  fontWeight: 500,
                  fontSize: {
                    xs: "3rem",
                    md: "5rem"
                  },
                  lineHeight: 1.05,
                  mb: 3
                }}
              >
                Moving materials.
                <br />
                <Box
                  component="span"
                  sx={{
                    color: "#FF6B00"
                  }}
                >
                  Moving possibilities.
                </Box>
              </Typography>

              <Typography
                sx={{
                  color: "#B0B0B0",
                  fontSize: "1.15rem",
                  maxWidth: "620px",
                  lineHeight: 1.8,
                  mb: 4
                }}
              >
                BRIKRO TRANSPORT connects construction material buyers,
                sellers and transporters to move reusable materials
                efficiently from one site to another.
              </Typography>

              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/login")}
                sx={{
                  backgroundColor: "#FF6B00",
                  color: "#FFFFFF",
                  px: 4,
                  py: 1.5,
                  fontWeight: 500,
                  "&:hover": {
                    backgroundColor: "#E85F00"
                  }
                }}
              >
                Transporter Login
              </Button>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper
                sx={{
                  backgroundColor: "#151515",
                  border: "1px solid #292929",
                  borderRadius: 4,
                  p: 5,
                  boxShadow: "0 25px 80px rgba(0,0,0,0.4)"
                }}
              >
                <Typography
                  sx={{
                    color: "#FF6B00",
                    fontWeight: 500,
                    mb: 2
                  }}
                >
                  THE TRANSPORT NETWORK
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    color: "#FFFFFF",
                    fontWeight: 500,
                    mb: 2
                  }}
                >
                  From listing to location.
                </Typography>

                <Typography
                  sx={{
                    color: "#B0B0B0",
                    lineHeight: 1.8
                  }}
                >
                  When a buyer chooses transportation, BRIKRO TRANSPORT
                  helps get the material from the seller to the buyer's
                  selected delivery location.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          py: 12,
          backgroundColor: "#0A0A0A"
        }}
      >
        <Container maxWidth="lg">
          <Typography
            sx={{
              color: "#FF6B00",
              fontWeight: 400,
              letterSpacing: "2px",
              mb: 2
            }}
          >
            WHAT IS BRIKRO?
          </Typography>

          <Typography
            variant="h2"
            sx={{
              color: "#FFFFFF",
              fontWeight: 400,
              mb: 3,
              fontSize: {
                xs: "2.3rem",
                md: "3.5rem"
              }
            }}
          >
            Giving construction materials
            <br />
            a second life.
          </Typography>

          <Typography
            sx={{
              color: "#B0B0B0",
              maxWidth: "760px",
              fontSize: "1.1rem",
              lineHeight: 1.9
            }}
          >
            BRIKRO is a construction material reuse and exchange platform.
            It allows people and businesses to list surplus construction
            materials and helps others discover, purchase and reuse them
            instead of allowing usable materials to become waste.
          </Typography>
        </Container>
      </Box>

      <Box
        sx={{
          py: 12,
          backgroundColor: "#101010"
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                sx={{
                  color: "#FF6B00",
                  fontWeight: 400,
                  letterSpacing: "2px",
                  mb: 2
                }}
              >
                BRIKRO TRANSPORT
              </Typography>

              <Typography
                variant="h2"
                sx={{
                  color: "#FFFFFF",
                  fontWeight: 400,
                  fontSize: {
                    xs: "2.3rem",
                    md: "3.5rem"
                  },
                  mb: 3
                }}
              >
                The movement layer
                <br />
                of BRIKRO.
              </Typography>

              <Typography
                sx={{
                  color: "#B0B0B0",
                  lineHeight: 1.9,
                  mb: 4
                }}
              >
                BRIKRO TRANSPORT is the dedicated transport platform
                designed for delivery partners. Transporters receive
                available delivery requests, accept jobs and update the
                delivery status as materials move through the journey.
              </Typography>

              <Button
                variant="outlined"
                onClick={() => navigate("/login")}
                sx={{
                  borderColor: "#FF6B00",
                  color: "#FF6B00",
                  px: 4,
                  py: 1.4,
                  fontWeight: 300,
                  "&:hover": {
                    borderColor: "#FF6B00",
                    backgroundColor: "rgba(255,107,0,0.08)"
                  }
                }}
              >
                Enter Transporter Portal
              </Button>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 2
                }}
              >
                {[
                  ["01", "Available Jobs"],
                  ["02", "Accept Delivery"],
                  ["03", "Track Progress"],
                  ["04", "Complete Delivery"]
                ].map(([number, title]) => (
                  <Paper
                    key={number}
                    sx={{
                      backgroundColor: "#151515",
                      border: "1px solid #292929",
                      borderRadius: 3,
                      p: 3
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#FF6B00",
                        fontWeight: 800,
                        mb: 3
                      }}
                    >
                      {number}
                    </Typography>

                    <Typography
                      sx={{
                        color: "#FFFFFF",
                        fontWeight: 700
                      }}
                    >
                      {title}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box
        sx={{
          py: 12,
          backgroundColor: "#0A0A0A"
        }}
      >
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography
            variant="h3"
            sx={{
              color: "#FFFFFF",
              fontWeight: 400,
              mb: 3
            }}
          >
            Ready to move with BRIKRO?
          </Typography>

          <Typography
            sx={{
              color: "#B0B0B0",
              mb: 4,
              lineHeight: 1.8
            }}
          >
            Access your transporter portal and start managing delivery
            requests.
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/login")}
            sx={{
              backgroundColor: "#FF6B00",
              color: "#FFFFFF",
              px: 5,
              py: 1.5,
              fontWeight: 300,
              "&:hover": {
                backgroundColor: "#E85F00"
              }
            }}
          >
            Transporter Login
          </Button>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}

export default Home;

