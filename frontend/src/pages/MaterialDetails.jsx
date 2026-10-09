import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, Container, Typography } from "@mui/material";
import api from "../api/axios";

function MaterialDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await api.get("/materials/" + id);
        setMaterial(response.data.material);
      } catch (error) {
        console.error("Failed to fetch material:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography sx={{ color: "text.secondary" }}>
          Loading material...
        </Typography>
      </Container>
    );
  }

  if (!material) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h5">
          Material not found
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr",
          },
          gap: 6,
        }}
      >
        <Box
          sx={{
            height: { xs: 300, md: 500 },
            backgroundColor: "#202020",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Box
            component="img"
            src={
              material.images?.[0] ||
              "https://images.unsplash.com/photo-1518005020951-eccb494ad742"
            }
            alt={material.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>

        <Box>
          <Typography
            sx={{
              color: "primary.main",
              fontWeight: 600,
              mb: 1,
            }}
          >
            {material.category}
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "2.2rem", md: "3rem" },
              mb: 2,
            }}
          >
            {material.title}
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              lineHeight: 1.8,
              mb: 4,
            }}
          >
            {material.description}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.85rem",
                }}
              >
                Condition
              </Typography>

              <Typography sx={{ fontWeight: 600 }}>
                {material.condition}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.85rem",
                }}
              >
                Available Quantity
              </Typography>

              <Typography sx={{ fontWeight: 600 }}>
                {material.quantity}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.85rem",
                }}
              >
                Location
              </Typography>

              <Typography sx={{ fontWeight: 600 }}>
                {material.location}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  color: "text.secondary",
                  fontSize: "0.85rem",
                }}
              >
                Price
              </Typography>

              <Typography
                sx={{
                  color: "primary.main",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                }}
              >
                ₹{material.price}
              </Typography>
            </Box>
          </Box>

          <Button
        variant="contained"
        color="primary"
        size="large"
        fullWidth
        onClick={() =>
            navigate("/order", {
            state: { material },
            })
        }
        >
            Order Now
        </Button>
        </Box>
    </Box>
    </Container>
  );
}

export default MaterialDetails;