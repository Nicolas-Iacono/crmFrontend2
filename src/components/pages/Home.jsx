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
  Button
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
const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [user, setUser] = useState({
    name: '',
    authorities: '',
  });
  const { usuarioFetch } = useAuth();
  console.log(usuarioFetch)
  console.log(user.name)
  useEffect(() => {
    if (localStorage.getItem("username")) {
      setUser({
        name: localStorage.getItem("username"),
        authorities: localStorage.getItem("authorities"),
      });
    }
  }, []);
  console.log(user)
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
  const[error,setError] = useState(null);

  useEffect(() => {
    const fetchUltimosContratos = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/contrato/latest`);
        setUltimosContratos(response.data);
      } catch (error) {
        console.error("Error al obtener los últimos contratos:", error);
      }
    };
    fetchUltimosContratos();
  }, []);

  useEffect(() => {
    if (!user?.name) return;

    const fetchCounts = async () => {
      const setters = {
        propietario: setNumPropietario,
        propiedad: setNumPropiedad,
        inquilino: setNumInquilino,
        contrato: setNumContrato,
      };

      try {
        await Promise.all(
          Object.keys(setters).map(async (tipo) => {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/${tipo}/enum/${user.name}`);
            setters[tipo](response.data);
          })
        );
      } catch (error) {
        console.error("Error al obtener los contadores:", error);
      }
    };

    fetchCounts();
  }, [user?.name]);

console.log(ultimosContratos)

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
      width: { xs: "95%", md: "100vw" },
      padding: { xs: 1, md: 4 },
      paddingTop: { xs: "64px", md: "80px" },
      paddingBottom: { xs: "70px", md: "20px" },
      display: "flex",
      flexDirection: "column",
      alignItems: { xs: "center", md: "start" },
      paddingLeft: { xs: 1, md: 0 },
    })}>
      <Typography 
        variant="h4" 
       
          sx={(theme) => ({
            ...(theme.palette.mode === "dark"
              ? {
                  color:"rgb(80, 8, 175)"
                }
              : {
                  color:" #1a237e"
                }),
         
          marginBottom: { xs: 3, md: 4 },
          fontSize: { xs: "1.75rem", md: "2.125rem" },
          width: "100%",
          textAlign: { xs: "left", md: "left" },
          marginLeft: { xs: 0, md: 4 },
          fontFamily: "Poppins, sans-serif",
        })}
      >
        Panel de Control
      </Typography>

      <Grid2 
        container 
        spacing={{ xs: 2.5, md: 3 }} 
        sx={{ 
          marginBottom: { xs: 3, md: 4 },
          justifyContent: { xs: "center", md: "space-around" },
          width: "100%",
          height: {xs:"auto",md:"250px"},
          px: { xs: 0, md: 0 },
          flexDirection:{ xs: "column", md: "row" },
        }}
      >
        {/* Propietarios Card */}
        <Grid2 
          xs={15} 
          sm={6} 
          md={3} 
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: {md:"center",xs:"flex-start"}
          }}
        >
          <Paper
            elevation={2}
            onClick={() => navigate("/propietarios")}
            sx={{
              width: {  xs: '100%',  
                sm: '75%',   
                md: '13rem',   
                lg: '15rem',  
                xl: '20rem',
              },
              maxWidth: { xs: '100%',  
                md: '20rem',   
                },
              minHeight: { xs: "70px", sm: "auto" },
              height: {xs:"40%",sm:"80%"},
              borderRadius: 3,
              overflow: "hidden",
              transition: "all 0.3s ease",
              background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)",
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
        {isMobile ? (<>
        <Box sx={{ 
             p: { xs: 2, md: 1 },
             height: "100%",
             display: "flex",
             flexDirection: { xs: "row", md: "column" },
             justifyContent:{xs:"space-between",md:"center"},
             alignItems: "center"
              
            }}>
              <Typography variant="h6" sx={{ 
                fontSize: { xs: "0.9rem", md: "1.25rem" },
                fontWeight: 400,
                mb: 1,
                fontFamily: "Poppins, sans-serif",
              }}>
                Propietarios
              </Typography>
              <Typography variant="h4" sx={{ 
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: 400,
                fontFamily: "Poppins, sans-serif",
              }}>
                {numPropietario}
              </Typography>
            </Box>
            
            </>)
        :
        (<>
          <Box sx={{ 
                p: { xs: 2, md: 1 },
                height: "100%",
                display: "flex",
                flexDirection: { xs: "row", md: "row" },
                justifyContent: {xs:"space-between",md:"space-around"},
                alignItems: "start",
                paddingTop: { xs: 0, md: 3 },
                
              }}>
                <Typography variant="h6" sx={{ 
                  fontSize: { xs: "0.9rem", md: "1.25rem" },
                  fontWeight: 400,
                  mb: 1,
                  fontFamily: "Poppins, sans-serif",
                }}>
                  Propietarios
                </Typography>
                <Typography variant="h4" sx={{ 
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  fontWeight: 400,
                  fontFamily: "Poppins, sans-serif",
                }}>
                  {numPropietario}
                </Typography>
              </Box>
              <Box sx={{width:"100%",
                height:"130px", display:"flex", justifyContent:"flex-end",
                 alignItems:"center", marginLeft:"-2rem" }}>
                <PersonIcon sx={{ fontSize: 50 }} />
              </Box>
              </>)
        }
            
          </Paper>
        </Grid2>

        {/* Inquilinos Card */}
        <Grid2 
          xs={15} 
          sm={6} 
          md={3} 
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: {md:"center",xs:"flex-start"}
          }}
        >
          <Paper
            elevation={2}
            onClick={() => navigate("/inquilinos")}
            sx={{
              width: {  xs: '100%',  
                sm: '75%',   
                md: '13rem',   
                lg: '15rem',  
                xl: '20rem',
              },
              maxWidth: { xs: '100%',  
                md: '20rem',   
                },
              minHeight: { xs: "70px", sm: "auto" },
              height: {xs:"40%",sm:"80%"},
              borderRadius: 3,
              overflow: "hidden",
              transition: "all 0.3s ease",
              background: "linear-gradient(135deg, #00796b 0%, #009688 100%)",
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
        {isMobile ? (<>
        <Box sx={{ 
             p: { xs: 2, md: 1 },
             height: "100%",
             display: "flex",
             flexDirection: { xs: "row", md: "column" },
             justifyContent:{xs:"space-between",md:"center"},
             alignItems: "center"
              
            }}>
              <Typography variant="h6" sx={{ 
                fontSize: { xs: "0.9rem", md: "1.25rem" },
                fontWeight: 400,
                mb: 1,
                fontFamily: "Poppins, sans-serif",
              }}>
                Inquilinos
              </Typography>
              <Typography variant="h4" sx={{ 
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: 400,
                fontFamily: "Poppins, sans-serif",
              }}>
                {numInquilino}
              </Typography>
            </Box>
            
            </>)
        :
        (<>
          <Box sx={{ 
                p: { xs: 2, md: 1 },
                height: "100%",
                display: "flex",
                flexDirection: { xs: "row", md: "row" },
                justifyContent: {xs:"space-between",md:"space-around"},
                alignItems: "start",
                paddingTop: { xs: 0, md: 3 },
                
              }}>
                <Typography variant="h6" sx={{ 
                  fontSize: { xs: "0.9rem", md: "1.25rem" },
                  fontWeight: 400,
                  mb: 1,
                  fontFamily: "Poppins, sans-serif",
                }}>
                  Inquilinos
                </Typography>
                <Typography variant="h4" sx={{ 
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  fontWeight: 400,
                  fontFamily: "Poppins, sans-serif",
                }}>
                  {numInquilino}
                </Typography>
              </Box>
              <Box sx={{width:"100%",
                height:"130px", display:"flex", justifyContent:"flex-end",
                 alignItems:"center", marginLeft:"-2rem" }}>
                <PeopleAltIcon sx={{ fontSize: 50 }} />
              </Box>
              </>)
        }
            
          </Paper>
        </Grid2>


        {/* Propiedades Card */}

        <Grid2 
          xs={15} 
          sm={6} 
          md={3} 
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: {md:"center",xs:"flex-start"}
          }}
        >
          <Paper
            elevation={2}
            onClick={() => navigate("/propiedades")}
            sx={{
              width: {  xs: '100%',  
                sm: '75%',   
                md: '13rem',   
                lg: '15rem',  
                xl: '20rem',
              },
              maxWidth: { xs: '100%',  
                md: '20rem',   
                },
              minHeight: { xs: "70px", sm: "auto" },
              height: {xs:"40%",sm:"80%"},
              borderRadius: 3,
              overflow: "hidden",
              transition: "all 0.3s ease",
              background: "linear-gradient(135deg, #c62828 0%, #d32f2f 100%)",
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
        {isMobile ? (<>
        <Box sx={{ 
             p: { xs: 2, md: 1 },
             height: "100%",
             display: "flex",
             flexDirection: { xs: "row", md: "column" },
             justifyContent:{xs:"space-between",md:"center"},
             alignItems: "center"
              
            }}>
              <Typography variant="h6" sx={{ 
                fontSize: { xs: "0.9rem", md: "1.25rem" },
                fontWeight: 400,
                mb: 1,
                fontFamily: "Poppins, sans-serif",
              }}>
                Propiedades
              </Typography>
              <Typography variant="h4" sx={{ 
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: 400,
                fontFamily: "Poppins, sans-serif",
              }}>
                {numPropiedad}
              </Typography>
            </Box>
            
            </>)
        :
        (<>
          <Box sx={{ 
                p: { xs: 2, md: 1 },
                height: "100%",
                display: "flex",
                flexDirection: { xs: "row", md: "row" },
                justifyContent: {xs:"space-between",md:"space-around"},
                alignItems: "start",
                paddingTop: { xs: 0, md: 3 },
                
              }}>
                <Typography variant="h6" sx={{ 
                  fontSize: { xs: "0.9rem", md: "1.25rem" },
                  fontWeight: 400,
                  mb: 1,
                  fontFamily: "Poppins, sans-serif",
                }}>
                  Propiedades
                </Typography>
                <Typography variant="h4" sx={{ 
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  fontWeight: 400,
                  fontFamily: "Poppins, sans-serif",
                }}>
                  {numPropiedad}
                </Typography>
              </Box>
              <Box sx={{width:"100%",
                height:"130px", display:"flex", justifyContent:"flex-end",
                 alignItems:"center", marginLeft:"-2rem" }}>
                <MapsHomeWorkIcon sx={{ fontSize: 50 }} />
              </Box>
              </>)
        }
            
          </Paper>
        </Grid2>


        {/* Contratos Card */}
        <Grid2 
          xs={15} 
          sm={6} 
          md={3} 
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: {md:"center",xs:"flex-start"}
          }}
        >
          <Paper
            elevation={2}
            onClick={() => navigate("/contratos")}
            sx={{
              width: {  xs: '100%',  
                sm: '75%',   
                md: '13rem',   
                lg: '15rem',  
                xl: '20rem',
              },
              maxWidth: { xs: '100%',  
                md: '20rem',   
                },
              minHeight: { xs: "70px", sm: "auto" },
              height: {xs:"40%",sm:"80%"},
              borderRadius: 3,
              overflow: "hidden",
              transition: "all 0.3s ease",
              background: "linear-gradient(135deg, #f57c00 0%, #fb8c00 100%)",
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
        {isMobile ? (<>
        <Box sx={{ 
             p: { xs: 2, md: 1 },
             height: "100%",
             display: "flex",
             flexDirection: { xs: "row", md: "column" },
             justifyContent:{xs:"space-between",md:"center"},
             alignItems: "center"
              
            }}>
              <Typography variant="h6" sx={{ 
                fontSize: { xs: "0.9rem", md: "1.25rem" },
                fontWeight: 400,
                mb: 1,
                fontFamily: "Poppins, sans-serif",
              }}>
                Contratos
              </Typography>
              <Typography variant="h4" sx={{ 
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: 400,
                fontFamily: "Poppins, sans-serif",
              }}>
                {numContrato}
              </Typography>
            </Box>
            
            </>)
        :
        (<>
          <Box sx={{ 
                p: { xs: 2, md: 1 },
                height: "100%",
                display: "flex",
                flexDirection: { xs: "row", md: "row" },
                justifyContent: {xs:"space-between",md:"space-around"},
                alignItems: "start",
                paddingTop: { xs: 0, md: 3 },
                
              }}>
                <Typography variant="h6" sx={{ 
                  fontSize: { xs: "0.9rem", md: "1.25rem" },
                  fontWeight: 400,
                  mb: 1,
                  fontFamily: "Poppins, sans-serif",
                }}>
                  Contratos
                </Typography>
                <Typography variant="h4" sx={{ 
                  fontSize: { xs: "1.5rem", md: "2rem" },
                  fontWeight: 400,
                  fontFamily: "Poppins, sans-serif",
                }}>
                  {numContrato}
                </Typography>
              </Box>
              <Box sx={{width:"100%",
                height:"130px", display:"flex", justifyContent:"flex-end",
                 alignItems:"center", marginLeft:"-2rem" }}>
                <TextSnippetIcon sx={{ fontSize: 50 }} />
              </Box>
              </>)
        }
            
          </Paper>
        </Grid2>

      </Grid2>

      <Grid2 
        container 
        spacing={{ xs: 2, md: 3 }} 
        sx={{
          justifyContent: "center",
          width: "100%",
          height:"100%",
          px: { xs: 0, md: 0 }
        }}
      >
        {/* Tabla de Últimos Contratos */}
        <Grid2 item="true" xs={12} md={8} sx={{ width:"100%"}}>
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
              <Box sx={{ 
                textAlign: "center", 
                padding: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2
              }}>
                <CircularProgress />
                <Typography>Cargando últimos contratos...</Typography>
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
                    <TableHead>
                      <TableRow>
                        <TableCell sx={(theme) => ({ 
                          ...(theme.palette.mode === "dark"
                            ? {
                              fontWeight: 600,
                              backgroundColor: "#f1f5f9",
                              color: " #1a237e"
                            }
                            : {
                              fontWeight: 600,
                              backgroundColor: " #f1f5f9",
                              color: "#1a237e"
                            }),
                        })}>ID</TableCell>
                        <TableCell sx={(theme) => ({ 
                          ...(theme.palette.mode === "dark"
                            ? {
                              fontWeight: 600,
                              backgroundColor: "#f1f5f9",
                              color: " #1a237e"
                            }
                            : {
                              fontWeight: 600,
                              backgroundColor: " #f1f5f9",
                              color: "#1a237e"
                            }),
                        })}>Contrato</TableCell>
    
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ultimosContratos
                          .filter(
                            (contrato) =>
                              contrato.usuarioDtoSalida?.username?.toLowerCase() === (user.name || "").toLowerCase()
                          )
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((contrato) => (
                            <TableRow key={contrato.id}>
                              <TableCell>{contrato.id}</TableCell>
                              <TableCell>{contrato.nombreContrato}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={ultimosContratos.filter((contrato) => contrato.usuarioDtoSalida.username === user.name).length}
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