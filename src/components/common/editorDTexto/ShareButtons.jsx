import React from 'react';
import { 
  Box, 
  Button, 
  Menu, 
  MenuItem, 
  IconButton, 
  Typography, 
  useTheme,
  Divider,
  CircularProgress
} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import GoogleIcon from '@mui/icons-material/Google';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import axios from 'axios';
import Swal from 'sweetalert2';
import { showAlert, showError, showInfo, showSuccess } from '../../alertas/showAlert';
const ShareButtons = ({ contrato, contenido }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [isLoadingGoogleDocs, setIsLoadingGoogleDocs] = React.useState(false);
  const [isLoadingWord, setIsLoadingWord] = React.useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    // No cerrar el menú si algo está cargando
    if (!isLoadingGoogleDocs && !isLoadingWord) {
      setAnchorEl(null);
    }
  };

  // Función para limpiar HTML y convertir a texto plano
  const htmlToText = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Compartir con Google Docs
  const shareWithGoogleDocs = () => {
    const text = htmlToText(contenido);
    const encodedText = encodeURIComponent(text);
    const title = encodeURIComponent(`Contrato - ${contrato?.nombreContrato || 'Sin título'}`);
    
    // URL para crear un nuevo documento en Google Docs con contenido
    const googleDocsUrl = `https://docs.google.com/document/create?title=${title}&body=${encodedText}`;
    
    window.open(googleDocsUrl, '_blank');
    handleClose();
  };



  const handleExportToGoogleDocs = async () => {
    setIsLoadingGoogleDocs(true);
    
    // Delay mínimo para que se vea el spinner
    const minDelay = new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const jwt = localStorage.getItem('token');
      if (!jwt) {
        await minDelay; // Esperar el delay mínimo
        showInfo('Iniciá sesión primero');
        setIsLoadingGoogleDocs(false);
        return;
      }
      
    
      
      const [, { data }] = await Promise.all([
        minDelay,
        axios.post(
          `${import.meta.env.VITE_API_URL}/google/docs/from-html`,
          {
            title: `Contrato - ${contrato?.nombreContrato || 'documento'}`,
            html: contenido, // tu HTML del editor
          },
          {
            headers: { Authorization: `Bearer ${jwt}` },
            withCredentials: true,
          }
        )
      ]);
      
  
      if (data?.webViewLink) {
        window.open(data.webViewLink, '_blank');
        showSuccess("Documento creado en tu Google Drive.");
        // Cerrar el menú después de éxito
        setTimeout(() => {
          setAnchorEl(null);
        }, 1000);
      } else {
        showError("No se recibió el enlace del documento.");
      }
    } catch (err) {
      console.error('Error en Google Docs:', err);
      
      // Manejo específico de errores
      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;
        
        switch (status) {
          case 401:
            showError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            break;
          case 403:
            showInfo('Asegurate de vincular tu cuenta de Google desde la sección de ajustes');
            break;
          case 404:
            showError('Servicio de Google Docs no disponible. Contacta al administrador.');
            break;
          case 500:
            showError('Error del servidor. Intenta nuevamente en unos minutos.');
            break;
          default:
            if (errorData?.message) {
              showError(`Error: ${errorData.message}`);
            } else {
              showError(`Error del servidor (${status}). Intenta nuevamente.`);
            }
        }
      } else if (err.request) {
        showError('No se pudo conectar con el servidor. Verifica tu conexión a internet.');
      } else {
        showError('Error inesperado. Intenta nuevamente.');
      }
    } finally {
      setIsLoadingGoogleDocs(false);
    }
  };
  // Exportar como archivo Word (.doc)
  const exportToWord = async () => {
    setIsLoadingWord(true);
    
    // Delay mínimo para que se vea el spinner
    const minDelay = new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      await minDelay;
      
      // Función para convertir HTML a texto plano manteniendo formato básico
      const htmlToRtf = (html) => {
        let rtf = html;
        
        // Convertir etiquetas HTML básicas a RTF
        rtf = rtf.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '{\\b $1\\b0}');
        rtf = rtf.replace(/<b[^>]*>(.*?)<\/b>/gi, '{\\b $1\\b0}');
        rtf = rtf.replace(/<u[^>]*>(.*?)<\/u>/gi, '{\\ul $1\\ul0}');
        rtf = rtf.replace(/<em[^>]*>(.*?)<\/em>/gi, '{\\i $1\\i0}');
        rtf = rtf.replace(/<i[^>]*>(.*?)<\/i>/gi, '{\\i $1\\i0}');
        rtf = rtf.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '{\\b\\fs28 $1\\b0\\fs24}\\par');
        rtf = rtf.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\\par');
        rtf = rtf.replace(/<br[^>]*>/gi, '\\par');
        rtf = rtf.replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\\par');
        
        // Limpiar etiquetas HTML restantes
        rtf = rtf.replace(/<[^>]+>/g, '');
        
        // Decodificar entidades HTML básicas
        rtf = rtf.replace(/&nbsp;/g, ' ');
        rtf = rtf.replace(/&amp;/g, '&');
        rtf = rtf.replace(/&lt;/g, '<');
        rtf = rtf.replace(/&gt;/g, '>');
        rtf = rtf.replace(/&quot;/g, '"');
        
        return rtf;
      };

      const rtfContent = htmlToRtf(contenido);
      
      const rtfDocument = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
\\f0\\fs24 
{\\b\\fs28 Contrato - ${contrato?.nombreContrato || 'Sin título'}\\b0\\fs24}\\par\\par
${rtfContent}
}`;

      const blob = new Blob([rtfDocument], { 
        type: 'application/rtf' 
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Contrato_${contrato?.nombreContrato || 'Sin_titulo'}.rtf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Cerrar el menú después de éxito
      setTimeout(() => {
        setAnchorEl(null);
      }, 500);
      
    } catch (err) {
      console.error('Error al exportar Word:', err);
      showError('Error al generar el archivo Word');
    } finally {
      setIsLoadingWord(false);
    }
  };

  // Exportar como PDF
  const exportToPDF = () => {
    try {
      // Crear contenido HTML optimizado para PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Contrato - ${contrato?.nombreContrato || 'Sin título'}</title>
            <style>
              @page {
                size: A4;
                margin: 20mm;
              }
              * {
                box-sizing: border-box;
              }
              body { 
                font-family: 'Times New Roman', serif; 
                font-size: 12pt; 
                line-height: 1.6; 
                margin: 0;
                padding: 0;
                text-align: justify;
                color: black;
                background: white;
              }
              h1, h2, h3 { 
                color: black; 
                page-break-after: avoid;
                margin-top: 0;
              }
              h1 {
                font-size: 16pt;
                text-align: center;
                margin-bottom: 30px;
              }
              p { 
                margin-bottom: 1em; 
                page-break-inside: avoid;
              }
              strong, b { font-weight: bold; }
              u { text-decoration: underline; }
              em, i { font-style: italic; }
              .page-break { page-break-before: always; }
              
              @media print {
                body { 
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            <h1>Contrato - ${contrato?.nombreContrato || 'Sin título'}</h1>
            <div class="content">
              ${contenido}
            </div>
          </body>
        </html>
      `;
      
      // Crear un Blob con el contenido HTML
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Abrir en nueva pestaña para que el usuario pueda imprimir/guardar como PDF
      const newWindow = window.open(url, '_blank');
      
      if (newWindow) {
        // Limpiar la URL después de un tiempo
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 10000);
        
        showInfo('Se abrió una nueva pestaña. Usa Ctrl+P para imprimir o guardar como PDF');
      } else {
        // Si el popup fue bloqueado, crear un enlace de descarga
        const link = document.createElement('a');
        link.href = url;
        link.download = `Contrato_${contrato?.nombreContrato || 'Sin_titulo'}_para_PDF.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showInfo('Archivo descargado. Ábrelo en tu navegador y usa Ctrl+P para guardar como PDF');
      }
      
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      showError('Error al generar el PDF. Intenta nuevamente.');
    }
    
    handleClose();
  };

  // Descargar como archivo HTML
  const downloadAsHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Contrato - ${contrato?.nombreContrato || 'Sin título'}</title>
          <style>
            body { 
              font-family: 'Times New Roman', serif; 
              font-size: 12pt; 
              line-height: 1.6; 
              margin: 40px;
              text-align: justify;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
            }
            h1, h2, h3 { color: #333; }
            p { margin-bottom: 1em; }
            strong { font-weight: bold; }
            u { text-decoration: underline; }
          </style>
        </head>
        <body>
          <h1>Contrato - ${contrato?.nombreContrato || 'Sin título'}</h1>
          ${contenido}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Contrato_${contrato?.nombreContrato || 'Sin_titulo'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    handleClose();
  };

  return (
    <Box>
      <Button
        variant="outlined"
        startIcon={(isLoadingGoogleDocs || isLoadingWord) ? <CircularProgress size={16} /> : <ShareIcon />}
        onClick={handleClick}
        disabled={isLoadingGoogleDocs || isLoadingWord}
        sx={{
          borderColor: theme.palette.primary.main,
          color: theme.palette.primary.main,
          '&:hover': {
            borderColor: theme.palette.primary.dark,
            backgroundColor: theme.palette.action.hover,
          }
        }}
      >
        {isLoadingGoogleDocs ? 'Abriendo en Google Docs...' : 
         isLoadingWord ? 'Descargando Word...' : 'Compartir'}
      </Button>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            minWidth: 250,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            zIndex: 200000,
          }
        }}
      >
        {/* <MenuItem onClick={handleExportToGoogleDocs} disabled={isLoadingGoogleDocs}>
          {isLoadingGoogleDocs ? (
            <CircularProgress size={20} sx={{ mr: 2, color: '#4285f4', zIndex: 200000 }} />
          ) : (
            <GoogleIcon sx={{ mr: 2, color: '#4285f4' }} />
          )}
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {isLoadingGoogleDocs ? 'Creando documento...' : 'Docs'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isLoadingGoogleDocs ? 'Por favor espera' : 'Abrir en Google Docs'}
            </Typography>
          </Box>
        </MenuItem>
        
        <Divider /> */}
        
        <MenuItem onClick={exportToWord} disabled={isLoadingWord}>
          {isLoadingWord ? (
            <CircularProgress size={20} sx={{ mr: 2, color: '#2b579a', zIndex: 200000 }} />
          ) : (
            <DescriptionIcon sx={{ mr: 2, color: '#2b579a' }} />
          )}
          <Box>
            <Typography variant="body2" fontWeight={500}>
              {isLoadingWord ? 'Descargando Word...' : 'Descargar Word'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isLoadingWord ? 'Por favor espera' : 'Archivo .rtf (compatible con Word)'}
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem onClick={exportToPDF}>
          <PictureAsPdfIcon sx={{ mr: 2, color: '#d32f2f' }} />
          <Box>
            <Typography variant="body2" fontWeight={500}>
              Exportar PDF
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Imprimir como PDF
            </Typography>
          </Box>
        </MenuItem>
        
        <MenuItem onClick={downloadAsHTML}>
          <FileDownloadIcon sx={{ mr: 2, color: '#ff9800' }} />
          <Box>
            <Typography variant="body2" fontWeight={500}>
              Descargar HTML
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Archivo .html
            </Typography>
          </Box>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ShareButtons;
