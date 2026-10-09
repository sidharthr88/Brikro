import { useEffect, useState } from "react";
import { Box, Container, TextField, MenuItem, Typography } from "@mui/material";
import api from "../api/axios";
import MaterialCard from "../components/MaterialCard";

function Materials() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await api.get("/materials");
        setMaterials(response.data.materials);
      } catch (error) {
        console.error("Failed to fetch materials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  },[]);
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      category === "All" || material.category === category;
    return matchesSearch && matchesCategory;
  });
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "2.5rem", md: "3.5rem" },
            fontWeight: 600,
            mb: 2,
          }}
        >
          Browse Materials
        </Typography>

        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "1.05rem",
            maxWidth: "650px",
          }}
        >
          Find reusable construction materials for your next project.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 5,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <TextField
          fullWidth
          label="Search materials"
          placeholder="Search by material name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <TextField
          select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ minWidth: { md: 220 } }}
        >
          <MenuItem value="All">All Categories</MenuItem>
          <MenuItem value="Bricks">Bricks</MenuItem>
          <MenuItem value="Tiles">Tiles</MenuItem>
          <MenuItem value="Wood">Wood</MenuItem>
          <MenuItem value="Steel">Steel</MenuItem>
          <MenuItem value="Doors">Doors</MenuItem>
          <MenuItem value="Windows">Windows</MenuItem>
          <MenuItem value="Pipes">Pipes</MenuItem>
        </TextField>
      </Box>

      {loading ? (
        <Typography sx={{ color: "text.secondary" }}>
          Loading materials...
        </Typography>
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
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material._id}
              material={material}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}

export default Materials;

