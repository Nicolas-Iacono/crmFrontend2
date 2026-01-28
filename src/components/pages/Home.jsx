import React, { useState, useEffect } from "react";
import { 
  Box, 
  Typography, 
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  CircularProgress, 
  Divider,
  useTheme,
  useMediaQuery,
  Grid2,
  Button,
  Skeleton
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import InquilinosApi from "../api/inquilinosApi";
import contratoApi from "../api/contratoApi";
import PropiedadesApi from "../api/propiedades";
import PropietarioApi from "../api/propietarios";
import GarantesApi from "../api/garanteApi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/GlobalAuth";
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonIcon from '@mui/icons-material/Person';
import MapsHomeWorkIcon from '@mui/icons-material/MapsHomeWork';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import { ThemeProvider } from "@mui/material/styles";
import themeBreakPoints from "../../utils/themeBreakPoints";
import HomeCard from "../common/cards/HomeCard";
import http from "../api/http";
const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('md', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.between('lg', 'xl'));
  const [user, setUser] = useState({
    name: '',
    authorities: '',
  });
  const { usuarioFetch } = useAuth();
  useEffect(() => {
    if (localStorage.getItem("username")) {
      setUser({
        name: localStorage.getItem("username"),
        authorities: localStorage.getItem("authorities"),
      });
    }
  }, []);
  const navigate = useNavigate();
  const [ultimosContratos,setUltimosContratos] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [propietarios, setPropietarios] = useState([]);
  const [numPropietario, setNumPropietario] = useState(0);

  const [inquilinos, setInquilinos] = useState([]);

  const [numInquilino, setNumInquilino] = useState(0);

  const [propiedades, setPropiedades] = useState([]);
  const [numPropiedad, setNumPropiedad] = useState(0);
  const [garantes, setGarantes] = useState([]);
  const [numGarante, setNumGarante] = useState(0);

  const [contratos, setContratos] = useState([]);
  const [numContrato, setNumContrato] = useState(0);
  const[isLoading,setIsLoading] = useState(false);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const[error,setError] = useState(null);
  useEffect(() => {
    const fetchUltimosContratos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await http.get(`${import.meta.env.VITE_API_URL}/contrato/latest`);
        setUltimosContratos(response.data);
      } catch (error) {
        console.error("Error al obtener los últimos contratos:", error);
        setError(error?.response?.data?.message || error?.message || 'Error al cargar');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUltimosContratos();
  }, []);

  useEffect(() => {
    if (!usuarioFetch?.username) return;

    const fetchCounts = async () => {
      const setters = {
        propietario: setNumPropietario,
        propiedad: setNumPropiedad,
        inquilino: setNumInquilino,
        contrato: setNumContrato,
      };

      try {
        setIsLoadingCounts(true);
        await Promise.all(
          Object.keys(setters).map(async (tipo) => {
            const response = await http.get(`${import.meta.env.VITE_API_URL}/${tipo}/enum/${usuarioFetch.username}`);
            setters[tipo](response.data);
          })
        );
      } catch (error) {
        console.error("Error al obtener los contadores:", error);
      } finally {
        setIsLoadingCounts(false);
      }
    };

    fetchCounts();
  }, [usuarioFetch?.username]);


  const irHacia = (url) =>{
    navigate(url);
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={(theme) => ({
      ...(theme.palette.mode === "dark"
        ? {
            backgroundColor: "#1e1e22", // fallback
            background: "linear-gradient(0deg,rgb(34, 52, 90) 0%,rgb(8, 15, 27) 100%)",
          }
        : {
            backgroundColor: "#f4f6f8", // fallback
            background: "linear-gradient(180deg, #f4f6f8 0%, #e8ebef 100%)",
          }),
  
      minHeight: "100vh",
            width: { xs: "95%", sm:"100%", md: "84vw" },
      padding: { xs: 1, sm:0, md: 4 },
      paddingTop: { xs: "64px",sm:"64px", md: "80px" },
      marginLeft:{md: "15rem"},
      paddingBottom: { xs: "70px", md: "20px" },
      display: "flex",
      flexDirection: "column",
      alignItems: { xs: "center", md: "start" },
      paddingLeft: { xs: 1, md: 0 },
    })}>
      

      <Grid2 
        container 
        spacing={{ xs: 2.5, md: 0.1 }} 
        sx={{ 
          marginBottom: { xs: 3, md: 4 },
          justifyContent: { xs: "center", md: "space-around" },
          width: {xs:"100%",sm:"80%",md:"92%"},
          height: { xs: "auto", md: "auto" },
          px: { xs: 0, md: 0 },
          marginLeft:{xs:0,sm:"1rem",md:"1rem"},
          flexDirection:{ xs: "column",sm:"row", md: "row" },
          flexWrap: { xs: "nowrap",sm:"wrap", md: "wrap" }
        }}
      >

            <HomeCard
              title="Propietarios"
              count={numPropietario}
              icon={PersonIcon}
              route="/propietarios"
            />

            <HomeCard
              title="Inquilinos"
              count={numInquilino}
              icon={PeopleAltIcon}
              route="/inquilinos"
              gradient="linear-gradient(135deg, #00796b 0%, #009688 100%)"
            />

            <HomeCard
              title="Propiedades"
              count={numPropiedad}
              icon={MapsHomeWorkIcon}
              route="/propiedades"
              gradient="linear-gradient(135deg, #c62828 0%, #d32f2f 100%)"
            />

            <HomeCard
              title="Contratos"
              count={numContrato}
              icon={TextSnippetIcon}
              route="/contratos"
              gradient="linear-gradient(135deg, #f57c00 0%, #fb8c00 100%)"
            />
        
        

      </Grid2>

      <Grid2 
        container 
        spacing={{ xs: 2, md: 3 }} 
        sx={{
          justifyContent: "center",
          width: {xs:"100%",sm:"100%",md:"80%"},
          height:"100%",
          px: { xs: 0, md: 0 },
          display:"flex",
          justifyContent:"center",
          alignItems:"center"
        }}
      >
        {/* Tabla de Últimos Contratos */}
        <Grid2 item="true" xs={12} md={8} sx={{ width:{xs:"100%",sm:"100%",md:"90%"}, 
          
         }}>
          <Paper 
            elevation={5} 
            sx={(theme) => ({ 
              ...(theme.palette.mode === "dark"
                ? {
                    background: "linear-gradient(180deg,rgb(54, 20, 100) 0%,rgb(25, 27, 39) 100%)",
                  }
                : {
                    background: "white",
                  }),
              borderRadius: 3, 
              overflow: "hidden",
              width: isMobile ? "100%" : "100%",
              maxWidth: "95%",
              margin: "0 auto",
              transition: "box-shadow 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.1)"
              }
            })}
          >
            <Box sx={{ 
              ...(theme.palette.mode === "dark"
                ? {
                    backgroundColor: "rgb(33, 37, 71)", 
                  }
                : {
                    backgroundColor: "#1a237e",
                  }),
              padding: { xs: 2, md: 2.5 }, 
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 500,
                fontSize: { xs: "1.1rem", md: "1.25rem" }
              }}>
                Últimos Contratos
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/contratos/crear')}
                sx={{
                  display: { xs: 'none', md: 'flex' }, 
                  backgroundColor: "white",
                  color: "#1a237e",
                  '&:hover': {
                    backgroundColor: "#0d1652",
                    color: "white",
                  },
                  fontWeight: "bold",
                  textTransform: "none",
                  fontSize: { xs: "0.8rem", md: "0.9rem" }
                }}
              >
                Crear Contrato
              </Button>
            </Box>
            {isLoading ? (
              <Box sx={{ p: 2 }}>
                <Box sx={{ mt: 2 }}>
                  {Array.from({ length: rowsPerPage }).map((_, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5 }}>
                      <Skeleton variant="text" width="80%" />
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : error ? (
              <Box sx={{ padding: 3, color: "error.main" }}>
                <Typography>Error al cargar los últimos contratos: {error}</Typography>
              </Box>
            ) : (
              <>
                <TableContainer sx={(theme) => ({ 
                  ...(theme.palette.mode === "dark"
                    ? {
                        backgroundColor: "rgb(189, 193, 226)", 
                      }
                    : {
                        backgroundColor: "white",
                      }),
                  maxHeight: { xs: 350, md: 400 },
                  overflowX: "auto",
                  
                  borderRadius: 1,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  width: "100%",
                  mt: 2,
                  '& .MuiTable-root': {
                    minWidth: { xs: 400, sm: 650 },
                    width: "100%"
                  },
                  '& .MuiTableCell-root': {
                    padding: { xs: "12px 16px", md: "16px" },
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    color: "black", 
                  },
                  '& .MuiTableHead-root': {
                    backgroundColor: "#f1f5f9",
                    '& .MuiTableCell-root': {
                      fontWeight: 600,
                      color: "#1a237e",
                    }
                  },
                  '& .MuiTableRow-root:hover': {
                    backgroundColor: "#f8fafc"
                  }
                })}>
                  <Table stickyHeader>
                  
                    <TableBody>
                      {ultimosContratos
                          .filter(
                            (contrato) =>
                              contrato.usuarioDtoSalida?.username?.toLowerCase() === (usuarioFetch?.username || "").toLowerCase()
                          )
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((contrato) => (
                            <TableRow key={contrato.id}>
                              <TableCell>{contrato.nombreContrato}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={ultimosContratos.filter((contrato) => contrato.usuarioDtoSalida?.username === usuarioFetch?.username).length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
                
                {/* Mobile-only button below the table */}
                <Box sx={{ 
                  display: { xs: 'flex', md: 'none' }, 
                  justifyContent: 'center',
                  mt: 3,
                  mb: 2
                }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/contratos/crear')}
                    sx={{
                      backgroundColor: "white",
                      color: "#1a237e",
                      '&:hover': {
                        backgroundColor: "#0d1652",
                        color: "white",
                      },
                      fontWeight: "bold",
                      textTransform: "none",
                      fontSize: "0.9rem"
                    }}
                  >
                    Crear Contrato
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid2>

      </Grid2>
    </Box>
  );
};


export default Home;