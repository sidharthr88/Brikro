import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import api from "../../api/axios";

function AdminMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = async () => {
    try {
      const response = await api.get("/admin/materials");
      setMaterials(response.data.materials);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this material?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/admin/materials/${id}`);
      fetchMaterials();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 500,
          mb: 1
        }}
      >
        Materials
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          mb: 4
        }}
      >
        View all BRIKRO material listings.
      </Typography>

      {loading ? (
        <Typography>Loading materials...</Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "#151515",
            border: "1px solid #262626",
            borderRadius: 3
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Material</TableCell>
                <TableCell>Seller</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {materials.map((material) => (
                <TableRow key={material._id}>
                  <TableCell>{material.title}</TableCell>
                  <TableCell>
                    {material.seller?.name || "Unknown"}
                  </TableCell>
                  <TableCell>{material.category}</TableCell>
                  <TableCell>₹{material.price}</TableCell>
                  <TableCell>{material.quantity}</TableCell>
                  <TableCell>{material.condition}</TableCell>
                  <TableCell>{material.location}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(material._id)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default AdminMaterials;