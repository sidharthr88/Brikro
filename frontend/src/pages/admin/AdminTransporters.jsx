import { useEffect, useState } from "react";
import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import api from "../../api/axios";

function AdminTransporters() {
  const [transporters, setTransporters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    vehicleType: "",
    vehicleNumber: ""
  });

  const fetchTransporters = async () => {
    try {
      const response = await api.get("/admin/transporters");
      setTransporters(response.data.transporters);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransporters();
  }, []);

  const handleStatusChange = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}/status`, {
        isActive: !isActive
      });

      fetchTransporters();
    } catch (error) {
      console.error(error);
    }
  };

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };

  const handleCreate = async () => {
    try {
      await api.post("/admin/transporters", form);

      setForm({
        name: "",
        email: "",
        password: "",
        vehicleType: "",
        vehicleNumber: ""
      });

      setOpen(false);
      fetchTransporters();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 500,
          mb: 1
        }}
      >
        Transporters
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          mb: 3
        }}
      >
        Manage BRIKRO transporters and their details.
      </Typography>

      <Button
        variant="contained"
        sx={{ mb: 4 }}
        onClick={() => setOpen(true)}
      >
        Add Transporter
      </Button>

      {loading ? (
        <Typography>Loading transporters...</Typography>
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
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Vehicle</TableCell>
                <TableCell>Vehicle Number</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {transporters.map((transporter) => (
                <TableRow key={transporter._id}>
                  <TableCell>
                    {transporter.user?.name || "Unknown"}
                  </TableCell>

                  <TableCell>
                    {transporter.user?.email || "Unknown"}
                  </TableCell>

                  <TableCell>
                    {transporter.vehicleType || "Not provided"}
                  </TableCell>

                  <TableCell>
                    {transporter.vehicleNumber || "Not provided"}
                  </TableCell>

                  <TableCell>
                    {transporter.user?.isActive
                      ? "Active"
                      : "Inactive"}
                  </TableCell>

                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() =>
                        handleStatusChange(
                          transporter.user?._id,
                          transporter.user?.isActive
                        )
                      }
                    >
                      {transporter.user?.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Transporter</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Email"
            name="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Vehicle Type"
            name="vehicleType"
            value={form.vehicleType}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            fullWidth
            label="Vehicle Number"
            name="vehicleNumber"
            value={form.vehicleNumber}
            onChange={handleChange}
            margin="normal"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleCreate}
          >
            Create Transporter
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminTransporters;