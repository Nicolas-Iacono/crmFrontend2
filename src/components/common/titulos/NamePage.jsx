import { useTheme } from "@mui/material";
import { Box, Typography } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import themeBreakPoints from "../../../utils/themeBreakPoints";

const NamePage = ({ 
  title,
  dataTour,
  mobileSize,
  tabletSize,
  desktopSize,
}) => {
  const theme = useTheme();
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600,
         color: 'text.primary',
          fontSize: { 
            xs: mobileSize,
            sm: tabletSize,
            md: desktopSize } }}
            data-tour={dataTour}>
        {title}
      </Typography>
    </Box>
  );
}

export default NamePage;
