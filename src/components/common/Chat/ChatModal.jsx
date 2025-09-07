import React, { useState, useRef, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Modal, Box, Typography, IconButton, TextField, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { useAuth } from '../../context/GlobalAuth';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import { motion } from 'framer-motion';
import { useVirtualKeyboardVisible } from '../../../hooks/useVirtualKeyboardVisible';
import SuggestedQuestions from './SuggestedQuestions';
import AnimatedGradientBackground from './AnimatedGradientBackground';
import AnimatedGradientBackgroundLight from './AnimatedGradientBackgroundLight';

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
  borderTop: 'rgb(71, 28, 151) solid 3px',
  borderRight: 'rgb(71, 28, 151) solid 3px',
  borderLeft: 'rgb(71, 28, 151) solid 3px',
  boxShadow: '0px 0px 58px 20px rgba(11, 85, 114, 0.64)',
  // importante para contener el fondo "contained"
  overflow: 'hidden',
  // tono base según tema (si querés una base opaca, cambiá esto y/o agrega backdrop-filter)
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(17,17,17,0.35)' : 'rgba(255,255,255,0.15)',
  backdropFilter: 'blur(6px)',
});

const ChatModal = ({ open, onClose }) => {
  const theme = useTheme();
  const isKeyboardVisible = useVirtualKeyboardVisible();
  const { user, usuarioFetch } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
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
        'https://crminmobiliario-app-production.up.railway.app/api/chat',
        {
          message: text,
          sessionId: sessionRef.current,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id ?? '',
            'x-username': usuarioFetch?.username ?? '',
          },
        }
      );

      const data = res.data;
      const reply = Array.isArray(data) ? data.join('\n') : (data?.reply ?? data?.message ?? data ?? 'Sin respuesta');
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
         {theme.palette.mode === 'dark' ? <AnimatedGradientBackground placement="contained" zIndexBase={0} /> : <AnimatedGradientBackgroundLight placement="contained" zIndexBase={0} />}

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
                  color: theme.palette.mode === 'dark' ? 'rgb(207, 181, 255)' : 'rgb(55, 25, 114)',
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
                  color: theme.palette.mode === 'dark' ? 'rgb(207, 181, 255)' : 'rgb(55, 25, 114)'
                }}
              >
                TuinmoIA
              </Typography>
              <Box />
            </Box>

            {/* Mensajes */}
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
                <SuggestedQuestions onQuestionClick={handleSuggestedQuestion} />
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
                      {msg.text}
                    </Typography>
                  </Paper>
                ))
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
