import { useEffect, useState } from "react";
import {Alert,Box,Button,CircularProgress,Container,MenuItem,Paper,TextField,Typography} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { uploadImage } from "../../utils/cloudinary";
import api from "../../api/axios";

const initialForm = {
  vehicleType: "",
  vehicleNumber: "",
  drivingLicenseNumber: "",
  rcNumber: "",
  aadhaarNumber: "",
  vehicleOwnerName: ""
};

const vehicleTypes = [
  "Bike",
  "Auto",
  "Car",
  "Van",
  "Pickup Truck",
  "Truck",
  "Other"
];

function TransporterApplicationForm({
  form,
  handleChange,
  handlePhotoChange,
  photoPreview,
  handleApply,
  submitting,
  buttonLabel
}) {
  return (
    <Box component="form" onSubmit={handleApply}>
      <TextField
        fullWidth
        select
        required
        label="Vehicle Type"
        name="vehicleType"
        value={form.vehicleType}
        onChange={handleChange}
        margin="normal"
      >
        {vehicleTypes.map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        required
        label="Vehicle Registration Number"
        name="vehicleNumber"
        value={form.vehicleNumber}
        onChange={handleChange}
        margin="normal"
        placeholder="e.g. KL01AB1234"
      />

      <TextField
        fullWidth
        required
        label="Driving Licence Number"
        name="drivingLicenseNumber"
        value={form.drivingLicenseNumber}
        onChange={handleChange}
        margin="normal"
      />

      <TextField
        fullWidth
        required
        label="RC Number"
        name="rcNumber"
        value={form.rcNumber}
        onChange={handleChange}
        margin="normal"
      />

      <TextField
        fullWidth
        required
        label="Aadhaar Number"
        name="aadhaarNumber"
        type="password"
        value={form.aadhaarNumber}
        onChange={handleChange}
        margin="normal"
        inputProps={{
          inputMode: "numeric",
          maxLength: 12,
          autoComplete: "off"
        }}
        helperText="Enter your 12-digit Aadhaar number."
      />

      <TextField
        fullWidth
        required
        label="Vehicle Owner Name (as shown on RC)"
        name="vehicleOwnerName"
        value={form.vehicleOwnerName}
        onChange={handleChange}
        margin="normal"
      />

      <Button
        component="label"
        variant="outlined"
        fullWidth
        sx={{ mt: 2, py: 1.3 }}
      >
        {photoPreview ? "Change Vehicle Photo" : "Upload Vehicle Photo"}
        <input
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
        />
      </Button>

      <Typography
        variant="caption"
        sx={{ display: "block", mt: 1, color: "text.secondary" }}
      >
        Upload a clear photo of the vehicle. JPG, PNG or WebP, up to 5 MB.
      </Typography>

      {photoPreview && (
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ mb: 1 }}>
            Vehicle photo preview
          </Typography>
          <Box
            component="img"
            src={photoPreview}
            alt="Selected vehicle"
            sx={{
              display: "block",
              width: "100%",
              maxHeight: 260,
              objectFit: "contain",
              borderRadius: 2,
              border: "1px solid #333"
            }}
          />
        </Box>
      )}

      <Button
        type="submit"
        variant="contained"
        disabled={submitting}
        fullWidth
        sx={{ mt: 3, py: 1.3 }}
      >
        {submitting ? "Submitting..." : buttonLabel}
      </Button>
    </Box>
  );
}

function TransporterEntry() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [form, setForm] = useState(initialForm);
  const [vehiclePhotoFile, setVehiclePhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const loadProfile = async () => {
    try {
      const response = await api.get("/auth/me");
      const currentUser = response.data.user;

      setUser(currentUser);

      if (
        currentUser.transporterStatus === "approved" ||
        (
          currentUser.role === "transporter" &&
          currentUser.approvalStatus === "approved"
        )
      ) {
        navigate("/transporter/dashboard", { replace: true });
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to load your BRIKRO profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const handleChange = (event) => {
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrorMessage("Please select a JPG, PNG or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Vehicle photo must be 5 MB or smaller.");
      return;
    }

    setErrorMessage("");
    setVehiclePhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleApply = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!/^\d{12}$/.test(form.aadhaarNumber.trim())) {
      setErrorMessage("Aadhaar number must contain exactly 12 digits.");
      return;
    }

    const requiredFields = [
      "vehicleType",
      "vehicleNumber",
      "drivingLicenseNumber",
      "rcNumber",
      "aadhaarNumber",
      "vehicleOwnerName"
    ];

    const hasEmptyField = requiredFields.some(
      (field) => !String(form[field]).trim()
    );

    if (hasEmptyField) {
      setErrorMessage("Please complete all six application fields.");
      return;
    }

    if (!vehiclePhotoFile) {
      setErrorMessage("Please upload a vehicle photo.");
      return;
    }

    setSubmitting(true);

    try {
      const vehiclePhoto = await uploadImage(vehiclePhotoFile);

      const payload = {
        vehicleType: form.vehicleType.trim(),
        vehicleNumber: form.vehicleNumber.trim().toUpperCase(),
        drivingLicenseNumber: form.drivingLicenseNumber.trim().toUpperCase(),
        rcNumber: form.rcNumber.trim().toUpperCase(),
        aadhaarNumber: form.aadhaarNumber.trim(),
        vehicleOwnerName: form.vehicleOwnerName.trim(),
        vehiclePhoto
      };

      const response = await api.post("/transporters/profile", payload);

      setSuccessMessage(
        response.data.message ||
          "Your transporter application has been submitted."
      );

      setForm(initialForm);
      setVehiclePhotoFile(null);
      setPhotoPreview("");

      await loadProfile();
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to submit your transporter application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">{errorMessage}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/login")}>
          Go to Login
        </Button>
      </Container>
    );
  }

  const status =
    user.transporterStatus ||
    (user.role === "transporter" ? user.approvalStatus : "none");

  const formProps = {
    form,
    handleChange,
    handlePhotoChange,
    photoPreview,
    handleApply,
    submitting
  };

  return (
    <Container maxWidth="md" sx={{ py: 7 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          backgroundColor: "#151515",
          border: "1px solid #292929",
          borderRadius: 4
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 500, mb: 1 }}>
          BRIKRO Transporter
        </Typography>

        <Typography sx={{ color: "text.secondary", mb: 3 }}>
          Apply for delivery access using your existing BRIKRO account.
          You can continue buying and selling materials with this account.
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
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {status === "pending" && (
          <Alert severity="info">
            Your transporter application is awaiting admin approval.
          </Alert>
        )}

        {status === "rejected" && (
          <>
            <Alert severity="error" sx={{ mb: 3 }}>
              Your transporter application was rejected.
              {user.transporterAdminRemark
                ? ` Reason: ${user.transporterAdminRemark}`
                : " Review your details and reapply."}
            </Alert>

            <Typography variant="h6" sx={{ mb: 2 }}>
              Update your details and reapply
            </Typography>

            <TransporterApplicationForm
              {...formProps}
              buttonLabel="Reapply"
            />
          </>
        )}

        {status !== "pending" && status !== "rejected" && (
          <>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Apply to become a transporter
            </Typography>

            <Typography sx={{ color: "text.secondary", mb: 2 }}>
              Enter your vehicle and document details. An administrator
              must approve your application before you can accept deliveries.
            </Typography>

            <TransporterApplicationForm
              {...formProps}
              buttonLabel="Submit Application"
            />
          </>
        )}

        <Button
          sx={{ mt: 3 }}
          color="inherit"
          onClick={() => navigate("/materials")}
        >
          Back to BRIKRO
        </Button>
      </Paper>
    </Container>
  );
}

export default TransporterEntry;
