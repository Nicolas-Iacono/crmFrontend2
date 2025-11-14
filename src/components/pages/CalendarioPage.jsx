import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { StaticTimePicker } from '@mui/x-date-pickers/StaticTimePicker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import rrulePlugin from '@fullcalendar/rrule';
import { Box, Typography, useTheme, alpha, useMediaQuery, Modal, List, ListItem, ListItemText, Card, CardContent, CardHeader, IconButton, CircularProgress, Fab, TextField, Button, CardActions } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineOppositeContent, TimelineDot } from '@mui/lab';
import '../styles/Calendar.css';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useContext } from 'react';
import { useAuth } from '../context/GlobalAuth';
import useGoogleLink from '../../hooks/useGoogleLink';
import { calendarApi } from '../api/calendarApi'; // Make sure API is imported
import "../../../src/App.css";
import Swal from 'sweetalert2';
import { showSuccess, showError, showInfo } from '../alertas/showAlert';

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

const buildEventsFromContratos = (contratos) => {
  const events = [];
  const toISODate = (date) => date.toISOString().split('T')[0];

  contratos.forEach((c) => {
    if (!c.fecha_inicio || !c.fecha_fin) return;

    const startDate = new Date(c.fecha_inicio);
    const endDate = new Date(c.fecha_fin);

    // Evento de Vencimiento
    events.push({
      id: `venc-${c.id}`,
      title: `🔴 Vence: ${c.nombreContrato}`,
      start: toISODate(endDate),
      allDay: true,
      backgroundColor: '#ef4444',
      borderColor: '#ef4444',
      textColor: '#fff',
    });

    // Evento de Aviso (1 mes antes)
    const avisoDate = new Date(endDate);
    avisoDate.setMonth(avisoDate.getMonth() - 1);
    events.push({
      id: `aviso-${c.id}`,
      title: `🟣 Aviso: ${c.nombreContrato}`,
      start: toISODate(avisoDate),
      allDay: true,
      backgroundColor: '#7c3aed',
      borderColor: '#7c3aed',
      textColor: '#fff',
    });

    // Eventos de Actualización Recurrentes
    if (c.actualizacion && Number(c.actualizacion) > 0) {
      events.push({
        id: `act-${c.id}`,
        title: `🟠 Actualiza: ${c.nombreContrato}`,
        rrule: {
          freq: 'monthly',
          interval: Number(c.actualizacion),
          dtstart: toISODate(startDate),
          until: toISODate(endDate),
        },
        allDay: true,
        backgroundColor: '#f59e0b',
        borderColor: '#f59e0b',
        textColor: '#1f2937',
      });
    }
  });

  return events;
};

const CalendarioPage = () => {
  const { usuarioFetch, setHasCalendarEvents } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [contratos, setContratos] = useState([]);
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
  const [events, setEvents] = useState([]);
  const { isLinked } = useGoogleLink();
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const [dateRange, setDateRange] = useState(() => {
    const start = dayjs().startOf('month');
    const end = dayjs().endOf('month');
                    return { from: start.toISOString(), to: end.toISOString() };
  });

  useEffect(() => {
    const fetchAllEvents = async () => {
      if (!usuarioFetch?.username) return;
      setLoading(true);

      try {
        // Fetch contract events
        const contratoResponse = await axios.get(`${import.meta.env.VITE_API_URL}/contrato/${usuarioFetch.username}`);
        const contratosData = contratoResponse.data || [];
        const contractEvents = buildEventsFromContratos(contratosData);
        setContratos(contratosData);

        let googleEvents = [];
        // Fetch Google Calendar events if linked
                if (isLinked && dateRange.from && dateRange.to) {
          try {
            // The backend sends already mapped events
                        const response = await calendarApi.listEvents({ from: dateRange.from, to: dateRange.to });
            // The actual events might be in a nested property, e.g., response.events
            const rawGoogleEvents = Array.isArray(response) ? response : response.events || [];
            googleEvents = mapGoogleEvents(rawGoogleEvents);

          } catch (googleError) {
            console.error('Error fetching Google Calendar events:', googleError);
            // Optional: show a toast to the user
          }
        }

        const allEvents = [...contractEvents, ...googleEvents];
        setEvents(allEvents);
        setHasCalendarEvents(allEvents.length > 0);

      } catch (error) {
        console.error('Error fetching contracts:', error);
        setEvents([]); // Clear events on error
        setHasCalendarEvents(false);
      } finally {
        setLoading(false);
      }
    };

        if (dateRange.from && dateRange.to) {
      fetchAllEvents();
    }
    }, [usuarioFetch?.username, isLinked, setHasCalendarEvents, refetchTrigger, dateRange]);



    const handleDatesSet = (arg) => {
    setDateRange({
                              from: arg.start.toISOString(),
      to: arg.end.toISOString(),
    });
  };

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

  const handleNewEventDateChange = (name, value) => {
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

    const handleCreateEvent = async (withEndTime = true) => {
    if (!newEvent.title || !newEvent.startDate || !newEvent.startTime) {
      showInfo('El título, la fecha y la hora de inicio son obligatorios.');
      return;
    }

    try {
      const tz = dayjs.tz.guess();

      const startDateTime = newEvent.startDate.hour(newEvent.startTime.hour()).minute(newEvent.startTime.minute());
      
      let endDateTime;
          if (withEndTime && newEvent.endDate && newEvent.endTime) {
        endDateTime = newEvent.endDate.hour(newEvent.endTime.hour()).minute(newEvent.endTime.minute());
      } else if (newEvent.endDate) {
        endDateTime = newEvent.endDate.hour(startDateTime.hour()).minute(startDateTime.minute());
      } else {
        endDateTime = startDateTime.clone().add(1, 'hour'); // Default to 1 hour event if no end time
      }

            const eventData = {
        summary: newEvent.title,
        start: { dateTime: startDateTime.format() }, // format() includes timezone offset
        end: { dateTime: endDateTime.format() }
      };

      await calendarApi.createEvent(eventData);

      showSuccess('El evento ha sido creado en Google Calendar.');
      handleCloseEndModal();
      setRefetchTrigger(c => c + 1);

    } catch (error) {
      console.error('Error creating event:', error);
      showError('No se pudo crear el evento. Asegúrate de que tu cuenta de Google esté vinculada.');
    }
  };

  return (
    <Box sx={{
      p: { xs:0, sm: 4 },
      bgcolor: 'background.default',
      minHeight: '100vh',
      color: 'text.primary',
      width:{md:"100vw"},
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
     
      <Box className="calendar-container" sx={{ 
        position: 'relative',
        '.fc': {
          '--fc-border-color': theme.palette.divider,
          '--fc-today-bg-color': theme.palette.action.hover,
          '--fc-button-bg-color': theme.palette.primary.main,
          '--fc-button-border-color': theme.palette.primary.main,
          '--fc-button-hover-bg-color': theme.palette.primary.dark,
          '--fc-button-hover-border-color': theme.palette.primary.dark,
          '--fc-button-active-bg-color': theme.palette.primary.dark,
          '--fc-button-active-border-color': theme.palette.primary.dark,
          '--fc-event-bg-color': theme.palette.secondary.main,
          '--fc-event-border-color': theme.palette.secondary.main,
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.background.paper,
          borderRadius: '8px',
          p: 2,
          height:"95vh",
          width:{md:"80vw", xs:"100vw"},
          maxWidth: "1200px"
        },
        '.fc .fc-col-header-cell-cushion, .fc .fc-daygrid-day-number': {
          color: theme.palette.text.secondary,
        },
        '.fc .fc-daygrid-day.fc-day-today': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
        }
      }}>
        {loading && (
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
            <CircularProgress />
          </Box>
        )}
        <div className="my-calendar">
                        <FullCalendar
          datesSet={handleDatesSet}
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
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
            <Timeline position="right" sx={{
              width:"100%", height:"100%", ml:-5.2
            }}>
              {selectedEvents.length > 0 ? (
                selectedEvents.map((event, index) => (
                  <TimelineItem key={event.id || index}>
                    <TimelineOppositeContent
                      sx={{ m: 'auto 0' }}
                      align="right"
                      variant="body2"
                      color="white"
                    >
                      {event.start ? dayjs(event.start).format('h:mm A') : 'All Day'}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                      <TimelineConnector />
                      <TimelineDot color={event.source === 'google' ? 'primary' : 'grey'}>
                      </TimelineDot>
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Box sx={{display:"flex",flexDirection:"row",justifyContent:"space-between",
                    alignItems:"center",backgroundColor:"rgba(255, 255, 255, 0.26)", borderRadius:"15px", width:"15rem"
                    }}>

                      <Typography variant="body1" component="span" sx={{color:"white"}}>
                        {event.title}
                      </Typography>
                      {event.extendedProps?.description &&
                        <Typography variant="">{event.extendedProps.description}</Typography>
                      }
                      </Box>
                    </TimelineContent>
                  </TimelineItem>
                ))
              ) : (
                <Typography sx={{ padding: 2 }}>No hay eventos para este dia.</Typography>
              )}
            </Timeline>
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
