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

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [user, setUser] = useState({
    name: '',
    authorities: '',
  });

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
  const { data, error, isLoading } = contratoApi.ultimosContratos();
  
  const [propiedadesData, setPropiedadesData] = useState(null);
  const [propiedadesError, setPropiedadesError] = useState(null);
  const [propiedadesLoading, setPropiedadesLoading] = useState(true);
  
  const [propietarioData, setPropietarioData] = useState(null);
  const [propietarioError, setPropietarioError] = useState(null); 
  const [propietarioLoading, setPropietarioLoading] = useState(true);
  
  const [iniquilinoData, setInquilinoData] = useState(null);
  const [iniquilinoError, setInquilinoError] = useState(null);
  const [inquilinoLoading, setInquilinoLoading] = useState(true);
  
  const [garanteData, setGaranteData] = useState(null);
  const [garanteError, setGaranteError] = useState(null);
  const [garanteLoading, setGaranteLoading] = useState(true);
  
  const [contratoData, setContratoData] = useState(null);
  const [contratoError, setContratoError] = useState(null);
  const [contratoLoading, setContratoLoading] = useState(true);

  console.log(propietarioData)
 
  // Fetch data when user is available
  useEffect(() => {
    async function fetchData() {
      if (typeof user.name === 'string' && user.name) {
        
        //Fecth contratos
        setContratoLoading(true);
        const contratoResult = await contratoApi.getContratosPerLocalUser(user.name);
        setContratoData(contratoResult.data);
        setContratoError(contratoResult.error);
        setContratoLoading(false);


        // Fetch propiedades
        setPropiedadesLoading(true);
        const propResult = await PropiedadesApi.getPropiedadesPerLocalUser(user.name);
        setPropiedadesData(propResult.data);
        setPropiedadesError(propResult.error);
        setPropiedadesLoading(false);
        
        // Fetch propietarios
        setPropietarioLoading(true);
        const ownerResult = await PropietarioApi.getPropietariosPerLocalUser(user.name);
        setPropietarioData(ownerResult.data);
        setPropietarioError(ownerResult.error);
        setPropietarioLoading(false);
        
        // Fetch inquilinos
        setInquilinoLoading(true);
        const tenantResult = await InquilinosApi.getInquilinosPerLocalUser(user.name);
        setInquilinoData(tenantResult.data);
        setInquilinoError(tenantResult.error);
        setInquilinoLoading(false);
        
        // Fetch garantes
        setGaranteLoading(true);
        const garanteResult = await GarantesApi.getGarantesPerLocalUser(user.name);
        setGaranteData(garanteResult.data);
        setGaranteError(garanteResult.error);
        setGaranteLoading(false);
      }
    }
    
    fetchData();
  }, [user.name]); // Only re-run when user.name changes
 
  const [ultimosContratos,setUltimosContratos] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [propietarios, setPropietarios] = useState([]);
  const [numPropietarios, setNumPropietarios] = useState(0);

  const [inquilinos, setInquilinos] = useState([]);

  const [numInquilinos, setNumInquilinos] = useState(0);

  const [propiedades, setPropiedades] = useState([]);
  const [numPropiedades, setNumPropiedades] = useState(0);
  const [garantes, setGarantes] = useState([]);
  const [numGarantes, setNumGarantes] = useState(0);

  const [contratos, setContratos] = useState([]);
  const [numContratos, setNumContratos] = useState(0);

  useEffect(() => {
    const fetchDataAndCount = async () => {
      try {
        
        // Verificar si el usuario está definido y tiene un nombre
        if (!user?.name) {
          return; // Salir temprano si no hay usuario
        }
        
        // Realizar todas las llamadas a la API con manejo de errores individual
        const results = await Promise.allSettled([
          PropietarioApi.getPropietariosPerLocalUser(user.name),
          PropiedadesApi.getPropiedadesPerLocalUser(user.name),
          InquilinosApi.getInquilinosPerLocalUser(user.name),
          GarantesApi.getGarantesPerLocalUser(user.name),
          contratoApi.getContratosPerLocalUser(user.name),
          contratoApi.ultimosContratos()
        ]);
        
        // Extraer respuestas o valores predeterminados en caso de error
        const [
          propietarioResponse,
          propiedadesResponse,
          inquilinoResponse,
          garanteResponse,
          contratoResponse,
          ultimosContratosResponse
        ] = results.map(result => 
          result.status === 'fulfilled' ? result.value : { data: [], error: result.reason, isLoading: false }
        );
        
        
        // Procesar y actualizar los estados con validación
        setNumPropietarios(propietarioResponse?.data?.length || 0);
        setNumPropiedades(propiedadesResponse?.data?.length || 0);
        setNumInquilinos(inquilinoResponse?.data?.length || 0);
        setNumGarantes(garanteResponse?.data?.length || 0);
        setNumContratos(contratoResponse?.data?.length || 0);
        setUltimosContratos(ultimosContratosResponse?.data || []);
  
      } catch (err) {
      }
    };
  
    fetchDataAndCount();
  }, [user]); // Dependencia actualizada para re-ejecutar cuando el usuario cambie

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
    <Box sx={{
      backgroundColor: "background.default",
      minHeight: "100vh",
      width: { xs: "95%", md: "80%" },
      padding: { xs: 1, md: 4 },
      paddingTop: { xs: "64px", md: "80px" },
      paddingBottom: { xs: "70px", md: "20px" },
      display: "flex",
      flexDirection: "column",
      alignItems: { xs: "center", md: "end" },
      margin: 0
    }}>
      <Typography 
        variant="h4" 
        sx={{
          fontWeight: 600,
          color: "#1a237e",
          marginBottom: { xs: 3, md: 4 },
          fontSize: { xs: "1.75rem", md: "2.125rem" },
          width: "100%",
          textAlign: { xs: "left", md: "left" }
        }}
      >
        Panel de Control
      </Typography>

      <Grid2 
        container 
        spacing={{ xs: 2.5, md: 3 }} 
        sx={{ 
          marginBottom: { xs: 3, md: 4 },
          justifyContent: { xs: "center", md: "flex-start" },
          width: "100%",
          px: { xs: 0, md: 0 },
          flexDirection:{ xs: "column", md: "row" }
        }}
      >
        {/* Propietarios Card */}
        <Grid2 
          xs={15} 
          sm={6} 
          md={3} 
          sx={{
            display: "flex",
            justifyContent: "center"
          }}
        >
          <Paper
            elevation={2}
            onClick={() => navigate("/propietarios")}
            sx={{
              width: { xs: "100%", sm: "13rem" },
              maxWidth: { xs: "100%", sm: "13rem" },
              minHeight: { xs: "70px", sm: "auto" },
              height: {xs:"40%",md:"100%"},
              borderRadius: 3,
              overflow: "hidden",
              transition: "all 0.3s ease",
              background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)",
              color: "white",
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 20px -4px rgba(26, 35, 126, 0.3)"
              }
            }}
          >
            <Box sx={{ 
              p: { xs: 2, md: 3 },
              height: "100%",
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <Typography variant="h6" sx={{ 
                fontSize: { xs: "0.9rem", md: "1.25rem" },
                fontWeight: 500,
                mb: 1
              }}>
                Propietarios
              </Typography>
              <Typography variant="h4" sx={{ 
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: 600
              }}>
                {numPropietarios}
              </Typography>
            </Box>
          </Paper>
        </Grid2>

        {/* Inquilinos Card */}
        <Grid2 
          xs={15} 
          sm={6} 
          md={3} 
          sx={{
            display: "flex",
            justifyContent: "center"
          }}
        >
          <Paper
            elevation={2}
            onClick={() => navigate("/inquilinos")}
            sx={{
              width: { xs: "100%", sm: "13rem" },
              maxWidth: { xs: "100%", sm: "13rem" },
              minHeight: { xs: "70px", sm: "auto" },
              height: {xs:"40%",md:"100%"},
              borderRadius: 3,
              overflow: "hidden",
              transition: "all 0.3s ease",
              background: "linear-gradient(135deg, #00796b 0%, #009688 100%)",
              color: "white",
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 20px -4px rgba(0, 121, 107, 0.3)"
              }
            }}
          >
            <Box sx={{ 
              p: { xs: 2, md: 3 },
              height: "100%",
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <Typography variant="h6" sx={{ 
                fontSize: { xs: "0.9rem", md: "1.25rem" },
                fontWeight: 500,
                mb: 1
              }}>
                Inquilinos
              </Typography>
              <Typography variant="h4" sx={{ 
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: 600
              }}>
                {numInquilinos}
              </Typography>
            </Box>
          </Paper>
        </Grid2>

        {/* Propiedades Card */}
        <Grid2 
          xs={15} 
          sm={6} 
          md={3} 
          sx={{
            display: "flex",
            justifyContent: "center"
          }}
        >
          <Paper
            elevation={2}
            onClick={() => navigate("/propiedades")}
            sx={{
              width: { xs: "100%", sm: "13rem" },
              maxWidth: { xs: "100%", sm: "13rem" },
              minHeight: { xs: "70px", sm: "auto" },
              height: {xs:"40%",md:"100%"},
              borderRadius: 3,
              overflow: "hidden",
              transition: "all 0.3s ease",
              background: "linear-gradient(135deg, #c62828 0%, #d32f2f 100%)",
              color: "white",
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 20px -4px rgba(198, 40, 40, 0.3)"
              }
            }}
          >
            <Box sx={{ 
              p: { xs: 2, md: 3 },
              height: "100%",
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <Typography variant="h6" sx={{ 
                fontSize: { xs: "0.9rem", md: "1.25rem" },
                fontWeight: 500,
                mb: 1
              }}>
                Propiedades
              </Typography>
              <Typography variant="h4" sx={{ 
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: 600
              }}>
                {numPropiedades}
              </Typography>
            </Box>
          </Paper>
        </Grid2>

        {/* Contratos Card */}
        <Grid2 
          xs={15} 
          sm={6} 
          md={3} 
          sx={{
            display: "flex",
            justifyContent: "center"
          }}
        >
          <Paper
            elevation={2}
            onClick={() => navigate("/contratos")}
            sx={{
              width: { xs: "100%", sm: "13rem" },
              maxWidth: { xs: "100%", sm: "13rem" },
              minHeight: { xs: "70px", sm: "auto" },
              height: {xs:"40%",md:"100%"},
              borderRadius: 3,
              overflow: "hidden",
              transition: "all 0.3s ease",
              background: "linear-gradient(135deg, #f57c00 0%, #fb8c00 100%)",
              color: "white",
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 8px 20px -4px rgba(245, 124, 0, 0.3)"
              }
            }}
          >
            <Box sx={{ 
              p: { xs: 2, md: 3 },
              height: "100%",
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <Typography variant="h6" sx={{ 
                fontSize: { xs: "0.9rem", md: "1.25rem" },
                fontWeight: 500,
                mb: 1
              }}>
                Contratos
              </Typography>
              <Typography variant="h4" sx={{ 
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontWeight: 600
              }}>
                {numContratos}
              </Typography>
            </Box>
          </Paper>
        </Grid2>
      </Grid2>

      <Grid2 
        container 
        spacing={{ xs: 2, md: 3 }} 
        sx={{
          justifyContent: "center",
          width: "100%",
          px: { xs: 0, md: 0 }
        }}
      >
        {/* Tabla de Últimos Contratos */}
        <Grid2 item="true" xs={12} md={8} sx={{ width:"100%"}}>
          <Paper 
            elevation={5} 
            sx={{ 
              borderRadius: 3, 
              overflow: "hidden",
              width: isMobile ? "100%" : "72%",
              maxWidth: "50rem",
              background: "white",
              transition: "box-shadow 0.3s ease",
              "&:hover": {
                boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.1)"
              }
            }}
          >
            <Box sx={{ 
              padding: { xs: 2, md: 2.5 }, 
              backgroundColor: "#1a237e", 
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
                <TableContainer sx={{ 
                  maxHeight: { xs: 350, md: 400 },
                  overflowX: "auto",
                  backgroundColor: "white", 
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
                }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ 
                          fontWeight: 600,
                          backgroundColor: "#f1f5f9",
                          color: "#1a237e"
                        }}>ID</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600,
                          backgroundColor: "#f1f5f9",
                          color: "#1a237e"
                        }}>Contrato</TableCell>
                        <TableCell sx={{ 
                          fontWeight: 600,
                          backgroundColor: "#f1f5f9",
                          color: "#1a237e"
                        }}>Fecha Inicial</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ultimosContratos
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .filter((contrato) => contrato.usuarioDtoSalida.username === user.name)
                        .map((contrato) => (
                          <TableRow 
                            key={contrato.id}
                            hover
                            sx={{
                              cursor: "pointer",
                              "&:hover": { backgroundColor: "#f5f5f5" }
                            }}
                          >
                            <TableCell>{contrato.id}</TableCell>
                            <TableCell>{contrato.nombreContrato}</TableCell>
                            <TableCell>{contrato.fecha_inicio}</TableCell>
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