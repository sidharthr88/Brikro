import { Box, Container, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      sx={{
        borderTop: "1px solid #262626",
        backgroundColor: "#0a0a0a",
        py: 4
      }}
    >
      <Container maxWidth="lg">
        <Typography
          sx={{
            textAlign: "center",
            fontWeight: 700,
            mb: 1
          }}
        >
          BRIKRO <Box component="span" sx={{ color: "#FF6B00" }}>TRANSPORT</Box>
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "text.secondary",
            fontSize: "0.9rem"
          }}
        >
          Moving materials. Connecting sites. Powering reuse.
        </Typography>

        <Typography
          sx={{
            textAlign: "center",
            color: "#666",
            fontSize: "0.75rem",
            mt: 2
          }}
        >
          © 2026 BRIKRO. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;