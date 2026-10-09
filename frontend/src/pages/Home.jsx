import { Box, Button, Container, Typography } from "@mui/material";
import { Link } from "react-router-dom";

function Home() {
  return (
    <Box>

      <Box
        sx={{
          minHeight: "calc(100vh - 80px)",
          display: "flex",
          alignItems: "center",
          background:
            "radial-gradient(circle at 70% 40%, rgba(255,107,0,0.12), transparent 35%)",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: "750px" }}>
            <Typography
              sx={{
                color: "primary.main",
                fontWeight: 700,
                letterSpacing: "0.15em",
                fontSize: "0.9rem",
                mb: 2,
              }}
            >
              CONSTRUCTION MATERIAL REUSE
            </Typography>

            <Typography
              variant="h1"
              sx={{
                fontSize: {
                  xs: "3rem",
                  md: "5rem",
                },
                fontWeight: 600,
                lineHeight: 1.05,
                mb: 3,
              }}
            >
              Give surplus materials
              <Box component="span" sx={{ color: "primary.main" }}>
                {" "}a second life.
              </Box>
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
                fontSize: "1.15rem",
                fontWeight: 400,
                lineHeight: 1.7,
                maxWidth: "650px",
                mb: 4,
              }}
            >
              Buy and sell reusable construction materials from real
              construction sites. Reduce waste, save money, and keep useful
              materials in circulation.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                component={Link}
                to="/materials"
                variant="contained"
                color="primary"
                size="large"
              >
                Browse Materials
              </Button>

              <Button
                component={Link}
                to="/login"
                variant="outlined"
                color="inherit"
                size="large"
              >
                Start Selling
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Typography
            sx={{
              color: "primary.main",
              fontWeight: 600,
              letterSpacing: "0.12em",
              fontSize: "0.85rem",
              mb: 2,
            }}
          >
            WHY BRIKRO?
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontSize: {
                xs: "2rem",
                md: "3rem",
              },
              fontWeight: 500,
              maxWidth: "700px",
              mb: 7,
            }}
          >
            Turn leftover materials into value.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
  
            <Box
              sx={{
                p: 4,
                backgroundColor: "background.paper",
                border: "1px solid #262626",
                borderRadius: 4,
              }}
            >
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: "2rem",
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                01
              </Typography>

              <Typography variant="h5" sx={{ mb: 2 }}>
                Reduce Waste
              </Typography>

              <Typography
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.7,
                  fontWeight: 400,
                }}
              >
                Keep usable construction materials out of landfills by
                giving them another purpose.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 4,
                backgroundColor: "background.paper",
                border: "1px solid #262626",
                borderRadius: 4,
              }}
            >
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: "2rem",
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                02
              </Typography>

              <Typography variant="h5" sx={{ mb: 2 }}>
                Save Money
              </Typography>

              <Typography
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.7,
                  fontWeight: 400,
                }}
              >
                Find quality surplus materials at better prices than buying
                everything new.
              </Typography>
            </Box>

            <Box
              sx={{
                p: 4,
                backgroundColor: "background.paper",
                border: "1px solid #262626",
                borderRadius: 4,
              }}
            >
              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: "2rem",
                  fontWeight: 700,
                  mb: 2,
                }}
              >
                03
              </Typography>

              <Typography variant="h5" sx={{ mb: 2 }}>
                Build Smarter
              </Typography>

              <Typography
                sx={{
                  color: "text.secondary",
                  lineHeight: 1.7,
                  fontWeight: 400,
                }}
              >
                Connect people who have useful materials with people who
                actually need them.
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
      <Box sx={{ py: { xs: 8, md: 12 } }}>
  <Container maxWidth="lg">
    <Typography
      sx={{
        color: "primary.main",
        fontWeight: 600,
        letterSpacing: "0.12em",
        fontSize: "0.85rem",
        mb: 2,
      }}
    >
      EXPLORE BRIKRO
    </Typography>

    <Typography
      variant="h2"
      sx={{
        fontSize: {
          xs: "2rem",
          md: "3rem",
        },
        fontWeight: 500,
        maxWidth: "750px",
        mb: 3,
      }}
    >
      Find the materials your next project needs.
    </Typography>

    <Typography
      sx={{
        color: "text.secondary",
        fontSize: "1.1rem",
        lineHeight: 1.8,
        maxWidth: "700px",
      }}
    >
      From bricks and tiles to steel, wood, doors, windows and more,
      discover reusable materials from construction projects and give
      them a second life.
    </Typography>
  </Container>
</Box>

    <Box
      sx={{
        py: { xs: 10, md: 14 },
        borderTop: "1px solid #262626",
        borderBottom: "1px solid #262626",
        textAlign: "center",
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h2"
          sx={{
            fontSize: {
              xs: "2.2rem",
              md: "3.5rem",
            },
            fontWeight: 500,
            mb: 3,
          }}
        >
          Give your materials a second life.
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "1.1rem",
            lineHeight: 1.7,
            maxWidth: "650px",
            mx: "auto",
            mb: 4,
          }}
        >
          Find reusable materials for your next project or turn your
          surplus into value.
        </Typography>

        <Button
          component={Link}
          to="/materials"
          variant="contained"
          color="primary"
          size="large"
        >
          Explore BRIKRO
        </Button>
      </Container>
    </Box>
<Box
  component="footer"
  sx={{
    py: 4,
    borderTop: "1px solid #262626",
    textAlign: "center",
  }}
>
  <Container maxWidth="lg">
    <Typography
      sx={{
        color: "text.secondary",
        fontSize: "0.85rem",
        mb: 1,
      }}
    >
      Smart Supplies. Smart Savings. Smarter Sites.
    </Typography>

    <Typography
      sx={{
        color: "#666666",
        fontSize: "0.7rem",
      }}
    >
      © 2026 BRIKRO. All rights reserved. | Privacy Policy | Terms of Service
    </Typography>
  </Container>
</Box>
</Box>
);
}

export default Home;