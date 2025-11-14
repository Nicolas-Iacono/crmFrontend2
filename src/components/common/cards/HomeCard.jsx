import React from 'react';
import { Paper, Box, Typography, Grid2, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const HomeCard = ({ 
  title, 
  count, 
  icon: Icon, 
  route, 
  gradient = "linear-gradient(135deg, #1a237e 0%, #283593 100%)" 
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Grid2 
      xs={15} 
      sm={6} 
      md={3} 
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: { md: "center", xs: "flex-start" }
      }}
    >
      <Paper
        elevation={2}
        onClick={() => navigate(route)}
        sx={{
          width: {  
            xs: '100%',  
            sm: '90%',   
            md: '13rem',   
            lg: '15rem',  
            xl: '20rem',
          },
          maxWidth: { 
            xs: '100%',  
            md: '20rem',   
          },
          minHeight: { xs: "70px", sm: "auto" },
          height: { xs: "40%", sm: "80%" },
          borderRadius: 3,
          overflow: "hidden",
          transition: "all 0.3s ease",
          background: gradient,
          color: "white",
          display: "flex",
          flexDirection: "column",
          cursor: "pointer",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 20px -4px rgba(26, 35, 126, 0.3)"
          }
        }}
      > 
        {isMobile ? (
          <Box sx={{ 
            p: { xs: 2, md: 1 },
            height: "100%",
            display: "flex",
            flexDirection: { xs: "row", md: "column" },
            justifyContent: { xs: "space-between", md: "center" },
            alignItems: "center"
          }}>
            <Typography variant="h6" sx={{ 
              fontSize: { xs: "0.9rem", md: "1.25rem" },
              fontWeight: 400,
              mb: 1,
              fontFamily: "Poppins, sans-serif",
            }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ 
              fontSize: { xs: "1.5rem", md: "2rem" },
              fontWeight: 400,
              fontFamily: "Poppins, sans-serif",
            }}>
              {count}
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ 
              p: { xs: 2, sm: 3, md: 1 },
              height: "100%",
              display: "flex",
              flexDirection: { xs: "row", md: "row" },
              justifyContent: { xs: "space-between", md: "space-around" },
              alignItems: "start",
              paddingTop: { xs: 0, md: 3 },
            }}>
              <Typography variant="h6" sx={{ 
                fontSize: { xs: "0.9rem", sm: "2rem", md: "1.25rem" },
                fontWeight: { md: 500 },
                fontFamily: "Poppins, sans-serif",
              }}>
                {title}
              </Typography>
              <Typography variant="h4" sx={{ 
                fontSize: { xs: "0.9rem", sm: "2rem", md: "1.25rem" },
                fontWeight: { md: 500 },
                fontFamily: "Poppins, sans-serif",
              }}>
                {count}
              </Typography>
            </Box>
            <Box sx={{
              width: "100%",
              height: "130px", 
              display: "flex", 
              justifyContent: "flex-end",
              alignItems: "center", 
              marginLeft: "-2rem" 
            }}>
              <Icon sx={{ fontSize: 50 }} />
            </Box>
          </>
        )}
      </Paper>
    </Grid2>
  );
};

export default HomeCard;
