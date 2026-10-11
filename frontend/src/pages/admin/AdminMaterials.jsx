import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import api from "../../api/axios";

function AdminMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [decision, setDecision] = useState("");
  const [adminRemark, setAdminRemark] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [reviewing, setReviewing] = useState(false);

  const statusColor = {
    pending: "warning",
    approved: "success",
    rejected: "error",
  };

  const fetchMaterials = async () => {
    try {
      setError("");
      const response = await api.get("/admin/materials");
      setMaterials(response.data.materials || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load material listings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const getStatus = (material) =>
    material.approvalStatus || "pending";

  const filteredMaterials = materials.filter(
    (material) => getStatus(material) === filter
  );

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this material?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await api.delete(`/admin/materials/${id}`);

      setSuccess("Material removed successfully.");
      setDetailsOpen(false);
      setSelectedMaterial(null);

      await fetchMaterials();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to remove material."
      );
    }
  };

  const openDetailsDialog = (material) => {
    setSelectedMaterial(material);
    setDetailsOpen(true);
    setError("");
    setSuccess("");
  };

  const openReviewDialog = (material, status) => {
    setSelectedMaterial(material);
    setDecision(status);
    setAdminRemark("");
    setDialogOpen(true);
    setError("");
    setSuccess("");
  };

  const handleReview = async () => {
    if (!selectedMaterial) return;

    if (decision === "rejected" && !adminRemark.trim()) {
      setError("Please enter a reason for rejecting this listing.");
      return;
    }

    try {
      setReviewing(true);
      setError("");
      setSuccess("");

      const response = await api.put(
        `/admin/materials/${selectedMaterial._id}/review`,
        {
          approvalStatus: decision,
          adminRemark: adminRemark.trim(),
        }
      );

      setSuccess(
        response.data.message || "Material reviewed successfully."
      );
      setDialogOpen(false);
      setSelectedMaterial(null);

      await fetchMaterials();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to review material listing."
      );
    } finally {
      setReviewing(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    const parsedDate = new Date(date);

    return Number.isNaN(parsedDate.getTime())
      ? "Date unavailable"
      : parsedDate.toLocaleString("en-IN");
  };

  const showValue = (value) =>
    value !== undefined && value !== null && value !== ""
      ? value
      : "Not provided";

  const openReviewFromDetails = (status) => {
    const material = selectedMaterial;

    setDetailsOpen(false);

    if (material) {
      openReviewDialog(material, status);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography variant="h4" sx={{ fontWeight: 500, mb: 1 }}>
        Material Approvals
      </Typography>

      <Typography sx={{ color: "text.secondary", mb: 3 }}>
        Inspect material images, descriptions, seller details, and
        listing information before approving or rejecting listings.
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 3, flexWrap: "wrap", rowGap: 1 }}
      >
        {["pending", "approved", "rejected"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "contained" : "outlined"}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} (
            {
              materials.filter(
                (material) => getStatus(material) === status
              ).length
            }
            )
          </Button>
        ))}
      </Stack>

      {loading ? (
        <Typography>Loading materials...</Typography>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "#151515",
            border: "1px solid #262626",
            borderRadius: 3,
            overflowX: "auto",
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
                <TableCell>Status</TableCell>
                <TableCell>Admin Remark</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredMaterials.map((material) => (
                <TableRow key={material._id}>
                  <TableCell>{material.title}</TableCell>

                  <TableCell>
                    {material.seller?.name || "Unknown"}
                    {material.seller?.email && (
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        {material.seller.email}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>{material.category}</TableCell>
                  <TableCell>₹{material.price}</TableCell>
                  <TableCell>{material.quantity}</TableCell>
                  <TableCell>{material.condition}</TableCell>
                  <TableCell>{material.location}</TableCell>

                  <TableCell>
                    <Chip
                      size="small"
                      color={
                        statusColor[getStatus(material)] || "default"
                      }
                      label={getStatus(material)}
                    />
                  </TableCell>

                  <TableCell>
                    {material.adminRemark || "—"}
                  </TableCell>

                  <TableCell>
                    <Stack spacing={1} sx={{ minWidth: 110 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openDetailsDialog(material)}
                      >
                        View Details
                      </Button>

                      {getStatus(material) !== "approved" && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() =>
                            openReviewDialog(material, "approved")
                          }
                        >
                          Approve
                        </Button>
                      )}

                      {getStatus(material) !== "rejected" && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() =>
                            openReviewDialog(material, "rejected")
                          }
                        >
                          Reject
                        </Button>
                      )}

                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDelete(material._id)}
                      >
                        Remove
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}

              {filteredMaterials.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} align="center">
                    No {filter} listings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Material Listing Details</DialogTitle>

        <DialogContent dividers>
          {selectedMaterial && (
            <Stack spacing={2}>
              <Typography variant="h5" fontWeight={600}>
                {showValue(selectedMaterial.title)}
              </Typography>

              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  backgroundColor: "#202020",
                  border: "1px solid #383838",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Material Reference ID
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    overflowWrap: "anywhere",
                  }}
                >
                  {showValue(selectedMaterial._id)}
                </Typography>
              </Box>

              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                }}
              >
                {showValue(selectedMaterial.description)}
              </Typography>

              <Divider />

              <Typography variant="h6">Listing Images</Typography>

              {Array.isArray(selectedMaterial.images) &&
              selectedMaterial.images.length > 0 ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: 2,
                  }}
                >
                  {selectedMaterial.images.map((image, index) => (
                    <Box
                      key={`${image}-${index}`}
                      component="img"
                      src={image}
                      alt={`${selectedMaterial.title || "Material"} image ${index + 1}`}
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                      sx={{
                        width: "100%",
                        height: 190,
                        objectFit: "contain",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "#f5f5f5",
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary">
                  No images uploaded for this listing.
                </Typography>
              )}

              <Divider />

              <Typography variant="h6">
                Material Information
              </Typography>

              <Typography>
                Category: {showValue(selectedMaterial.category)}
              </Typography>

              <Typography>
                Price per unit: ₹{showValue(selectedMaterial.price)}
              </Typography>

              <Typography>
                Quantity: {showValue(selectedMaterial.quantity)}
              </Typography>

              <Typography>
                Condition: {showValue(selectedMaterial.condition)}
              </Typography>

              <Typography>
                Location: {showValue(selectedMaterial.location)}
              </Typography>

              {selectedMaterial.locationCoordinates && (
                <>
                  <Typography>
                    Latitude:{" "}
                    {showValue(
                      selectedMaterial.locationCoordinates.latitude
                    )}
                  </Typography>

                  <Typography>
                    Longitude:{" "}
                    {showValue(
                      selectedMaterial.locationCoordinates.longitude
                    )}
                  </Typography>
                </>
              )}

              <Divider />

              <Typography variant="h6">
                Seller Information
              </Typography>

              <Typography>
                Name: {showValue(selectedMaterial.seller?.name)}
              </Typography>

              <Typography>
                Email: {showValue(selectedMaterial.seller?.email)}
              </Typography>

              <Divider />

              <Typography variant="h6">
                Approval Information
              </Typography>

              <Box>
                <Chip
                  size="small"
                  color={
                    statusColor[getStatus(selectedMaterial)] || "default"
                  }
                  label={getStatus(selectedMaterial)}
                />
              </Box>

              <Typography>
                Admin remark: {showValue(selectedMaterial.adminRemark)}
              </Typography>

              <Typography>
                Submitted: {formatDate(selectedMaterial.createdAt)}
              </Typography>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ flexWrap: "wrap", p: 2 }}>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>

          {selectedMaterial &&
            getStatus(selectedMaterial) !== "approved" && (
              <Button
                variant="contained"
                color="success"
                onClick={() => openReviewFromDetails("approved")}
              >
                Approve
              </Button>
            )}

          {selectedMaterial &&
            getStatus(selectedMaterial) !== "rejected" && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => openReviewFromDetails("rejected")}
              >
                Reject
              </Button>
            )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={dialogOpen}
        onClose={() => !reviewing && setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {decision === "approved"
            ? "Approve Listing"
            : "Reject Listing"}
        </DialogTitle>

        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Material: {selectedMaterial?.title}
          </Typography>

          <TextField
            fullWidth
            multiline
            minRows={3}
            label={
              decision === "rejected"
                ? "Reason for rejection"
                : "Admin remark (optional)"
            }
            value={adminRemark}
            onChange={(event) => setAdminRemark(event.target.value)}
            required={decision === "rejected"}
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            disabled={reviewing}
            onClick={() => setDialogOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color={decision === "approved" ? "success" : "error"}
            disabled={reviewing}
            onClick={handleReview}
          >
            {reviewing ? "Saving..." : `Confirm ${decision}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminMaterials;
