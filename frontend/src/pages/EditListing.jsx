import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../api/axios";

function LocationMarker({ setLocationCoordinates }) {
  useMapEvents({
    click(event) {
      setLocationCoordinates({
        latitude: event.latlng.lat,
        longitude: event.latlng.lng,
      });
    },
  });

  return null;
}

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapRef = useRef(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [address, setAddress] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [locationCoordinates, setLocationCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMaterial = async () => {
      try {
        const response = await api.get("/materials/" + id);
        const material = response.data.material;

        setTitle(material.title || "");
        setCategory(material.category || "");
        setDescription(material.description || "");
        setQuantity(material.quantity || "");
        setPrice(material.price || "");
        setCondition(material.condition || "");
        setAddress(material.location || "");

        if (
          material.locationCoordinates &&
          typeof material.locationCoordinates.latitude === "number" &&
          typeof material.locationCoordinates.longitude === "number"
        ) {
          setLocationCoordinates(material.locationCoordinates);
        }
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load listing."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMaterial();
  }, [id]);

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
        setError("Location not found.");
        return;
      }

      const latitude = parseFloat(data[0].lat);
      const longitude = parseFloat(data[0].lon);

      setLocationCoordinates({
        latitude,
        longitude,
      });

      setAddress(data[0].display_name);
      setError("");

      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], 16);
      }
    } catch (error) {
      setError("Location search failed.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!locationCoordinates) {
      setError("Please select the listing location on the map.");
      return;
    }

    try {
      setSaving(true);

      await api.put("/materials/" + id, {
        title,
        category,
        description,
        quantity: Number(quantity),
        price: Number(price),
        condition,
        location: address,
        locationCoordinates,
      });

      navigate("/my-listings");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update listing."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography sx={{ color: "text.secondary" }}>
          Loading listing...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography
        variant="h2"
        sx={{
          fontWeight: 600,
          fontSize: { xs: "2.2rem", md: "3rem" },
          mb: 2,
        }}
      >
        Edit Listing
      </Typography>

      <Typography sx={{ color: "text.secondary", mb: 5 }}>
        Update the details of your construction material listing.
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
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 600,
            mb: 1,
          }}
        >
          Listing Location
        </Typography>

        <TextField
          fullWidth
          label="Search Location"
          placeholder="Example: Ambalathinkara, Kariavattom"
          value={locationSearch}
          onChange={(e) => setLocationSearch(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          type="button"
          variant="outlined"
          color="primary"
          onClick={handleLocationSearch}
          sx={{ mb: 3 }}
        >
          Search Location
        </Button>

        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "0.85rem",
            mb: 2,
          }}
        >
          Select the exact location of the material on the map.
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
            center={
              locationCoordinates
                ? [
                    locationCoordinates.latitude,
                    locationCoordinates.longitude,
                  ]
                : [8.5241, 76.9366]
            }
            zoom={15}
            style={{
              height: "100%",
              width: "100%",
            }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            <LocationMarker
              setLocationCoordinates={setLocationCoordinates}
            />

            {locationCoordinates && (
              <Marker
                position={[
                  locationCoordinates.latitude,
                  locationCoordinates.longitude,
                ]}
              />
            )}
          </MapContainer>
        </Box>

        {locationCoordinates && (
          <Typography
            sx={{
              color: "primary.main",
              fontSize: "0.85rem",
              mb: 4,
            }}
          >
            Location selected
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

        <Box
          sx={{
            display: "flex",
            gap: 2,
          }}
        >
          <Button
            fullWidth
            type="button"
            variant="outlined"
            onClick={() => navigate("/my-listings")}
          >
            Cancel
          </Button>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default EditListing;