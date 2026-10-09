import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { uploadImage } from "../utils/cloudinary";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Box, Button, Container, MenuItem, TextField, Typography } from "@mui/material";

function LocationMarker({ setLocation }) {
  useMapEvents({
    click(event) {
      setLocation({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function CreateListing() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [address, setAddress] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const mapRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);

    if (images.length + files.length > 5) {
      setError("You can upload a maximum of 5 photos.");
      return;
    }

    const validFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (validFiles.length !== files.length) {
      setError("Please select image files only.");
      return;
    }

    setError("");

    setImages((previousImages) => [
      ...previousImages,
      ...validFiles,
    ]);

    const previews = validFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setImagePreviews((previousPreviews) => [
      ...previousPreviews,
      ...previews,
    ]);
  };

  const handleRemoveImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);

    setImages((previousImages) =>
      previousImages.filter((_, imageIndex) => imageIndex !== index)
    );

    setImagePreviews((previousPreviews) =>
      previousPreviews.filter((_, imageIndex) => imageIndex !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedLocation) {
      setError("Please select the exact location on the map.");
      return;
    }

    if (images.length === 0) {
      setError("Please upload at least one photo of the material.");
      return;
    }

    try {
      setUploading(true);

      const uploadedImages = [];

      for (const image of images) {
        const imageUrl = await uploadImage(image);
        uploadedImages.push(imageUrl);
      }

      await api.post("/materials", {
        title,
        category,
        description,
        quantity: Number(quantity),
        price: Number(price),
        condition,
        location: address,
        locationCoordinates: selectedLocation,
        images: uploadedImages,
      });

      navigate("/materials");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create listing. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleLocationSearch = async () => {
    if (!locationSearch.trim()) {
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationSearch
        )}&limit=1`
      );

      const data = await response.json();

      if (data.length === 0) {
        setError("Location not found. Please try another location.");
        return;
      }

      const latitude = parseFloat(data[0].lat);
      const longitude = parseFloat(data[0].lon);

      setSelectedLocation({
        latitude,
        longitude,
      });

      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], 16);
      }
    } catch (error) {
      setError("Location search failed. Please try again.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography
        variant="h2"
        sx={{
          color: "primary.main",
          fontWeight: 600,
          fontSize: { xs: "2.2rem", md: "3rem" },
          mb: 2,
        }}
      >
        Got Surplus to Sell?
      </Typography>

      <Typography
        sx={{
          color: "text.secondary",
          mb: 5,
        }}
      >
        List your reusable construction materials on BRIKRO.
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          backgroundColor: "#151515",
          border: "1px solid #262626",
          borderRadius: 4,
          p: { xs: 3, md: 5 },
        }}
      >
        <TextField
          fullWidth
          label="Material Title"
          placeholder="Example: Reusable Red Bricks"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 3 }}
        />

        <TextField
          fullWidth
          select
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ mb: 3 }}
        >
          <MenuItem value="Bricks">Bricks</MenuItem>
          <MenuItem value="Tiles">Tiles</MenuItem>
          <MenuItem value="Wood">Wood</MenuItem>
          <MenuItem value="Steel">Steel</MenuItem>
          <MenuItem value="Doors">Doors</MenuItem>
          <MenuItem value="Windows">Windows</MenuItem>
          <MenuItem value="Pipes">Pipes</MenuItem>
        </TextField>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description"
          placeholder="Describe the material, its condition and any useful details."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
            },
            gap: 3,
            mb: 3,
          }}
        >
          <TextField
            fullWidth
            type="number"
            label="Quantity"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            inputProps={{ min: 1 }}
          />

          <TextField
            fullWidth
            type="number"
            label="Price per Unit"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputProps={{ min: 0 }}
          />
        </Box>

        <TextField
          fullWidth
          select
          label="Condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          sx={{ mb: 3 }}
        >
          <MenuItem value="New">New</MenuItem>
          <MenuItem value="Like New">Like New</MenuItem>
          <MenuItem value="Good">Good</MenuItem>
          <MenuItem value="Fair">Fair</MenuItem>
          <MenuItem value="Used">Used</MenuItem>
        </TextField>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Address"
          placeholder="Enter the complete address of the material"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          sx={{ mb: 4 }}
        />

        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: "1rem",
              fontWeight: 600,
              mb: 1,
            }}
          >
            Material Photos
          </Typography>

          <Typography
            sx={{
              color: "text.secondary",
              fontSize: "0.85rem",
              mb: 2,
            }}
          >
            Upload clear photos of the actual construction material.
          </Typography>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleImageSelect}
          />

          <Button
            variant="outlined"
            color="primary"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Photos
          </Button>

          {imagePreviews.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                },
                gap: 2,
                mt: 3,
              }}
            >
              {imagePreviews.map((preview, index) => (
                <Box
                  key={preview}
                  sx={{
                    position: "relative",
                    height: 200,
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid #262626",
                  }}
                >
                  <Box
                    component="img"
                    src={preview}
                    alt={`Material preview ${index + 1}`}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />

                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={() => handleRemoveImage(index)}
                    sx={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      minWidth: 70,
                    }}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Location"
            placeholder="Example: Kariavattom, Thiruvananthapuram"
            value={locationSearch}
            onChange={(e) => setLocationSearch(e.target.value)}
          />

          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleLocationSearch}
          >
            Search Location
          </Button>
        </Box>

        <Typography
          sx={{
            color: "text.secondary",
            mb: 2,
          }}
        >
          Select the exact location on the map
        </Typography>

        <Box
          sx={{
            height: 400,
            borderRadius: 3,
            overflow: "hidden",
            mb: 2,
          }}
        >
          <MapContainer
            center={[8.5241, 76.9366]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            <LocationMarker setLocation={setSelectedLocation} />

            {selectedLocation && (
              <Marker
                position={[
                  selectedLocation.latitude,
                  selectedLocation.longitude,
                ]}
              />
            )}
          </MapContainer>
        </Box>

        {selectedLocation && (
          <Typography
            sx={{
              color: "primary.main",
              fontSize: "0.85rem",
              mb: 4,
            }}
          >
            Location selected successfully —{" "}
            {selectedLocation.latitude.toFixed(6)},{" "}
            {selectedLocation.longitude.toFixed(6)}
          </Typography>
        )}

        {error && (
          <Typography
            sx={{
              color: "#ff5252",
              fontSize: "0.9rem",
              mb: 3,
            }}
          >
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          size="large"
          variant="contained"
          color="primary"
          type="submit"
          disabled={uploading}
        >
          {uploading ? "Uploading Photos..." : "Create Listing"}
        </Button>
      </Box>
    </Container>
  );
}

export default CreateListing;