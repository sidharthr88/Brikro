import { useEffect, useState } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function MyListings() {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const fetchMyListings = async () => {
    try {
      const response = await api.get("/materials/my");
      setMaterials(response.data.materials);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load your listings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await api.delete("/materials/" + id);

      setMaterials((previousMaterials) =>
        previousMaterials.filter((material) => material._id !== id)
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to delete listing."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 5,
        }}
      >
        <Box>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 600,
              fontSize: { xs: "2.2rem", md: "3rem" },
              mb: 1,
            }}
          >
            My Listings
          </Typography>

          <Typography sx={{ color: "text.secondary" }}>
            Manage the construction materials you have listed on BRIKRO.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/sell")}
        >
          Create Listing
        </Button>
      </Box>

      {error && (
        <Typography
          sx={{
            color: "#ff5252",
            mb: 3,
          }}
        >
          {error}
        </Typography>
      )}

      {loading ? (
        <Typography sx={{ color: "text.secondary" }}>
          Loading your listings...
        </Typography>
      ) : materials.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 10,
            border: "1px solid #262626",
            borderRadius: 4,
            backgroundColor: "#151515",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              mb: 2,
            }}
          >
            You haven't listed anything yet.
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              mb: 3,
            }}
          >
            Start selling your surplus construction materials.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/sell")}
          >
            Start Selling
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {materials.map((material) => (
            <Box key={material._id}>
              <Box
                sx={{
                  backgroundColor: "#151515",
                  border: "1px solid #262626",
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
                    height: 200,
                    objectFit: "cover",
                  }}
                />

                <Box sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      color: "primary.main",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    {material.category}
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                    }}
                  >
                    {material.title}
                  </Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.9rem",
                      mb: 1,
                    }}
                  >
                    Quantity: {material.quantity}
                  </Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.9rem",
                      mb: 1,
                    }}
                  >
                    Condition: {material.condition}
                  </Typography>

                  <Typography
                    sx={{
                      color: "text.secondary",
                      fontSize: "0.9rem",
                      mb: 2,
                    }}
                  >
                    Location: {material.location}
                  </Typography>

                  <Typography
                    sx={{
                      color: "primary.main",
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      mb: 3,
                    }}
                  >
                    ₹{material.price}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1.5,
                    }}
                  >
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() =>
                        navigate("/materials/" + material._id)
                      }
                    >
                      View
                    </Button>

                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() =>
                        navigate("/edit-listing/" + material._id)
                        }
                    >   
                     Edit
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      onClick={() => handleDelete(material._id)}
                      disabled={deletingId === material._id}
                    >
                      {deletingId === material._id
                        ? "Deleting..."
                        : "Delete"}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default MyListings;