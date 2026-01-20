import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale('es');
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import esLocale from '@fullcalendar/core/locales/es';
import { Box, Typography, useTheme, alpha, useMediaQuery, Modal, List, ListItem, ListItemText, Card, CardContent, CardHeader, IconButton, CircularProgress, Fab, TextField, Button, CardActions, Grid, ToggleButtonGroup, ToggleButton } from '@mui/material';
import '../styles/Calendar.css';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../context/GlobalAuth';
import useGoogleLink from '../../hooks/useGoogleLink';
import { calendarApi } from '../api/calendarApi'; // Make sure API is imported
import "../../../src/App.css";
import Swal from 'sweetalert2';
import { showSuccess, showError, showInfo } from '../alertas/showAlert';
import multiMonthPlugin from '@fullcalendar/multimonth';
import zIndex from '@mui/material/styles/zIndex';

const mapGoogleEvents = (events) => {
  if (!Array.isArray(events)) {
    console.error('mapGoogleEvents expected an array, but received:', events);
    return [];
  }
  return events.map(event => ({
    title: event.summary,
    start: event.start?.dateTime,
    end: event.end?.dateTime,
    allDay: !event.start?.dateTime, // Events are all-day if dateTime is missing
    id: event.id,
    backgroundColor: '#D32F2F', // A distinct color for Google events
    borderColor: '#D32F2F',
    source: 'google',
  }));
};

const mapContractEvents = (events) =>
  (Array.isArray(events) ? events : []).map((e) => ({
    ...e,
    backgroundColor:
      e.type === 'VENCE' ? '#ef4444' :
      e.type === 'AVISO' ? '#7c3aed' :
      e.type === 'ACTUALIZA' ? '#f59e0b' : undefined,
    borderColor:
      e.type === 'VENCE' ? '#ef4444' :
      e.type === 'AVISO' ? '#7c3aed' :
      e.type === 'ACTUALIZA' ? '#f59e0b' : undefined,
    textColor: e.type === 'ACTUALIZA' ? '#1f2937' : '#fff',
  }));

const CalendarioPage = () => {
  const { setHasCalendarEvents } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedYear, setSelectedYear] = useState(() => dayjs().year());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null
  });
  const calendarRef = useRef(null);
  const rangeRef = useRef({ from: null, to: null });
  const [events, setEvents] = useState([]);
  const { isLinked } = useGoogleLink();
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const fetchEventos = useCallback(async (from, to) => {
    setLoading(true);

    try {
      const contratoEventsResp = await axios.get(
        `${import.meta.env.VITE_API_URL}/contrato/eventos`,
        { params: { from, to } }
      );

      const contractEventsRaw = contratoEventsResp.data || [];
      const contractEvents = mapContractEvents(contractEventsRaw);

      const allEvents = [...contractEvents];
      setEvents(allEvents);
      setHasCalendarEvents(allEvents.length > 0);
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      setEvents([]);
      setHasCalendarEvents(false);
    } finally {
      setLoading(false);
    }
  }, [setHasCalendarEvents]);

  const handleChangeViewMode = (_e, newMode) => {
    if (!newMode) return;
    setViewMode(newMode);
  };

  const getMonthCardTintOpacity = useCallback((count) => {
    const clamped = Math.max(0, Number(count) || 0);
    const maxEvents = 10;
    const minOpacity = 0.18;
    const maxOpacity = 0.9;
    const ratio = Math.min(clamped, maxEvents) / maxEvents;
    return minOpacity + (maxOpacity - minOpacity) * ratio;
  }, []);

  const monthlyEvents = useMemo(() => {
    const grouped = new Map();
    for (let i = 0; i < 12; i += 1) grouped.set(i, []);

    (Array.isArray(events) ? events : []).forEach((e) => {
      const start = e?.start;
      if (!start) return;
      const d = dayjs(start);
      if (!d.isValid()) return;
      if (d.year() !== selectedYear) return;
      const m = d.month();
      grouped.get(m).push(e);
    });

    for (const [m, list] of grouped.entries()) {
      list.sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());
      grouped.set(m, list);
    }

    return grouped;
  }, [events, selectedYear]);

  useEffect(() => {
    if (viewMode !== 'year') return;
    const from = dayjs().year(selectedYear).startOf('year').format('YYYY-MM-DD');
    const to = dayjs().year(selectedYear).endOf('year').format('YYYY-MM-DD');

    if (rangeRef.current.from === from && rangeRef.current.to === to) return;
    rangeRef.current = { from, to };
    fetchEventos(from, to);
  }, [viewMode, selectedYear, refetchTrigger, fetchEventos]);

  const handleDatesSet = useCallback((arg) => {
    if (viewMode !== 'calendar') return;
    const from = (arg.startStr || '').slice(0, 10);
    const to = (arg.endStr || '').slice(0, 10);

    if (!from || !to) return;
    if (rangeRef.current.from === from && rangeRef.current.to === to) return;

    rangeRef.current = { from, to };
    fetchEventos(from, to);
  }, [fetchEventos, viewMode]);

    const handleDateClick = (clickInfo) => {
    const clickedDate = dayjs(clickInfo.date).startOf('day');
        const eventsOnDate = clickInfo.view.calendar.getEvents()
      .filter(event => {
        if (!event.start) return false;
        const eventStart = dayjs(event.start).startOf('day');
        if (event.allDay) {
          return eventStart.isSame(clickedDate);
        }
        const eventEnd = event.end ? dayjs(event.end) : eventStart.add(1, 'hour');
        return clickedDate.isBetween(eventStart, eventEnd, null, '[]');
      })
      .sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());

    setSelectedDate(clickInfo.date);
    setSelectedEvents(eventsOnDate);
    setModalOpen(true);
  };

  const handleCloseModal = () => setModalOpen(false);

  const handleOpenNewEventModal = () => {
    const now = dayjs();
    setNewEvent({
      title: '',
      startDate: now,
      startTime: now,
      endDate: null,
      endTime: null,
    });
    setStartModalOpen(true);
  };

  const handleCloseStartModal = () => setStartModalOpen(false);

  const handleProceedToEndModal = () => {
    setStartModalOpen(false);
    setEndModalOpen(true);
  };

  const handleCloseEndModal = () => setEndModalOpen(false);

  
  const handleNewEventChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  // const handleNewEventDateChange = (name, value) => {
  //   setNewEvent(prev => ({ ...prev, [name]: value }));
  // };

  //   const handleCreateEvent = async (withEndTime = true) => {
  //   if (!newEvent.title || !newEvent.startDate || !newEvent.startTime) {
  //     showInfo('El título, la fecha y la hora de inicio son obligatorios.');
  //     return;
  //   }

  //   try {
  //     const tz = dayjs.tz.guess();

  //     const startDateTime = newEvent.startDate.hour(newEvent.startTime.hour()).minute(newEvent.startTime.minute());
      
  //     let endDateTime;
  //         if (withEndTime && newEvent.endDate && newEvent.endTime) {
  //       endDateTime = newEvent.endDate.hour(newEvent.endTime.hour()).minute(newEvent.endTime.minute());
  //     } else if (newEvent.endDate) {
  //       endDateTime = newEvent.endDate.hour(startDateTime.hour()).minute(startDateTime.minute());
  //     } else {
  //       endDateTime = startDateTime.clone().add(1, 'hour'); // Default to 1 hour event if no end time
  //     }

  //           const eventData = {
  //       summary: newEvent.title,
  //       start: { dateTime: startDateTime.format() }, // format() includes timezone offset
  //       end: { dateTime: endDateTime.format() }
  //     };

  //     await calendarApi.createEvent(eventData);

  //     showSuccess('El evento ha sido creado en Google Calendar.');
  //     handleCloseEndModal();
  //     setRefetchTrigger(c => c + 1);

  //   } catch (error) {
  //     console.error('Error creating event:', error);
  //     showError('No se pudo crear el evento. Asegúrate de que tu cuenta de Google esté vinculada.');
  //   }
  // };

  return (
    <Box sx={{
      p: { xs:0, sm: 4 },
      bgcolor: 'background.default',
      minHeight: '100vh',
      color: 'text.primary',
      width: { xs: '100vw', sm: '100%', md: 'calc(100vw - 20rem)' },
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'column', md: 'row' },
      justifyContent:{xs:"center", sm:"center", md:"space-around"},
      alignItems: { xs: 'center', md: 'center', sm:"center"},
      marginLeft: { md: '15rem' },
      boxSizing: 'border-box',
      gap:"2rem"

    }}>
      <Box sx={{ width: '100%', maxWidth: 1200, mt:2}}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end',pr:2, mb: 2, gap: 2, flexWrap: 'wrap' ,  widht:"100%",
              position:"relative", height:"5rem"}}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleChangeViewMode}
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
             widht:"100%",
                backgroundColor: 'rgba(138, 94, 241, 1)',
                  backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(103, 51, 224, 1) 40%, rgba(88, 44, 200, 1) 100%)',
                  '&:hover': { backgroundColor: 'rgba(122, 15, 228, 1)' },
             position:"absolute",
             top:0,
             right:4,
             zIndex:1200,
             borderRadius:5,
             border: 'none',
             boxShadow: 'none',
             '& .MuiToggleButtonGroup-grouped': {
               border: 'none',
               '&:not(:first-of-type)': {
                 border: 'none',
               },
             },
             '& .MuiToggleButton-root': {
               border: 'none',
               color: '#fff',
               '&:hover': {
                 border: 'none',
               },
               '&.Mui-selected': {
                 border: 'none',
                 color: '#fff',
                    backgroundColor: 'rgba(138, 94, 241, 1)',
                  backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(84, 38, 192, 1) 40%, rgba(88, 44, 200, 1) 100%)',
                  '&:hover': { backgroundColor: 'rgba(122, 15, 228, 1)' },
                 '&:hover': {
                   backgroundColor: 'rgba(122, 15, 228, 1)',
                 },
               },
             },
            
            }}
          >
            <ToggleButton value="calendar">Calendario</ToggleButton>
            <ToggleButton value="year">Anual</ToggleButton>
          </ToggleButtonGroup>

          {viewMode === 'year' && (
            <Box sx={{ display: 'flex', alignItems: 'center', position:"absolute", bottom:-9, right:4 }}>
              <Button
                variant="contained"
                sx={{
                  borderRadius: 25,
                  minWidth: '40px',
                  height: '40px',
                  backgroundColor: 'rgba(138, 94, 241, 1)',
                  backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(103, 51, 224, 1) 40%, rgba(88, 44, 200, 1) 100%)',
                  '&:hover': { backgroundColor: 'rgba(122, 15, 228, 1)' },
                }}
                onClick={() => setSelectedYear((y) => y - 1)}
              >
                {'‹'}
              </Button>
              <Typography variant="h6" sx={{ minWidth: 90, textAlign: 'center' }}>{selectedYear}</Typography>
              <Button
                variant="contained"
                sx={{
                  borderRadius: 25,
                  minWidth: '40px',
                  height: '40px',
                   backgroundColor: 'rgba(138, 94, 241, 1)',
                  backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(103, 51, 224, 1) 40%, rgba(88, 44, 200, 1) 100%)',
                  '&:hover': { backgroundColor: 'rgba(122, 15, 228, 1)' },
                }}
                onClick={() => setSelectedYear((y) => y + 1)}
              >
                {'›'}
              </Button>
            </Box>
          )}
        </Box>

        {viewMode === 'calendar' && (
          <Box className="calendar-container" sx={{ 
        position: 'relative',
        '.fc': {
          '--fc-border-color': theme.palette.divider,
          '--fc-today-bg-color': theme.palette.action.hover,
          '--fc-button-bg-color': 'rgba(138, 94, 241, 1)',
          '--fc-button-border-color': 'rgba(138, 94, 241, 1)',
          '--fc-button-hover-bg-color': 'rgba(122, 15, 228, 1)',
          '--fc-button-hover-border-color': 'rgba(122, 15, 228, 1)',
          '--fc-button-active-bg-color': 'rgba(122, 15, 228, 1)',
          '--fc-button-active-border-color': 'rgba(122, 15, 228, 1)',
          '--fc-event-bg-color': theme.palette.secondary.main,
          '--fc-event-border-color': theme.palette.secondary.main,
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          borderRadius: '8px',
          p: 2,
          height:"95vh",
          width:{ xs:"100vw", sm:"100%", md:"100%" },
          maxWidth: "1200px",
        },
        '.fc .fc-col-header-cell-cushion, .fc .fc-daygrid-day-number': {
          color: theme.palette.text.secondary,
        },
        '.fc .fc-toolbar-title': {
          color: theme.palette.text.primary,
        },
        '.fc .fc-button-primary': {
          backgroundColor: 'rgba(138, 94, 241, 1) !important',
          borderColor: 'rgba(138, 94, 241, 1) !important',
        },
        '.fc .fc-button-primary:hover': {
          backgroundColor: 'rgba(122, 15, 228, 1) !important',
          borderColor: 'rgba(122, 15, 228, 1) !important',
        },
        '.fc .fc-button-primary:focus': {
          boxShadow: 'none',
        },
        '@media (max-width:600px)': {
          '.fc .fc-header-toolbar': {
            width: '100%',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            flexWrap: 'wrap',
            marginTop:{xs:"-4.5rem", md:"1rem"},

            position:"relative"
          },
          '.fc .fc-toolbar-chunk': {
            display: 'flex',
            alignItems: 'center',
            minWidth: 0,
           


          },
          '.fc .fc-toolbar-chunk:first-of-type': {
            flex: '1 1 auto',
            minWidth: 0,
           

          },
          '.fc .fc-toolbar-chunk:last-of-type': {
            flex: '0 0 auto',
            gap: '20px',
            

          },
          '.fc .fc-button.fc-prev-button, .fc .fc-button.fc-next-button': {
            width: '44px',
            height: '44px',
            minWidth: '44px',
            padding: '0 !important',
            borderRadius: '999px !important',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(138, 94, 241, 1) !important',
          },
          '.fc .fc-button-primary.fc-prev-button, .fc .fc-button-primary.fc-next-button': {
            borderRadius: '999px !important',
            
            
          },
          '.fc .fc-prev-button .fc-icon, .fc .fc-next-button .fc-icon': {
            fontSize: '1.2em',
            
          },
          '.fc .fc-toolbar-title': {
            textAlign: 'left',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            paddingLeft: '0px',
            position:"absolute",
            right: 0,
            width: "100%", 
            
          },
        },
        '.fc .fc-daygrid-day.fc-day-today': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
        }
      }}>
        {loading && (
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10,  }}>
            <CircularProgress />
          </Box>
        )}
        <div className="my-calendar">
                        <FullCalendar
          datesSet={handleDatesSet}
          ref={calendarRef}
          locales={[esLocale]}
          locale="es"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin,multiMonthPlugin]}
          initialView="dayGridMonth"
          headerToolbar={isMobile ? {
            left: 'title',
            center: '',
            right: 'prev,next'
          } : {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          dateClick={handleDateClick}
          editable={false}
          selectable={true}
          dayMaxEvents={true}
          timeZone="local"
          
        />
      </div>
      </Box>
        )}

        {viewMode === 'year' && (
          <Box sx={{ position: 'relative' }}>
            {loading && (
              <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            <Grid container spacing={2} sx={{ mb: 13 }}>
              {Array.from({ length: 12 }).map((_, monthIndex) => {
                const monthName = dayjs().year(selectedYear).month(monthIndex).format('MMMM');
                const monthEvents = monthlyEvents.get(monthIndex) || [];
                const tintOpacity = getMonthCardTintOpacity(monthEvents.length);
                return (
                  <Grid item xs={12} sm={6} md={4} key={`${selectedYear}-${monthIndex}`} >
                    <Card sx={{ height: '100%',width:"90%", boxSizing: 'border-box', borderRadius:"20px", boxShadow: '0 4px 8px rgba(0,0,0,0.1)', margin:"0 auto", backgroundColor: monthEvents.length === 0 ? theme.palette.background.paper : alpha('rgb(122, 15, 228)', tintOpacity) }}>
                      <CardHeader
                        title={monthName}
                        subheader={`${monthEvents.length} evento${monthEvents.length === 1 ? '' : 's'}`}
                      />
                      <CardContent sx={{ pt: 0,  }}>
                        {monthEvents.length > 0 ? (
                          <List dense sx={{ py: 0 }}>
                            {monthEvents.slice(0, 8).map((e, idx) => (
                              <ListItem key={e.id || `${monthIndex}-${idx}`} disableGutters sx={{ py: 0.25 }}>
                                <ListItemText
                                  primaryTypographyProps={{ variant: 'body2' }}
                                  primary={e.title}
                                />
                              </ListItem>
                            ))}
                            {monthEvents.length > 8 && (
                              <ListItem disableGutters sx={{ py: 0.25 }}>
                                <ListItemText
                                  primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                                  primary={`+${monthEvents.length - 8} más`}
                                />
                              </ListItem>
                            )}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Sin eventos
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Box>
      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Card sx={{ minWidth: 300, maxWidth: 500, m: 2 ,borderRadius:"15px",
           background: 'linear-gradient(135deg,rgb(53, 74, 168) 0%,rgb(122, 15, 228) 100%)'}}>
          <CardHeader
            sx={{color:"white"}}
            title={`Eventos del ${selectedDate?.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`}
            action={
              <IconButton onClick={handleCloseModal} sx={{color:"white"}}>
                <CloseIcon />
              </IconButton>
            }
          />
          <CardContent sx={{display:"flex",flexDirection:"column",justifyContent:"start",alignItems:"start", borderRadius:"15px",

          }}>
            <List sx={{ width: '100%' }}>
              {selectedEvents.length > 0 ? (
                selectedEvents.map((event, index) => (
                  <ListItem
                    key={event.id || index}
                    disableGutters
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      py: 1,
                    }}
                  >
                    <Box
                      sx={{
                        minWidth: 80,
                        textAlign: 'right',
                        color: 'white',
                        opacity: 0.9,
                        pt: '2px',
                      }}
                    >
                      <Typography variant="body2" color="inherit">
                        {event.start ? dayjs(event.start).format('h:mm A') : 'All Day'}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        mt: '6px',
                        bgcolor: event.source === 'google' ? theme.palette.primary.main : theme.palette.grey[400],
                        flexShrink: 0,
                      }}
                    />

                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: 'rgba(255, 255, 255, 0.26)',
                        borderRadius: '15px',
                        px: 2,
                        py: 1,
                      }}
                    >
                      <Typography variant="body1" component="span" sx={{color:"white"}}>
                        {event.title}
                      </Typography>
                      {event.extendedProps?.description &&
                        <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                          {event.extendedProps.description}
                        </Typography>
                      }
                    </Box>
                  </ListItem>
                ))
              ) : (
                <Typography sx={{ padding: 2 }}>No hay eventos para este dia.</Typography>
              )}
            </List>
          </CardContent>
        </Card>
      </Modal>

   

      <Modal
        open={startModalOpen}
        onClose={handleCloseStartModal}
        aria-labelledby="start-event-modal-title"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Card sx={{ maxWidth: 500, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <CardHeader
              title="Nuevo Evento"
              action={<IconButton onClick={handleCloseStartModal}><CloseIcon /></IconButton>}
            />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Título del Evento"
                name="title"
                value={newEvent.title}
                onChange={handleNewEventChange}
                fullWidth
                variant="outlined"
              />
              <DatePicker
                label="Fecha de Inicio"
                value={newEvent.startDate}
                onChange={(newValue) => handleNewEventDateChange('startDate', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <Typography variant="caption">Hora de Inicio</Typography>
              <StaticTimePicker
                value={newEvent.startTime}
                onChange={(newValue) => handleNewEventDateChange('startTime', newValue)}
                ampm
              />
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
              <Button onClick={handleCloseStartModal}>Cancelar</Button>
              <Button onClick={handleProceedToEndModal} variant="contained">Siguiente</Button>
            </CardActions>
          </LocalizationProvider>
        </Card>
      </Modal>

      <Modal
        open={endModalOpen}
        onClose={handleCloseEndModal}
        aria-labelledby="end-event-modal-title"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Card sx={{ maxWidth: 500, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <CardHeader
              title="Crear Nuevo Evento - Fin (Opcional)"
              action={<IconButton onClick={handleCloseEndModal}><CloseIcon /></IconButton>}
            />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DatePicker
                label="Fecha de Fin"
                value={newEvent.endDate}
                onChange={(newValue) => handleNewEventDateChange('endDate', newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <Typography variant="caption">Hora de Fin</Typography>
              <StaticTimePicker
                value={newEvent.endTime}
                onChange={(newValue) => handleNewEventDateChange('endTime', newValue)}
                ampm
              />
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
              <Button onClick={() => { setEndModalOpen(false); setStartModalOpen(true); }}>Atrás</Button>
              <div>
                                <Button onClick={() => handleCreateEvent(false)} variant="text">Omitir y Crear</Button>
                <Button onClick={() => handleCreateEvent(true)} variant="contained" color="primary" sx={{ ml: 1 }}>Crear Evento</Button>
              </div>
            </CardActions>
          </LocalizationProvider>
        </Card>
      </Modal>

    </Box>
  );
};

export default CalendarioPage;
