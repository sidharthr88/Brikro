import { Box, Container, Typography } from "@mui/material";

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 4,
        borderTop: "1px solid #262626",
        textAlign: "center",
        mt: 8,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          sx={{
            color: "text.secondary",
            fontSize: "0.85rem",
            mb: 1,
          }}
        >
          Smart Supplies. Smart Savings. Smarter Sites.
        </Typography>

        <Typography
          sx={{
            color: "#666666",
            fontSize: "0.7rem",
          }}
        >
          © 2026 BRIKRO. All rights reserved. | Privacy Policy | Terms of Service
        </Typography>
      </Container>
    </Box>
  );
}

export default Footer;