import React from 'react';
import { 
  Box, 
  Chip, 
  Typography, 
  Paper, 
  Grid, 
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import HomeIcon from '@mui/icons-material/Home';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';

const DraggableTags = ({ contrato }) => {
  const theme = useTheme();

  // Definir los tags disponibles organizados por categorías
  const tagCategories = [
    {
      title: 'Propietario',
      icon: <PersonIcon />,
      color: 'primary',
      tags: [
        { label: 'Nombre Propietario', value: `${contrato?.propietario?.nombre || '[NOMBRE_PROPIETARIO]'} ${contrato?.propietario?.apellido || '[APELLIDO_PROPIETARIO]'}`, key: 'propietario_nombre' },
        { label: 'DNI Propietario', value: contrato?.propietario?.dni || '[DNI_PROPIETARIO]', key: 'propietario_dni' },
        { label: 'Email Propietario', value: contrato?.propietario?.email || '[EMAIL_PROPIETARIO]', key: 'propietario_email' },
        { label: 'Teléfono Propietario', value: contrato?.propietario?.telefono || '[TELEFONO_PROPIETARIO]', key: 'propietario_telefono' },
        { label: 'CUIT Propietario', value: contrato?.propietario?.cuit || '[CUIT_PROPIETARIO]', key: 'propietario_cuit' },
        { label: 'Nacionalidad Propietario', value: contrato?.propietario?.nacionalidad || '[NACIONALIDAD_PROPIETARIO]', key: 'propietario_nacionalidad' }
      ]
    },
    {
      title: 'Inquilino',
      icon: <PersonIcon />,
      color: 'secondary',
      tags: [
        { label: 'Nombre Inquilino', value: `${contrato?.inquilino?.nombre || '[NOMBRE_INQUILINO]'} ${contrato?.inquilino?.apellido || '[APELLIDO_INQUILINO]'}`, key: 'inquilino_nombre' },
        { label: 'DNI Inquilino', value: contrato?.inquilino?.dni || '[DNI_INQUILINO]', key: 'inquilino_dni' },
        { label: 'Email Inquilino', value: contrato?.inquilino?.email || '[EMAIL_INQUILINO]', key: 'inquilino_email' },
        { label: 'Teléfono Inquilino', value: contrato?.inquilino?.telefono || '[TELEFONO_INQUILINO]', key: 'inquilino_telefono' },
        { label: 'CUIT Inquilino', value: contrato?.inquilino?.cuit || '[CUIT_INQUILINO]', key: 'inquilino_cuit' },
        { label: 'Nacionalidad Inquilino', value: contrato?.inquilino?.nacionalidad || '[NACIONALIDAD_INQUILINO]', key: 'inquilino_nacionalidad' }
      ]
    },
    {
      title: 'Propiedad',
      icon: <HomeIcon />,
      color: 'success',
      tags: [
        { label: 'Dirección', value: contrato?.propiedad?.direccion || '[DIRECCION_PROPIEDAD]', key: 'propiedad_direccion' },
        { label: 'Localidad', value: contrato?.propiedad?.localidad || '[LOCALIDAD]', key: 'propiedad_localidad' },
        { label: 'Partido', value: contrato?.propiedad?.partido || '[PARTIDO]', key: 'propiedad_partido' },
        { label: 'Provincia', value: contrato?.propiedad?.provincia || '[PROVINCIA]', key: 'propiedad_provincia' },
        { label: 'Tipo Propiedad', value: contrato?.propiedad?.tipo || '[TIPO_PROPIEDAD]', key: 'propiedad_tipo' },
        { label: 'Inventario', value: contrato?.propiedad?.inventario || '[INVENTARIO]', key: 'propiedad_inventario' }
      ]
    },
    {
      title: 'Fechas y Duración',
      icon: <CalendarTodayIcon />,
      color: 'info',
      tags: [
        { label: 'Fecha Inicio', value: contrato?.fecha_inicio ? new Date(contrato.fecha_inicio).toLocaleDateString() : '[FECHA_INICIO]', key: 'fecha_inicio' },
        { label: 'Fecha Fin', value: contrato?.fecha_fin ? new Date(contrato.fecha_fin).toLocaleDateString() : '[FECHA_FIN]', key: 'fecha_fin' },
        { label: 'Duración (meses)', value: contrato?.duracion || '[DURACION_MESES]', key: 'duracion' }
      ]
    },
    {
      title: 'Montos',
      icon: <AttachMoneyIcon />,
      color: 'warning',
      tags: [
        { label: 'Monto Alquiler', value: contrato?.montoAlquiler ? `$${contrato.montoAlquiler.toLocaleString()}` : '[MONTO_ALQUILER]', key: 'monto_alquiler' },
        { label: 'Comisión Contrato', value: contrato?.comisionContratoMonto ? `$${contrato.comisionContratoMonto.toLocaleString()}` : '[COMISION_CONTRATO]', key: 'comision_contrato' },
        { label: 'Comisión Mensual', value: contrato?.comisionMensualMonto ? `$${contrato.comisionMensualMonto.toLocaleString()}` : '[COMISION_MENSUAL]', key: 'comision_mensual' }
      ]
    },
    {
      title: 'Otros',
      icon: <DescriptionIcon />,
      color: 'default',
      tags: [
        { label: 'Nombre Contrato', value: contrato?.nombreContrato || '[NOMBRE_CONTRATO]', key: 'nombre_contrato' },
        { label: 'Destino', value: contrato?.destino || '[DESTINO]', key: 'destino' }
      ]
    }
  ];

  const handleDragStart = (event, tag) => {
    event.dataTransfer.setData('text/plain', tag.value);
    event.dataTransfer.setData('application/json', JSON.stringify(tag));
  };

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        height: '100%',
        backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
        borderRadius: 2
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: theme.palette.primary.main }}>
        Tags Arrastrables
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
        Arrastra los tags al editor para insertar información del contrato
      </Typography>

      {tagCategories.map((category, categoryIndex) => (
        <Accordion 
          key={categoryIndex}
          defaultExpanded={categoryIndex === 0}
          sx={{ 
            mb: 1,
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : 'white',
            '&:before': { display: 'none' }
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              minHeight: 48,
              '& .MuiAccordionSummary-content': { 
                alignItems: 'center',
                gap: 1
              }
            }}
          >
            {category.icon}
            <Typography variant="subtitle1" fontWeight={500}>
              {category.title}
            </Typography>
          </AccordionSummary>
          
          <AccordionDetails sx={{ pt: 0 }}>
            <Grid container spacing={1}>
              {category.tags.map((tag, tagIndex) => (
                <Grid item xs={12} sm={6} key={tagIndex}>
                  <Chip
                    label={tag.label}
                    draggable
                    onDragStart={(e) => handleDragStart(e, tag)}
                    color={category.color}
                    variant="outlined"
                    size="small"
                    sx={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      cursor: 'grab',
                      '&:active': {
                        cursor: 'grabbing'
                      },
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.08)' 
                          : 'rgba(0, 0, 0, 0.04)'
                      }
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Paper>
  );
};

export default DraggableTags;
