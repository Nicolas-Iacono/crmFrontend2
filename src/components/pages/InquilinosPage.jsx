import React, { useEffect, useState } from 'react';
import {
  Paper,
  CircularProgress,
  Typography,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  TextField,
  InputAdornment,
  Fab,
  Collapse,
  Divider,
  Tooltip,
  Button,
  Card,
  CardContent,
  Grid,
  Menu,
  MenuItem
} from '@mui/material';
import axios from 'axios';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import EmailIcon from '@mui/icons-material/Email';
import Swal from 'sweetalert2';
import PlayerCard from '../common/cards/PlayerCard';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TenantsTour from '../common/tour/TenantsTour';
const InquilinosPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [inquilinos, setInquilinos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInquilinoId, setSelectedInquilinoId] = useState(null);
  const [user, setUser] = useState({
    name: '',
    authorities: '',
  });

  useEffect(() => {
    if (localStorage.getItem("username")) {
      setUser({
        name: localStorage.getItem("username"),
        authorities: localStorage.getItem("authorities"),
      });
    }
  }, []);

  const fetchInquilinos = async () => {
    if (!user || !user.name) {
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await axios.get(`${import.meta.env.VITE_API_URL}/inquilino/${user.name}`);
      const inquilinosArray = Array.isArray(result.data) ? result.data : 
                            (result.data && result.data.data && Array.isArray(result.data.data)) ? result.data.data : [];
      setInquilinos(inquilinosArray);
      setError(null);
    } catch (error) {
      console.error('Error fetching inquilinos:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (user && user.name) {
      fetchInquilinos();
    }
  }, [user.name]);

  const handleToggleCard = (inquilinoId) => {
    setExpandedCards(prev => ({ ...prev, [inquilinoId]: !prev[inquilinoId] }));
  };

  const handleDeleteInquilino = async (id) => {
    const result = await Swal.fire({
      title: 'Confirmar Eliminación',
      text: `¿Estás seguro de que deseas eliminar este inquilino?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/inquilino/delete/${id}`);
        setInquilinos(prevInquilinos => prevInquilinos.filter(inquilino => inquilino.id !== id));
        Swal.fire('Eliminado!', 'El inquilino ha sido eliminado.', 'success');
      } catch (err) {
        console.error('Error deleting inquilino:', err);
        Swal.fire('Error!', 'No se pudo eliminar el inquilino.', 'error');
      }
    }
  };

    const handleMenuClick = (event, inquilinoId) => {
    setAnchorEl(event.currentTarget);
    setSelectedInquilinoId(inquilinoId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInquilinoId(null);
  };

  const handleEdit = () => {
    navigate(`/editar-inquilino/${selectedInquilinoId}`);
    handleMenuClose();
  };

  const handleDelete = () => {
    handleDeleteInquilino(selectedInquilinoId);
    handleMenuClose();
  };

  const filteredInquilinos = inquilinos.filter(inquilino => {
    if (!searchTerm) return true;
    const nombre = inquilino.nombre || "";
    const apellido = inquilino.apellido || "";
    const email = inquilino.email || "";
    const telefono = inquilino.telefono || "";
    const dni = inquilino.dni || "";
    const searchTermLower = searchTerm.toLowerCase();
    return nombre.toLowerCase().includes(searchTermLower) ||
           apellido.toLowerCase().includes(searchTermLower) ||
           email.toLowerCase().includes(searchTermLower) ||
           telefono.toLowerCase().includes(searchTermLower) ||
           dni.toLowerCase().includes(searchTermLower);
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const tarjetasPorPagina = 6;
  const indiceInicio = (paginaActual - 1) * tarjetasPorPagina;
  const indiceFin = indiceInicio + tarjetasPorPagina;
  const inquilinosPaginados = filteredInquilinos.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(filteredInquilinos.length / tarjetasPorPagina);

  const renderDesktopView = () => (
    <Box sx={{ 
      width: '100vw', 
      overflowX: 'auto',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap:"wrap",
      gap:"1rem",
      height:"70vh",
      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.default',
    
    }}>
      {inquilinosPaginados.length === 0 ? (
        <Box sx={{ 
          width:"100",
          textAlign: 'center', 
          mt: 2,
          p: 4,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.default',
          borderRadius: 3,
          mx: 'auto',
          boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 12px rgba(0,0,0,0.08)',
        }}>
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'text.secondary',
              fontSize: { xs: '0.9375rem', sm: '1rem' }
            }}
          >
            No se encontraron inquilinos con los criterios de búsqueda.
          </Typography>
        </Box>
      ) : (

        <>
        <TableContainer component={Box} sx={{ 
          width: '100%',
          borderRadius: 2,
          maxWidth:"100%",
          display:"flex",
          flexDirection:"column",
          flexWrap:"wrap",
          gap:"1rem",
          justifyContent:"start",
          alignItems:"center",
          padding:"1rem",
         
          backgroundColor:theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'background.default',
          
        }}>
          {inquilinosPaginados.map((inquilino) => (
            <PlayerCard
              key={inquilino.id}
              id={inquilino.id}
              nombre={`${inquilino.nombre} ${inquilino.apellido}`}
              direccion={inquilino.direccionResidencial}
              telefono={inquilino.telefono}
              email={inquilino.email}
              onDelete={handleDelete}
            />
          ))}
        </TableContainer>
         <Box display="flex" justifyContent="center" mt={2} sx={{width:"100%",height:"2.5rem", marginTop:"-3rem"}}>
         {Array.from({ length: totalPaginas }, (_, i) => (
           <Button
             key={i + 1}
             variant={paginaActual === i + 1 ? 'contained' : 'outlined'}
             onClick={() => setPaginaActual(i + 1)}
             sx={{ mx: 0.5 }}
           >
             {i + 1}
           </Button>
         ))}
       </Box>
    </>

      )}
    </Box>
  );

  const renderMobileView = () => (
    <Box sx={{ width: '100%' }}>
      {inquilinosPaginados.map(inquilino => (
        <Paper 
          key={inquilino.id} 
          sx={{ mb: 2, borderRadius: 2, boxShadow: 1, '&:hover': { boxShadow: 3 }, bgcolor: 'background.paper' }}
        >
          <Box 
            sx={{ p: 2,display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => handleToggleCard(inquilino.id) }
          >
            <Typography variant="h6">{inquilino.nombre} {inquilino.apellido}</Typography>
            <IconButton
              onClick={(e) => { e.stopPropagation(); handleToggleCard(inquilino.id); }}
              sx={{
                transform: expandedCards[inquilino.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s',
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Box>
          <Collapse in={!!expandedCards[inquilino.id]}>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{p:2, pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography><strong>DNI:</strong> {inquilino.dni || 'No disponible'}</Typography>
              <Typography><strong>Email:</strong> {inquilino.email || 'No disponible'}</Typography>
              <Typography><strong>Teléfono:</strong> {inquilino.telefono || 'No disponible'}</Typography>
              <Typography><strong>Dirección:</strong> {inquilino.direccionResidencial || 'No disponible'}</Typography>
              <Typography><strong>Usuario:</strong> {inquilino.usuarioDtoSalida?.username || 'No asignado'}</Typography>
            </Box>
            <Box sx={{padding: 0, display: 'flex', flexDirection: 'row' ,height: '4rem',width:"100%"}}>
            <Box sx={{ borderRadius: "0 0 0 10px",display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 1.5 , backgroundColor: 'rgb(28, 110, 13)',width:"50%"}}>
              <IconButton href={`https://wa.me/${inquilino.telefono}`} target="_blank" sx={{ color: 'white' }}>
                <WhatsAppIcon   sx={{ fontSize: 45 }}/>
              </IconButton>
            </Box>
            <Box sx={{ borderRadius: "0 0 10px 0",display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 1.5, backgroundColor: 'rgb(19, 21, 62)',width:"50%"}}>
              <IconButton href={`mailto:${inquilino.email}`} sx={{ color: 'white' }}>
                <EmailIcon sx={{ fontSize: 45 }}/>
              </IconButton>
            </Box>
            </Box>
          </Collapse>
        </Paper>
      ))}
    </Box>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <Box sx={{ textAlign: "center", padding: 4, width: '100%', display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <CircularProgress />
          <Typography>Cargando inquilinos...</Typography>
        </Box>
      );
    }

    if (error) {
      return (
        <Box sx={{ padding: 3, bgcolor: 'rgba(255, 87, 87, 0.15)', borderRadius: 2, color: 'error.main', width: '100%' }}>
          <Typography>Error al cargar los inquilinos: {error.message}</Typography>
        </Box>
      );
    }

    if (filteredInquilinos.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'background.paper', borderRadius: 3, mx: 'auto', boxShadow: 1, width: {xs:"80%",md:"100%"} }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            No se encontraron inquilinos con los criterios de búsqueda.
          </Typography>
        </Box>
      );
    }

    return (
      <>
        {isMobile ? renderMobileView() : renderDesktopView()}
        {totalPaginas > 1 && (
          <Box display="flex" justifyContent="center" mt={2}>
            {Array.from({ length: totalPaginas }, (_, i) => (
              <Button
                key={i + 1}
                variant={paginaActual === i + 1 ? 'contained' : 'outlined'}
                onClick={() => setPaginaActual(i + 1)}
                sx={{ mx: 0.5 }}
              >
                {i + 1}
              </Button>
            ))}
          </Box>
        )}
      </>
    );
  };

  return (
    <Box sx={{marginTop:{xs:"0", md:"2rem"}, width: "100%", minHeight: "100vh", pt: { xs: 3, sm: 4 }, pb: { xs: 8, sm: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center', bgcolor: 'background.default' }}>
      <TenantsTour />
      <Box sx={{ width: { xs: "90%", sm: "80%" }, mt: { xs: '4rem', sm: 0 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton onClick={() => navigate(-1)} sx={{ bgcolor: 'action.hover' }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary' }} data-tour="tenants-title">
              Inquilinos
            </Typography>
          </Box>
          <Tooltip title="Añadir inquilino">
            <Fab color="primary" aria-label="add" size="small" data-tour="tenants-add" onClick={() => navigate('/nuevo-inquilino')}>
              <AddIcon />
            </Fab>
          </Tooltip>
        </Box>
        
        <TextField
          data-tour="tenants-search"
          placeholder="Buscar por nombre, apellido, email..."
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 3, bgcolor: 'background.paper', borderRadius: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
        
        {renderContent()}
        {/* Anchor pagination group for tour */}
        {totalPaginas > 1 && (
          <Box data-tour="tenants-pagination" />
        )}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>Editar</MenuItem>
          <MenuItem onClick={handleDelete}>Eliminar</MenuItem>
        </Menu>

      </Box>
    </Box>
  );
};

export default InquilinosPage;