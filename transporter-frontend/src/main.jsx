import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import App from "./App";
import "./index.css";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FF6B00"
    },
    background: {
      default: "#0A0A0A",
      paper: "#151515"
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#B0B0B0"
    }
  },
  typography: {
    fontFamily: "Inter, Arial, sans-serif"
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 700
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined"
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#B0B0B0"
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: "#FFFFFF",
          "& fieldset": {
            borderColor: "#444444"
          },
          "&:hover fieldset": {
            borderColor: "#FF6B00"
          },
          "&.Mui-focused fieldset": {
            borderColor: "#FF6B00"
          }
        }
      }
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
