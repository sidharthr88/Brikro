import { useEffect } from "react";
import { Box, Typography } from "@mui/material";

function Intro({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#0B0B0B",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "introFadeOut 0.6s ease 1.4s forwards",

        "@keyframes introFadeOut": {
          from: {
            opacity: 1,
          },
          to: {
            opacity: 0,
          },
        },
      }}
    >
      <Typography
        sx={{
          color: "#FF6B00",
          fontSize: { xs: "3rem", sm: "4rem" },
          fontWeight: 900,
          letterSpacing: "0.12em",
          animation: "logoEnter 0.8s ease forwards",

          "@keyframes logoEnter": {
            from: {
              opacity: 0,
              transform: "scale(0.85)",
            },
            to: {
              opacity: 1,
              transform: "scale(1)",
            },
          },
        }}
      >
        BRIKRO
      </Typography>

      <Typography
        sx={{
          color: "#A3A3A3",
          fontSize: { xs: "0.85rem", sm: "1rem" },
          marginTop: 1,
          letterSpacing: "0.08em",
          opacity: 0,
          animation: "taglineEnter 0.7s ease 0.5s forwards",

          "@keyframes taglineEnter": {
            from: {
              opacity: 0,
              transform: "translateY(10px)",
            },
            to: {
              opacity: 1,
              transform: "translateY(0)",
            },
          },
        }}
      >
        Smart Supplies. Smart Savings. Smarter Sites.
      </Typography>
    </Box>
  );
}

export default Intro;