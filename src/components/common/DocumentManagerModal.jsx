import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ShareIcon from '@mui/icons-material/Share';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloseIcon from '@mui/icons-material/Close';
import { showError, showSuccess } from '../alertas/showAlert';

const makeMimeFromName = (name) => {
  const ext = String(name || '').split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  return 'application/octet-stream';
};

const getDisplayName = (doc) => {
  const name = doc?.nombreArchivo || doc?.nombre || '';
  if (!name) return 'Documento';
  const parts = String(name).split('_');
  return parts.length > 1 ? parts.slice(1).join('_') : name;
};

export default function DocumentManagerModal({
  open,
  onClose,
  entityType, // 'inquilino' | 'propietario' | 'garante'
  entityId,
  entityName,
  fetchList, // (id) => Promise<docs[]>
  uploadFiles, // (id, FileList|File[]) => Promise<void>
  deleteDoc, // (docId) => Promise<void>
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [docsList, setDocsList] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState('');

  const [previewUrl, setPreviewUrl] = useState('');
  const [previewMime, setPreviewMime] = useState('application/pdf');
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [currentPdfTitle, setCurrentPdfTitle] = useState('');

  const title = useMemo(() => {
    const base = entityType === 'propietario' ? 'Propietario' : entityType === 'garante' ? 'Garante' : 'Inquilino';
    return `Documentos de ${entityName || base}`;
  }, [entityType, entityName]);

  const refreshDocs = async () => {
    if (!open || !entityId) return;
    try {
      setDocsLoading(true);
      setDocsError('');
      const arr = await fetchList(entityId);
      setDocsList(Array.isArray(arr) ? arr : []);
    } catch (e) {
      console.error(e);
      setDocsError('No se pudieron cargar los documentos');
    } finally {
      setDocsLoading(false);
    }
  };

  useEffect(() => {
    refreshDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, entityId]);

  const handleViewDoc = async (doc) => {
    try {
      const directUrl = doc?.urlArchivo || doc?.url;
      if (!directUrl) throw new Error('no-url');

      const name = doc?.nombreArchivo || doc?.nombre || '';
      const declared = String(doc?.tipo || '').toLowerCase();
      const isPdf = declared === 'pdf' || name.toLowerCase().endsWith('.pdf');

      if (isPdf) {
        // En móvil, abrir en nueva pestaña para evitar bloqueos del visor nativo
        if (isMobile) {
          window.open(directUrl, '_blank', 'noopener');
          return;
        }
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(directUrl);
        setPreviewMime('application/pdf');
        setCurrentPdfTitle(getDisplayName(doc));
        setPdfViewerOpen(true);
        return;
      }

      // Fallback: descargar blob (para imágenes u otros tipos)
      const res = await fetch(directUrl, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
      const blob = await res.blob();
      const mime = blob.type || doc?.contentType || doc?.tipoMime || makeMimeFromName(name);
      const objectUrl = URL.createObjectURL(blob);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(objectUrl);
      setPreviewMime(mime);
      setCurrentPdfTitle(getDisplayName(doc));
      setPdfViewerOpen(true);
    } catch (e) {
      showError('No se pudo previsualizar el documento');
    }
  };

  const handleShareDoc = async (doc) => {
    try {
      // Si ya hay previewUrl, úsalo
      if (previewUrl) {
        if (navigator.share) {
          await navigator.share({ title: getDisplayName(doc), url: previewUrl });
        } else {
          await navigator.clipboard.writeText(previewUrl);
          showSuccess('Enlace copiado al portapapeles');
        }
        return;
      }

      const directUrl = doc?.urlArchivo || doc?.url;
      const name = doc?.nombreArchivo || doc?.nombre || '';
      const declared = String(doc?.tipo || '').toLowerCase();
      const isPdf = declared === 'pdf' || name.toLowerCase().endsWith('.pdf');

      // Para PDFs públicos, compartir URL directa
      if (directUrl && isPdf) {
        if (navigator.share) {
          await navigator.share({ title: getDisplayName(doc), url: directUrl });
        } else {
          await navigator.clipboard.writeText(directUrl);
          showSuccess('Enlace copiado al portapapeles');
        }
        return;
      }

      // Fallback: construir blob URL
      if (directUrl) {
        const res = await fetch(directUrl, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
        const blobUrl = URL.createObjectURL(await res.blob());
        if (navigator.share) {
          await navigator.share({ title: getDisplayName(doc), url: blobUrl });
        } else {
          await navigator.clipboard.writeText(blobUrl);
          showSuccess('Enlace copiado al portapapeles');
        }
      }
    } catch (e) {
      showError('No se pudo compartir el documento');
    }
  };

  const handleDeleteDoc = async (doc) => {
    try {
      await deleteDoc(doc?.id);
      showSuccess('Documento eliminado');
      refreshDocs();
    } catch (e) {
      showError('No se pudo eliminar el documento');
    }
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      await uploadFiles(entityId, files);
      showSuccess('Documento(s) subido(s)');
      refreshDocs();
    } catch (err) {
      console.error(err);
      showError('No se pudieron subir los documentos');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(240, 239, 239, 0.97)', backdropFilter: 'blur(20px)' } }}>
        <DialogTitle sx={{ fontWeight: 600, color: (theme) => theme.palette.mode === 'dark' ? 'rgba(233, 231, 231, 0.91)' : 'rgba(83, 79, 79, 0.97)' }}>{title}</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 1.5, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', borderRadius: 2 }}>
            {docsLoading ? (
              <Typography variant="body2" sx={{color: (theme) => theme.palette.mode === 'dark' ? 'rgba(233, 231, 231, 0.91)' : 'rgba(83, 79, 79, 0.97)'}}>Cargando documentos...</Typography>
            ) : docsError ? (
              <Typography variant="body2" sx={{color: (theme) => theme.palette.mode === 'dark' ? 'rgba(233, 231, 231, 0.91)' : 'rgba(83, 79, 79, 0.97)'}}>{docsError}</Typography>
            ) : (docsList?.length ?? 0) === 0 ? (
              <Typography variant="body2" sx={{color: (theme) => theme.palette.mode === 'dark' ? 'rgba(233, 231, 231, 0.91)' : 'rgba(83, 79, 79, 0.97)'}}>Sin documentos cargados.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {docsList.map((doc, idx) => (
                  <Box key={doc?.id ?? idx} onClick={() => handleViewDoc(doc)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.25, py: 1, borderRadius: 3, bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgb(207, 207, 207)', gap: 1, minHeight: 52, cursor: 'pointer', transition: 'background-color 0.2s ease', '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(96, 47, 211, 0.68)' } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InsertDriveFileIcon sx={{ color: 'white' }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 240, color: (theme) => theme.palette.mode === 'dark' ? 'rgba(233, 231, 231, 0.91)' : 'rgba(26, 26, 26, 0.97)' }}>{getDisplayName(doc)}</Typography>
                        <Typography variant="caption" sx={{color: (theme) => theme.palette.mode === 'dark' ? 'rgba(233, 231, 231, 0.91)' : 'rgba(43, 42, 42, 0.97)'}}>{doc?.tipo || ''}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton onClick={(e) => { e.stopPropagation(); handleShareDoc(doc); }} size="small" sx={{ color: 'white' }}><ShareIcon fontSize="small" /></IconButton>
                      <IconButton onClick={(e) => { e.stopPropagation(); handleDeleteDoc(doc); }} size="small" sx={{ color: 'white' }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: (theme) => theme.palette.mode === 'dark' ? 'rgba(233, 231, 231, 0.91)' : 'rgba(83, 79, 79, 0.97)', textAlign: 'center' }}>Subir documentos</Typography>
            <Box sx={{ width: { xs: '90%', sm: '80%' }, mx: 'auto', bgcolor: 'rgba(92, 19, 226, 0.56)', border: '2px dashed', borderColor: 'white', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('dm-doc-input')?.click()}>
              <input id="dm-doc-input" type="file" multiple style={{ display: 'none' }} onChange={handleUpload} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white', fontWeight: 700 }}>
                <CloudUploadIcon />
                <Typography sx={{ fontWeight: 700 }}>SUBIR DOCUMENTOS</Typography>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{ color: (theme) => theme.palette.mode === 'dark' ? 'rgba(233, 231, 231, 0.91)' : 'rgba(83, 79, 79, 0.97)' }}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Visor */}
      <Dialog 
        open={pdfViewerOpen} 
        onClose={() => setPdfViewerOpen(false)} 
        fullWidth 
        maxWidth="xl" 
        fullScreen={isMobile}
        PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3, width: '100%', m: 0, height: '100dvh' } }}
      >
        {/* Botón cerrar móvil arriba-izquierda */}
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', flex: 1, height: '100%', overflow: 'hidden', position: 'relative' }}>
          {isMobile && (
            <Box sx={{ position: 'absolute', top: 'max(8px, env(safe-area-inset-top))', left: 'max(8px, env(safe-area-inset-left))', zIndex: 10 }}>
              <IconButton size="small" onClick={() => setPdfViewerOpen(false)} sx={{ bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {previewUrl ? (
            <Box sx={{ flex: 1, minHeight: 0 }}>
              {String(previewMime).includes('pdf') ? (
                <object data={previewUrl} type={previewMime || 'application/pdf'} width="100%" height="100%" style={{ display: 'block' }}>
                  <iframe src={previewUrl} title="preview" style={{ width: '100%', height: '100%', border: 0, display: 'block' }} />
                </object>
              ) : String(previewMime).startsWith('image/') ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', width: '100%', height: '100%' }}>
                  <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                </Box>
              ) : (
                <Typography variant="body2" sx={{ p: 2 }}>No hay previsualización disponible para este tipo de archivo.</Typography>
              )}
            </Box>
          ) : (
            <Typography variant="body2" sx={{ p: 2 }}>Cargando documento...</Typography>
          )}
        </DialogContent>

        {/* Acción secundaria: abrir en nueva pestaña cuando es PDF */}
        {previewUrl && String(previewMime).includes('pdf') && (
          <DialogActions sx={{ p: 1.5 }}>
            <Button onClick={() => window.open(previewUrl, '_blank', 'noopener')} variant="outlined">
              Abrir en nueva pestaña
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </>
  );
}
