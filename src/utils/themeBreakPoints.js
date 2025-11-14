import { createTheme } from "@mui/material/styles";

const themeBreakPoints = createTheme({
  breakpoints: {
    values: {
      xs: 0,     // 0 - 450
      sm: 450,   // 450 - 900
      md: 900,   // 900 - 1280
      lg: 1280,  // 1280 - 1730
      xl: 1730,  // +1730
    },
  },
});

export default themeBreakPoints;