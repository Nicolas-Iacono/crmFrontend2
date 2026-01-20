import React, { useState, useRef, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Modal, Box, Typography, IconButton, TextField, Paper, Chip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useAuth } from '../../context/GlobalAuth';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualKeyboardVisible } from '../../../hooks/useVirtualKeyboardVisible';
import SuggestedQuestions from './SuggestedQuestions';
import AnimatedGradientBackground from './AnimatedGradientBackground';
import AnimatedGradientBackgroundLight from './AnimatedGradientBackgroundLight';
import { keyframes } from '@mui/system';

const API_URL = (import.meta.env?.VITE_API_URL || 'https://crminmobiliario-app-production.up.railway.app/api').replace(/\/+$/, '');

const style = (theme, isKeyboardVisible) => ({
  position: 'relative',
  width: '90%',
  // Use dynamic viewport height to behave well with virtual keyboards (mobile Safari/Chrome)
  height: isKeyboardVisible ? '70dvh' : '80dvh',
  maxHeight: '100dvh',
  // Dejá el bg del Paper sutil/transparente para que se vea el fondo
  bgcolor: 'transparent',
  color: 'black',
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '50px 50px 0 0',
  borderTop: 'rgb(167, 139, 250) solid 3px',
  borderRight: 'rgb(167, 139, 250) solid 3px',
  borderLeft: 'rgb(167, 139, 250) solid 3px',
  boxShadow: '0px 0px 58px 20px rgba(11, 85, 114, 0.64)',
  // importante para contener el fondo "contained"
  overflow: 'hidden',
  // tono base según tema (si querés una base opaca, cambiá esto y/o agadd backdrop-filter)
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(17, 17, 17, 0.69)' : 'rgba(255, 255, 255, 0.65)',
  backdropFilter: 'blur(14px)',
});

const dotBounce = keyframes`
  0% { opacity: 0.2; transform: translateY(0); }
  20% { opacity: 1; transform: translateY(-2px); }
  100% { opacity: 0.2; transform: translateY(0); }
`;

const ChatModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isKeyboardVisible = useVirtualKeyboardVisible();
  const { user, usuarioFetch, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [modo, setModo] = useState('mixto'); // valores: 'mixto' | 'legales' | 'datos'
  const endRef = useRef(null);

  const handleSuggestedQuestion = (question) => {
    setInput(question);
    handleSend(question);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => onClose(),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  // 🧠 Session persistente
  const sessionRef = useRef(null);
  useEffect(() => {
    const key = 'chat_session_id';
    let sid = localStorage.getItem(key);
    if (!sid) {
      sid = crypto?.randomUUID?.() ?? String(Date.now() + Math.random());
      localStorage.setItem(key, sid);
    }
    sessionRef.current = sid;
  }, []);

  // auto scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  // Also scroll when the virtual keyboard visibility changes (mobile)
  useEffect(() => {
    if (open) {
      // Small timeout allows layout to settle after viewport resize
      const t = setTimeout(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isKeyboardVisible, open]);

  const appendMessage = (text, sender) => {
    setMessages(prev => [...prev, { id: Date.now() + Math.random(), text, sender }]);
  };

  const handleSend = async (textToSend) => {
    const text = (typeof textToSend === 'string' ? textToSend : input).trim();
    if (!text || sending) return;

    appendMessage(text, 'user');
    setInput('');
    setSending(true);

    try {
      const res = await axios.post(
          `${API_URL}/chat/preguntar`,
        {
          pregunta: text,
          modo: modo,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token ?? localStorage.getItem('token') ?? ''}`,
            
          },
        }
      );

      const data = res.data;
    const reply = Array.isArray(data) 
  ? data.join('\n')
  : (data?.respuesta ?? data?.reply ?? data?.message ?? typeof data === "string" ? data : JSON.stringify(data));
      appendMessage(reply, 'bot');
    } catch (e) {
      console.error(e);
      appendMessage("Lo siento, hubo un error al enviar tu mensaje.", "bot");
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
const safeMessageText = (msg) => {
  if (typeof msg.text === "string") return msg.text;
  if (msg.text?.respuesta) return msg.text.respuesta;
  if (Array.isArray(msg.text)) return msg.text.join("\n");
  return JSON.stringify(msg.text);
};
const extractListItems = (text) => {
  if (!text || typeof text !== 'string') return null;
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return null;
  const items = [];
  for (const l of lines) {
    const m = l.match(/^(?:\d+[\.)]|[-–*•])\s*(.+)$/);
    if (m && m[1]) {
      items.push(m[1].trim());
    }
  }
  if (items.length >= 2) return items;
  return null;
};
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="chat-modal-title"
      closeAfterTransition
      // Keep mounted so height calculations remain stable across keyboard toggles
      keepMounted
      BackdropProps={{
        sx: {
          // Ensure backdrop consumes touch gestures so the page behind does not scroll
          touchAction: 'none',
        }
      }}
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}
    >
      <>
        <Box
          component={motion.div}
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          {...swipeHandlers}
          sx={style(theme, isKeyboardVisible)}
          className={`chat-modal-content ${open ? 'open' : 'closed'}`}
        >
          {/* 🔮 Fondo contenido al modal (NO global) */}

          {/* Contenido real por encima del fondo */}
          <Box sx={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 40px',
                alignItems: 'center',
                p: 1,
                borderBottom: '1px solid rgba(255,255,255,0.15)'
              }}
            >
              <IconButton
                aria-label="Cerrar chat"
                onClick={onClose}
                size="small"
                disableRipple
                disableFocusRipple
                sx={{
                  justifySelf: 'start',
                  color: theme.palette.mode === 'dark' ? 'rgb(207, 181, 255)' : 'rgba(76, 28, 167, 1)',
                  p: 0.5,
                  '&:hover': { backgroundColor: 'transparent' }
                }}
              >
                <ChevronLeftIcon />
              </IconButton>
              <Typography
                id="chat-modal-title"
                variant="h6"
                sx={{
                  justifySelf: 'center',
                  textAlign: 'center',
                  fontFamily: 'Arial, sans-serif',
                  color: theme.palette.mode === 'dark' ? 'rgb(207, 181, 255)' : 'rgba(76, 28, 167, 1)'
                }}
              >
                TuinmoIA
              </Typography>
              <Box />
            </Box>

            {/* Mensajes */}
            {/* Selector de modo */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              px: 2,
              pt: 1,
            }}>

                 <Chip
                label="Datos"
                size="small"
                color={modo === 'datos' ? 'primary' : 'default'}
                variant={modo === 'datos' ? 'filled' : 'outlined'}
                onClick={() => setModo('datos')}
                sx={{
                  color: modo === 'datos'
                    ? 'white'
                    : (theme.palette.mode === 'dark' ? 'rgb(230, 220, 255)' : 'rgb(51, 32, 100)')
                }}
              />
              
              <Chip
                label="Legales"
                size="small"
                color={modo === 'legales' ? 'primary' : 'default'}
                variant={modo === 'legales' ? 'filled' : 'outlined'}
                onClick={() => setModo('legales')}
                sx={{
                  color: modo === 'legales'
                    ? 'white'
                    : (theme.palette.mode === 'dark' ? 'rgb(230, 220, 255)' : 'rgb(51, 32, 100)')
                }}
              />
           
            </Box>

            {/* Descripción de modos (solo antes de la primera respuesta del bot) */}
            {!messages.some(m => m.sender === 'bot') && (
              <Box sx={{
                px: 2,
                pt: 0.5,
                pb: 1,
              }}>
                <Typography variant="caption" sx={{
                  display: 'block',
                  color: theme.palette.mode === 'dark' ? 'rgba(230, 220, 255, 0.8)' : 'rgba(51, 32, 100, 0.8)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}>
                  <AnimatePresence mode="wait">
                    {modo === 'mixto' && (
                      <motion.span
                        key="mixto"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        style={{ display: 'inline-block' }}
                      >
                        Combinación equilibrada entre explicaciones legales y datos del sistema.
                      </motion.span>
                    )}
                    {modo === 'legales' && (
                      <motion.span
                        key="legales"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        style={{ display: 'inline-block' }}
                      >
                        Respuestas con enfoque jurídico y normativa aplicable.
                      </motion.span>
                    )}
                    {modo === 'datos' && (
                      <motion.span
                        key="datos"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        style={{ display: 'inline-block' }}
                      >
                        Respuestas basadas en la información de tus contratos, inquilinos y propiedades.
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Typography>
              </Box>
            )}

            <Box sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              // Mobile momentum scrolling and prevent scroll chaining
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              touchAction: 'pan-y',
              // Ensure content isn't overlapped by the input when keyboard shows
              pb: 1,
            }}>
              {messages.length === 0 ? (
                <SuggestedQuestions modo={modo} onQuestionClick={handleSuggestedQuestion} />
              ) : (
                messages.map(msg => (
                  <Paper
                    key={msg.id}
                    elevation={2}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      maxWidth: "80%",
                      alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                      bgcolor:
                        msg.sender === "user"
                          ? theme.palette.mode === "dark"
                            ? "rgb(54, 17, 148)"
                            : "rgb(125, 77, 212)"
                          : theme.palette.mode === "dark"
                            ? "rgba(44, 41, 51, 0.9)"
                            : "rgba(226, 226, 226, 0.9)",
                      borderRadius:
                        msg.sender === "user"
                          ? "20px 20px 5px 20px"
                          : "20px 20px 20px 5px",
                      whiteSpace: "pre-wrap",
                      backdropFilter: "blur(2px)"
                    }}
                  >
                   
                    {msg.sender === 'bot' && extractListItems(safeMessageText(msg)) ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {extractListItems(safeMessageText(msg)).map((item, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              p: 1,
                              borderRadius: 2,
                              border: '1px solid',
                              borderColor:
                                theme.palette.mode === 'dark'
                                  ? 'rgba(207, 181, 255, 0.3)'
                                  : 'rgba(76, 28, 167, 0.3)',
                              backgroundColor:
                                theme.palette.mode === 'dark'
                                  ? 'rgba(255,255,255,0.04)'
                                  : 'rgba(255,255,255,0.6)'
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: 'Arial, sans-serif',
                                color: theme.palette.mode === 'dark' ? 'rgb(230, 220, 255)' : 'rgb(51, 32, 100)'
                              }}
                            >
                              {item}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography
                        variant="body1"
                        sx={{
                          fontFamily: "Arial, sans-serif",
                          color:
                            theme.palette.mode === 'dark'
                              ? (msg.sender === 'user' ? 'white' : 'rgb(230, 220, 255)')
                              : (msg.sender === 'user' ? 'white' : 'rgb(51, 32, 100)'),
                        }}
                      >
                        <Typography>{safeMessageText(msg)}</Typography>
                      </Typography>
                    )}
                  </Paper>
                ))
              )}
              {sending && (
                <Paper
                  elevation={2}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    maxWidth: '60%',
                    alignSelf: 'flex-start',
                    bgcolor:
                      theme.palette.mode === 'dark'
                        ? 'rgba(44, 41, 51, 0.9)'
                        : 'rgba(226, 226, 226, 0.9)',
                    borderRadius: '20px 20px 20px 5px',
                    backdropFilter: 'blur(2px)'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: 'Arial, sans-serif',
                        color: theme.palette.mode === 'dark' ? 'rgb(230, 220, 255)' : 'rgb(51, 32, 100)'
                      }}
                    >
                      Pensando
                    </Typography>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 0.5 }}>
                      {[0, 1, 2].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: theme.palette.mode === 'dark' ? 'rgb(230, 220, 255)' : 'rgb(51, 32, 100)',
                            mx: 0.3,
                            animation: `${dotBounce} 1.2s ${i * 0.2}s infinite ease-in-out`
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Paper>
              )}
              <div ref={endRef} />
            </Box>

            {/* Input */}
            <Box sx={{ p: 1, display: 'flex', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.15)', gap: 1 }}>
              <TextField
                sx={{
                  "& .MuiInputBase-input": {
                    
                    color: 'white',
                  },
                  "& .MuiOutlinedInput-root": {
                    backgroundColor:
                    theme.palette.mode === 'dark'
                    ? 'rgba(17,17,17,0.35)'
                    : 'rgba(77, 23, 102, 0.36)',
                    backdropFilter: 'blur(6px)',
                    borderRadius: '50px',
                    "& fieldset": {
                      borderColor: 'rgba(111, 51, 241, 0.99)',
                      borderRadius: '50px',
                    },
                    "&:hover fieldset": {
                      borderColor: 'rgba(111, 51, 241, 0.99)',
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: 'rgba(111, 51, 241, 0.99)',
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: 'rgba(255,255,255,0.75)',
                    opacity: 1,
                  },
                }}
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Escribe un mensaje..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                multiline
                maxRows={4}
              />
              <IconButton onClick={() => handleSend()} sx={{ 
                 color: theme.palette.mode === 'dark' ? 'blueviolet' : 'blueviolet' }} disabled={sending || !input.trim()}>
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </>
    </Modal>
  );
};

export default ChatModal;
