import { useEffect, useState } from "react";
import {Alert,Box,Button,Chip,Container,Dialog,DialogActions,DialogContent,DialogContentText,DialogTitle,Paper,
  Stack,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,TextField,Typography,} from "@mui/material";
import api from "../../api/axios";

function AdminTransporters() {
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTransporter, setSelectedTransporter] = useState(null);
  const [adminRemark, setAdminRemark] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    vehicleType: "",
    vehicleNumber: "",
  });

  const fetchTransporters = async () => {
    try {
      const response = await api.get("/admin/transporters");
      setTransporters(response.data.transporters || []);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "Failed to load transporters."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransporters();
  }, []);

  const handleStatusChange = async (userId, isActive) => {
    if (!userId) {
      setErrorMessage("Transporter account could not be found.");
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      await api.put(`/admin/users/${userId}/status`, {
        isActive: !isActive,
      });

      setSuccessMessage(
        !isActive
          ? "Account activated successfully."
          : "Account deactivated successfully."
      );

      await fetchTransporters();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to update account status."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleCreate = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.vehicleType.trim() ||
      !form.vehicleNumber.trim()
    ) {
      setErrorMessage("Please complete all transporter details.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/admin/transporters", {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        vehicleType: form.vehicleType.trim(),
        vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
      });

      setForm({
        name: "",
        email: "",
        password: "",
        vehicleType: "",
        vehicleNumber: "",
      });

      setOpen(false);
      setSuccessMessage("Transporter created successfully.");
      await fetchTransporters();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to create transporter."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (transporter) => {
    const userId = transporter.user?._id;

    if (!userId) {
      setErrorMessage("Transporter account could not be found.");
      return false;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      await api.put(`/admin/users/${userId}/approval`, {
        approvalStatus: "approved",
      });

      setSuccessMessage("Transporter application approved.");
      await fetchTransporters();
      return true;
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to approve transporter application."
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const openRejectDialog = (transporter) => {
    setReviewTarget(transporter);
    setAdminRemark("");
    setErrorMessage("");
    setReviewOpen(true);
  };

  const handleReject = async () => {
    const userId = reviewTarget?.user?._id;

    if (!userId) {
      setErrorMessage("Transporter account could not be found.");
      return;
    }

    if (!adminRemark.trim()) {
      setErrorMessage("Please enter a reason for rejection.");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");

    try {
      await api.put(`/admin/users/${userId}/approval`, {
        approvalStatus: "rejected",
        adminRemark: adminRemark.trim(),
      });

      setReviewOpen(false);
      setReviewTarget(null);
      setAdminRemark("");
      setSuccessMessage("Transporter application rejected.");

      await fetchTransporters();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to reject transporter application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getApplicationStatus = (user) => {
    if (!user) return "Unknown";

    if (user.transporterStatus) {
      return user.transporterStatus;
    }

    if (user.role === "transporter") {
      return user.approvalStatus || "pending";
    }

    return "none";
  };

  const getStatusColor = (status) => {
    if (status === "approved") return "success";
    if (status === "pending") return "warning";
    if (status === "rejected") return "error";
    return "default";
  };

  const showValue = (value) =>
    value !== undefined && value !== null && value !== ""
      ? value
      : "Not provided";

  const openDetails = (transporter) => {
    setSelectedTransporter(transporter);
    setDetailsOpen(true);
    setErrorMessage("");
  };

  const handleApproveFromDetails = async () => {
    if (!selectedTransporter) return;

    const approved = await handleApprove(selectedTransporter);

    if (approved) {
      setDetailsOpen(false);
      setSelectedTransporter(null);
    }
  };

  const handleRejectFromDetails = () => {
    if (!selectedTransporter) return;

    const transporter = selectedTransporter;

    setDetailsOpen(false);
    openRejectDialog(transporter);
  };

  const renderDetail = (label, value) => (
    <Typography sx={{ overflowWrap: "anywhere" }}>
      <Box component="span" sx={{ fontWeight: 600 }}>
        {label}:{" "}
      </Box>
      {showValue(value)}
    </Typography>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography variant="h3" sx={{ fontWeight: 500, mb: 1 }}>
        Transporters
      </Typography>

      <Typography sx={{ color: "text.secondary", mb: 3 }}>
        Manage transporter accounts and review applications. Users can apply
        as transporters while retaining their existing buyer or seller role.
      </Typography>

      {errorMessage && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setErrorMessage("")}
        >
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage("")}
        >
          {successMessage}
        </Alert>
      )}

      <Button
        variant="contained"
        sx={{ mb: 4 }}
        onClick={() => {
          setErrorMessage("");
          setOpen(true);
        }}
      >
        Add Transporter
      </Button>

      {loading ? (
        <Typography>Loading transporters...</Typography>
      ) : transporters.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography>No transporter profiles found.</Typography>
        </Paper>
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
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Account Role</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Vehicle Number</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Application</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {transporters.map((transporter) => {
                const user = transporter.user;
                const status = getApplicationStatus(user);

                return (
                  <TableRow key={transporter._id}>
                    <TableCell>{user?.name || "Unknown"}</TableCell>
                    <TableCell>{user?.email || "Unknown"}</TableCell>
                    <TableCell>{user?.role || "Unknown"}</TableCell>

                    <TableCell>
                      {transporter.vehicleType || "Not provided"}
                    </TableCell>

                    <TableCell>
                      {transporter.vehicleNumber || "Not provided"}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={user?.isActive ? "Active" : "Inactive"}
                        color={user?.isActive ? "success" : "default"}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={status}
                        color={getStatusColor(status)}
                      />

                      {status === "rejected" &&
                        user?.transporterAdminRemark && (
                          <Typography
                            variant="caption"
                            display="block"
                            color="error"
                            sx={{ mt: 1, maxWidth: 220 }}
                          >
                            Reason: {user.transporterAdminRemark}
                          </Typography>
                        )}
                    </TableCell>

                    <TableCell>
                      <Stack
                        spacing={1}
                        alignItems="flex-start"
                        sx={{ minWidth: 130 }}
                      >
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => openDetails(transporter)}
                        >
                          View Details
                        </Button>

                        <Button
                          variant="outlined"
                          size="small"
                          disabled={!user?._id || submitting}
                          onClick={() =>
                            handleStatusChange(user?._id, user?.isActive)
                          }
                        >
                          {user?.isActive ? "Deactivate" : "Activate"}
                        </Button>

                        {status === "pending" && (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              disabled={submitting || !user?._id}
                              onClick={() => handleApprove(transporter)}
                            >
                              Approve
                            </Button>

                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              disabled={submitting || !user?._id}
                              onClick={() => openRejectDialog(transporter)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={detailsOpen}
        onClose={() => !submitting && setDetailsOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Transporter Application Details</DialogTitle>

        <DialogContent dividers>
          {selectedTransporter && (
            <Stack spacing={1.5}>
              <Typography variant="h6">
                Personal Information
              </Typography>

              {renderDetail("Name", selectedTransporter.user?.name)}
              {renderDetail("Email", selectedTransporter.user?.email)}
              {renderDetail("Phone", selectedTransporter.user?.phone)}

              <Typography variant="h6" sx={{ pt: 2 }}>
                Vehicle Information
              </Typography>

              {renderDetail("Vehicle type", selectedTransporter.vehicleType)}
              {renderDetail(
                "Vehicle number",
                selectedTransporter.vehicleNumber
              )}
              {renderDetail(
                "Vehicle owner",
                selectedTransporter.vehicleOwnerName
              )}
              {renderDetail(
                "Driving licence number",
                selectedTransporter.drivingLicenseNumber
              )}
              {renderDetail("RC number", selectedTransporter.rcNumber)}

              <Typography variant="h6" sx={{ pt: 2 }}>
                Vehicle Photo
              </Typography>

              {selectedTransporter.vehiclePhoto ? (
                <Box
                  component="img"
                  src={selectedTransporter.vehiclePhoto}
                  alt="Transporter vehicle"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                  sx={{
                    width: "100%",
                    maxWidth: 420,
                    maxHeight: 300,
                    objectFit: "contain",
                    alignSelf: "flex-start",
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "#f5f5f5",
                  }}
                />
              ) : (
                <Typography color="text.secondary">
                  No vehicle photo uploaded.
                </Typography>
              )}

              <Typography variant="h6" sx={{ pt: 2 }}>
                Application Status
              </Typography>

              <Box>
                <Chip
                  size="small"
                  label={getApplicationStatus(selectedTransporter.user)}
                  color={getStatusColor(
                    getApplicationStatus(selectedTransporter.user)
                  )}
                />
              </Box>

              {selectedTransporter.user?.transporterAdminRemark && (
                <Typography>
                  Admin remark:{" "}
                  {selectedTransporter.user.transporterAdminRemark}
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2, flexWrap: "wrap" }}>
          {selectedTransporter &&
            getApplicationStatus(selectedTransporter.user) === "pending" && (
              <>
                <Button
                  color="success"
                  variant="contained"
                  disabled={submitting}
                  onClick={handleApproveFromDetails}
                >
                  {submitting ? "Processing..." : "Approve"}
                </Button>

                <Button
                  color="error"
                  variant="outlined"
                  disabled={submitting}
                  onClick={handleRejectFromDetails}
                >
                  Reject
                </Button>
              </>
            )}

          <Button
            disabled={submitting}
            onClick={() => setDetailsOpen(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={open}
        onClose={() => !submitting && setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Transporter</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            required
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            label="Vehicle Type"
            name="vehicleType"
            value={form.vehicleType}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            required
            label="Vehicle Number"
            name="vehicleNumber"
            value={form.vehicleNumber}
            onChange={handleChange}
            margin="normal"
          />
        </DialogContent>

        <DialogActions>
          <Button
            disabled={submitting}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={submitting}
            onClick={handleCreate}
          >
            {submitting ? "Creating..." : "Create Transporter"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={reviewOpen}
        onClose={() => !submitting && setReviewOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Reject Transporter Application</DialogTitle>

        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Enter a reason the applicant can see before reapplying.
          </DialogContentText>

          <TextField
            fullWidth
            required
            multiline
            minRows={3}
            label="Rejection reason"
            value={adminRemark}
            onChange={(event) => setAdminRemark(event.target.value)}
            error={!adminRemark.trim() && Boolean(errorMessage)}
          />
        </DialogContent>

        <DialogActions>
          <Button
            disabled={submitting}
            onClick={() => setReviewOpen(false)}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            disabled={submitting}
            onClick={handleReject}
          >
            {submitting ? "Submitting..." : "Confirm Rejection"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminTransporters;
