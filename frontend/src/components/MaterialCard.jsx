import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { Link } from "react-router-dom";

function MaterialCard({ material }) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          height: 200,
          backgroundColor: "#202020",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
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

      <CardContent
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1,
          }}
        >
          {material.title}
        </Typography>

        <Typography
          sx={{
            color: "primary.main",
            fontSize: "0.85rem",
            fontWeight: 600,
            mb: 2,
          }}
        >
          {material.category}
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

        <Box sx={{ mt: "auto" }}>
          <Typography
            sx={{
              fontSize: "1.25rem",
              fontWeight: 700,
              mb: 2,
            }}
          >
            ₹{material.price}
          </Typography>

          <Button
            component={Link}
            to={`/materials/${material._id}`}
            variant="contained"
            color="primary"
            fullWidth
          >
            View Details
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}

export default MaterialCard;