import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Modal,
  Backdrop,
  Slide,
  IconButton,
  Typography,
  TextField,
  Paper,
  Grid2,
  Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TextEditor from '../editorDTexto/TextEditor';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { useAuth } from '../../context/GlobalAuth';

const API_URL = (import.meta.env?.VITE_API_URL || 'https://crminmobiliario-app-production.up.railway.app/api').replace(/\/+$/, '');

const EditorWithChatModal = ({ open, onClose, contrato, onSaved }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const canvasRef = useRef(null);
  const rightPaneRef = useRef(null);
  const [fullEditor, setFullEditor] = useState(false);
  const [canvasBlocks, setCanvasBlocks] = useState([]);
  const [savingCanvas, setSavingCanvas] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
      return () => clearTimeout(t);
    }
  }, [open, messages.length]);

  const appendMessage = (text, sender, extra = {}) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), text, sender, ...extra }]);
  };

  const handleSend = async (passedText) => {
    const text = (typeof passedText === 'string' ? passedText : input).trim();
    if (!text || sending) return;
    appendMessage(text, 'user');
    setInput('');
    setSending(true);
    try {
      const url = `${API_URL}/chat/${contrato?.id}/clausula`;
      const headers = { 'Content-Type': 'application/json', ...(token || localStorage.getItem('token') ? { Authorization: `Bearer ${token ?? localStorage.getItem('token')}` } : {}) };
      const res = await axios.post(url, { instruccion: text }, { headers });
      const data = res?.data;
      const reply = data?.clausula ?? data?.respuesta ?? data?.text ?? (typeof data === 'string' ? data : JSON.stringify(data));
      const apiClauseId = data?.id ?? data?.clausulaId ?? data?.clauseId ?? null;
      appendMessage(reply, 'bot', { apiClauseId });
    } catch (e) {
      appendMessage('Ocurrió un error al enviar el mensaje.', 'bot');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAddToCanvas = (msg) => {
    const text = typeof msg?.text === 'string' ? msg.text : JSON.stringify(msg?.text);
    const apiClauseId = msg?.apiClauseId ?? null;
    setCanvasBlocks((prev) => [...prev, { text, apiClauseId }]);
  };

  const handleRemoveCanvasBlock = async (index) => {
    const block = canvasBlocks[index];
    try {
      const id = block?.apiClauseId;
      if (contrato?.id && id) {
        const headers = { ...(token || localStorage.getItem('token') ? { Authorization: `Bearer ${token ?? localStorage.getItem('token')}` } : {}) };
        await axios.delete(`${API_URL}/chat/${contrato.id}/clausula/${id}`, { headers });
      }
    } catch (e) {
      // silenciar error pero continuar removiendo localmente
    } finally {
      setCanvasBlocks((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleClearCanvas = () => {
    setCanvasBlocks([]);
  };

  const handleSaveCanvas = async () => {
    if (!contrato?.id || canvasBlocks.length === 0 || savingCanvas) return;
    setSavingCanvas(true);
    const escape = (s) => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const html = `<div>${canvasBlocks.map(b => `<p>${escape(String(b?.text)).replace(/\n/g, '<br/>')}</p>`).join('')}</div>`;
    try {
      const url = `${API_URL}/contrato/${contrato.id}/updateContract`;
      const jwt = token ?? localStorage.getItem('token') ?? '';
      const payload = { pdfContratoTexto: html, contrato_id: contrato.id };
      await axios.put(url, payload, { headers: { 'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) } });
      if (onSaved) onSaved(html);
    } catch (e) {
    } finally {
      setSavingCanvas(false);
    }
  };

  const fetchClauses = async () => {
    if (!contrato?.id) return;
    try {
      const headers = { ...(token || localStorage.getItem('token') ? { Authorization: `Bearer ${token ?? localStorage.getItem('token')}` } : {}) };
      const res = await axios.get(`${API_URL}/chat/${contrato.id}/clausulas`, { headers });
      const data = res?.data;
      const arr = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      const mapped = arr.map((item) => ({
        text: item?.clausula ?? item?.texto ?? item?.text ?? (typeof item === 'string' ? item : JSON.stringify(item)),
        apiClauseId: item?.id ?? item?.clausulaId ?? item?.clauseId ?? null,
      }));
      setCanvasBlocks(mapped);
    } catch (e) {
    }
  };

  const drawAssistantCanvas = () => {
    if (!rightPaneRef.current || !canvasRef.current) return;
    const container = rightPaneRef.current;
    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;
    const padding = 24;
    const lineHeight = 20;
    const width = container.clientWidth || 600;
    const ctx = canvas.getContext('2d');
    const font = '14px Arial';
    ctx.font = font;

    const raw = canvasBlocks.map(b => (typeof b?.text === 'string' ? b.text : JSON.stringify(b?.text)));

    const lines = [];
    const maxTextWidth = Math.max(50, width - padding * 2);
    const wrap = (text) => {
      const words = (text || '').split(/\s+/);
      let line = '';
      words.forEach((w) => {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width > maxTextWidth) {
          if (line) lines.push(line);
          line = w;
        } else {
          line = test;
        }
      });
      if (line) lines.push(line);
    };

    if (raw.length === 0) {
      wrap('Aún no agregaste textos al contrato. Usa "Agregar a contrato" en los mensajes para enviarlos a este panel.');
    } else {
      raw.forEach((t, idx) => {
        wrap(t);
        if (idx !== raw.length - 1) lines.push('');
      });
    }

    const contentHeight = Math.max(container.clientHeight, padding * 2 + lines.length * lineHeight + 8);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(contentHeight * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${contentHeight}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = isDark ? '#0c0a14' : '#f8f7fc';
    ctx.fillRect(0, 0, width, contentHeight);
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.7)';
    ctx.font = font;
    let y = padding;
    lines.forEach((line) => {
      if (line === '') {
        y += Math.round(lineHeight * 0.6);
      } else {
        y += lineHeight;
        ctx.fillText(line, padding, y);
      }
    });

    // Auto-scroll to bottom to keep canvas "pegado" al bottom
    try {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    } catch {}
  };

  useEffect(() => {
    if (!open || fullEditor) return;
    drawAssistantCanvas();
  }, [open, fullEditor, messages, canvasBlocks, theme.palette.mode]);

  useEffect(() => {
    if (!open || fullEditor) return;
    const on = () => drawAssistantCanvas();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [open, fullEditor, canvasBlocks.length]);

  useEffect(() => {
    if (open) fetchClauses();
  }, [open, contrato?.id]);

  return (
    <Modal open={open} onClose={onClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 300, sx: { backdropFilter: 'blur(4px)' } }}>
      <Slide direction="up" in={open} timeout={250}>
        <Box sx={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          height: { xs: 'calc(100dvh - 56px)', md: '100vh' },
          width: { xs: '100vw', md: '84vw' },
          display: 'flex',
          flexDirection: 'column',
          bgcolor: isDark ? '#0c0a14' : '#f8f7fc',
          boxShadow: { xs: '0 -6px 32px rgba(0,0,0,0.3)', md: '-12px 0 48px rgba(0,0,0,0.2)' },
          borderRadius: { xs: '20px 20px 0 0', md: '24px 0 0 0' },
          overflow: 'hidden',
          zIndex: 1300,
          mx: 'auto',
          maxWidth: { md: 1400 },
        }}>
          {/* Header */}
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            py: 1.5,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
          }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                Asistente de Contrato
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>
                {contrato?.nombreContrato || 'Editor de cláusulas'}
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ color: 'rgba(255,255,255,0.85)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <TextEditor contrato={contrato} embed isOpen={true} onClose={() => {}} onSaved={onSaved} />
          </Box>
        </Box>
      </Slide>
    </Modal>
  );
};

export default EditorWithChatModal;
