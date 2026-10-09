import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#FF6B00",
    },

    background: {
      default: "#0B0B0B",
      paper: "#151515",
    },

    text: {
      primary: "#FFFFFF",
      secondary: "#A3A3A3",
    },
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily: "Inter, Arial, sans-serif",

    h1: {
      fontWeight: 800,
    },

    h2: {
      fontWeight: 800,
    },

    h3: {
      fontWeight: 700,
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 20px",
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#151515",
          borderRadius: 16,
          border: "1px solid #262626",
        },
      },
    },
  },
});

export default theme;