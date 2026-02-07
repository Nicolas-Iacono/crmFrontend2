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
import { Box, Typography, useTheme, alpha, useMediaQuery, Modal, List, ListItem, ListItemText, Card, CardContent, CardHeader, IconButton, CircularProgress, Fab, TextField, Button, CardActions, Grid, ToggleButtonGroup, ToggleButton, Paper, Chip } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventIcon from '@mui/icons-material/Event';
import TodayIcon from '@mui/icons-material/Today';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedYear, setSelectedYear] = useState(() => dayjs().year());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);
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

  const handleNewEventDateChange = (name, value) => {
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateEvent = async (withEndTime = true) => {
    if (!newEvent.title || !newEvent.startDate || !newEvent.startTime) {
      showInfo('El título, la fecha y la hora de inicio son obligatorios.');
      return;
    }

    try {
      const startDateTime = newEvent.startDate.hour(newEvent.startTime.hour()).minute(newEvent.startTime.minute());
      
      let endDateTime;
      if (withEndTime && newEvent.endDate && newEvent.endTime) {
        endDateTime = newEvent.endDate.hour(newEvent.endTime.hour()).minute(newEvent.endTime.minute());
      } else if (newEvent.endDate) {
        endDateTime = newEvent.endDate.hour(startDateTime.hour()).minute(startDateTime.minute());
      } else {
        endDateTime = startDateTime.clone().add(1, 'hour');
      }

      const eventData = {
        summary: newEvent.title,
        start: { dateTime: startDateTime.format() },
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
      width: '100vw',
      minHeight: '100vh',
      pt: { xs: 2, sm: 3, md: 2 },
      pb: { xs: 14, sm: 12 },
      pl: { xs: 2, sm: 3, md: '16rem' },
      pr: { xs: 2, sm: 3, md: 3 },
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'background.default',
      boxSizing: 'border-box',
    }}>
      {/* Header Section */}
      <Box sx={{ 
        width: '100%',
        mt: { xs: '4rem', sm: 0 },
        mb: 3,
      }}>
        {/* Title Row */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 2,
          gap: 1,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              onClick={() => navigate(-1)}
              size="small"
              sx={{ 
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                <CalendarMonthIcon sx={{ color: isDark ? '#a78bfa' : '#7c3aed', fontSize: { xs: 20, sm: 24 } }} />
                Calendario
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                Gestiona tus eventos y vencimientos
              </Typography>
            </Box>
          </Box>

          {/* Toggle Buttons */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleChangeViewMode}
            size="small"
            sx={{ 
              backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.1)',
              borderRadius: 2,
              p: 0.3,
              '& .MuiToggleButtonGroup-grouped': {
                border: 'none',
                borderRadius: '8px !important',
                px: { xs: 1, sm: 2 },
                py: 0.5,
              },
              '& .MuiToggleButton-root': {
                color: isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)',
                textTransform: 'none',
                fontWeight: 500,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                '&.Mui-selected': {
                  color: '#fff',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
                  },
                },
              },
            }}
          >
            <ToggleButton value="calendar">
              <TodayIcon sx={{ mr: 0.5, fontSize: { xs: 14, sm: 18 } }} /> Mensual
            </ToggleButton>
            <ToggleButton value="year">
              <EventIcon sx={{ mr: 0.5, fontSize: { xs: 14, sm: 18 } }} /> Anual
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Year Navigation (only in year view) */}
        {viewMode === 'year' && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: 2,
            mb: 2,
          }}>
            <IconButton
              onClick={() => setSelectedYear((y) => y - 1)}
              sx={{
                bgcolor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                '&:hover': { bgcolor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)' },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 700, minWidth: 100, textAlign: 'center' }}>
              {selectedYear}
            </Typography>
            <IconButton
              onClick={() => setSelectedYear((y) => y + 1)}
              sx={{
                bgcolor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                '&:hover': { bgcolor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)' },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        )}
      </Box>

        {viewMode === 'calendar' && (
          <Paper 
            elevation={0}
            className="calendar-container" 
            sx={{ 
              position: 'relative',
              borderRadius: 4,
              overflow: 'hidden',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
              '.fc': {
                '--fc-border-color': isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                '--fc-today-bg-color': isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)',
                '--fc-button-bg-color': '#8b5cf6',
                '--fc-button-border-color': '#8b5cf6',
                '--fc-button-hover-bg-color': '#7c3aed',
                '--fc-button-hover-border-color': '#7c3aed',
                '--fc-button-active-bg-color': '#6d28d9',
                '--fc-button-active-border-color': '#6d28d9',
                '--fc-event-bg-color': '#8b5cf6',
                '--fc-event-border-color': '#8b5cf6',
                color: theme.palette.text.primary,
                backgroundColor: theme.palette.background.paper,
                p: 2,
                minHeight: { xs: '70vh', md: '75vh' },
              },
              '.fc .fc-col-header-cell-cushion': {
                color: theme.palette.text.secondary,
                fontWeight: 600,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                py: 1,
              },
              '.fc .fc-daygrid-day-number': {
                color: theme.palette.text.primary,
                fontWeight: 500,
                padding: '8px',
              },
              '.fc .fc-toolbar-title': {
                color: theme.palette.text.primary,
                fontWeight: 700,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                textTransform: 'capitalize',
              },
              '.fc .fc-button-primary': {
                backgroundColor: '#8b5cf6 !important',
                borderColor: '#8b5cf6 !important',
                borderRadius: '8px !important',
                fontWeight: 500,
                textTransform: 'capitalize',
              },
              '.fc .fc-button-primary:hover': {
                backgroundColor: '#7c3aed !important',
                borderColor: '#7c3aed !important',
              },
              '.fc .fc-button-primary:focus': {
                boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.3) !important',
              },
              '.fc .fc-button-primary:disabled': {
                backgroundColor: isDark ? 'rgba(139, 92, 246, 0.3) !important' : 'rgba(139, 92, 246, 0.5) !important',
              },
              '.fc-event': {
                borderRadius: '6px !important',
                fontWeight: 500,
                fontSize: '0.8rem',
              },
              '.fc .fc-daygrid-day.fc-day-today': {
                backgroundColor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)',
              },
              '.fc .fc-daygrid-day:hover': {
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              },
              '@media (max-width:600px)': {
                '.fc .fc-header-toolbar': {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                },
                '.fc .fc-toolbar-chunk': {
                  display: 'flex',
                  alignItems: 'center',
                },
                '.fc .fc-toolbar-title': {
                  fontSize: '1rem !important',
                },
                '.fc .fc-button': {
                  padding: '6px 10px !important',
                },
              },
            }}
          >
            {loading && (
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                zIndex: 10,
                bgcolor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)',
                borderRadius: 2,
                p: 3,
              }}>
                <CircularProgress sx={{ color: '#8b5cf6' }} />
              </Box>
            )}
            <FullCalendar
              datesSet={handleDatesSet}
              ref={calendarRef}
              locales={[esLocale]}
              locale="es"
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin, multiMonthPlugin]}
              initialView="dayGridMonth"
              headerToolbar={isMobile ? {
                left: 'prev,next',
                center: 'title',
                right: ''
              } : {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={events}
              dateClick={handleDateClick}
              editable={false}
              selectable={true}
              dayMaxEvents={3}
              timeZone="local"
            />
          </Paper>
        )}

        {viewMode === 'year' && (
          <Box sx={{ position: 'relative' }}>
            {loading && (
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)', 
                zIndex: 10,
                bgcolor: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)',
                borderRadius: 2,
                p: 3,
              }}>
                <CircularProgress sx={{ color: '#8b5cf6' }} />
              </Box>
            )}

            <Grid container spacing={2} sx={{ pb: 4 }}>
              {Array.from({ length: 12 }).map((_, monthIndex) => {
                const monthName = dayjs().year(selectedYear).month(monthIndex).format('MMMM');
                const monthEvents = monthlyEvents.get(monthIndex) || [];
                const hasEvents = monthEvents.length > 0;
                const isCurrentMonth = dayjs().year() === selectedYear && dayjs().month() === monthIndex;
                
                return (
                  <Grid item xs={6} sm={4} md={3} key={`${selectedYear}-${monthIndex}`}>
                    <Paper
                      elevation={0}
                      onClick={() => {
                        if (hasEvents) {
                          setSelectedMonth({ index: monthIndex, name: monthName, events: monthEvents });
                          setMonthModalOpen(true);
                        }
                      }}
                      sx={{ 
                        height: '100%',
                        minHeight: 180,
                        borderRadius: 3,
                        cursor: hasEvents ? 'pointer' : 'default',
                        border: isCurrentMonth 
                          ? '2px solid #8b5cf6' 
                          : `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
                        background: hasEvents 
                          ? `linear-gradient(135deg, ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.08)'} 0%, ${isDark ? 'rgba(124, 58, 237, 0.15)' : 'rgba(124, 58, 237, 0.05)'} 100%)`
                          : theme.palette.background.paper,
                        overflow: 'hidden',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: hasEvents ? 'translateY(-4px)' : 'none',
                          boxShadow: hasEvents 
                            ? (isDark ? '0 8px 24px rgba(139, 92, 246, 0.2)' : '0 8px 24px rgba(0,0,0,0.1)')
                            : 'none',
                        },
                      }}
                    >
                      {/* Month Header */}
                      <Box sx={{ 
                        p: 2, 
                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            fontWeight: 700, 
                            textTransform: 'capitalize',
                            color: isCurrentMonth ? '#8b5cf6' : 'text.primary',
                          }}
                        >
                          {monthName}
                        </Typography>
                        {hasEvents && (
                          <Chip
                            label={monthEvents.length}
                            size="small"
                            sx={{
                              bgcolor: '#8b5cf6',
                              color: '#fff',
                              fontWeight: 600,
                              height: 24,
                              minWidth: 32,
                            }}
                          />
                        )}
                      </Box>

                      {/* Events List */}
                      <Box sx={{ p: 1.5 }}>
                        {hasEvents ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {monthEvents.slice(0, 4).map((e, idx) => (
                              <Box
                                key={e.id || `${monthIndex}-${idx}`}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  py: 0.5,
                                  px: 1,
                                  borderRadius: 1,
                                  bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    bgcolor: e.backgroundColor || '#8b5cf6',
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontWeight: 500,
                                  }}
                                >
                                  {e.title}
                                </Typography>
                              </Box>
                            ))}
                            {monthEvents.length > 4 && (
                              <Typography
                                variant="caption"
                                sx={{ 
                                  color: '#8b5cf6', 
                                  fontWeight: 600,
                                  pl: 1,
                                  pt: 0.5,
                                }}
                              >
                                +{monthEvents.length - 4} más
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              textAlign: 'center', 
                              py: 3,
                              opacity: 0.6,
                            }}
                          >
                            Sin eventos
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            minWidth: 320, 
            maxWidth: 480, 
            m: 2,
            borderRadius: 4,
            overflow: 'hidden',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            bgcolor: 'background.paper',
          }}
        >
          {/* Modal Header */}
          <Box sx={{ 
            p: 2.5, 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700 }}>
                {selectedDate?.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {selectedDate?.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric' })}
              </Typography>
            </Box>
            <IconButton 
              onClick={handleCloseModal} 
              sx={{ 
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Events List */}
          <Box sx={{ p: 2, maxHeight: 400, overflowY: 'auto' }}>
            {selectedEvents.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {selectedEvents.map((event, index) => (
                  <Box
                    key={event.id || index}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        minHeight: 40,
                        borderRadius: 2,
                        bgcolor: event.backgroundColor || '#8b5cf6',
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {event.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.start ? dayjs(event.start).format('h:mm A') : 'Todo el día'}
                      </Typography>
                      {event.extendedProps?.description && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ mt: 0.5, fontSize: '0.8rem' }}
                        >
                          {event.extendedProps.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4,
                color: 'text.secondary',
              }}>
                <EventIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography>No hay eventos para este día</Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Modal>

      {/* Month Events Modal */}
      <Modal
        open={monthModalOpen}
        onClose={() => setMonthModalOpen(false)}
        aria-labelledby="month-modal-title"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            width: '90%',
            maxWidth: 500,
            maxHeight: '80vh',
            m: 2,
            borderRadius: 4,
            overflow: 'hidden',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Modal Header */}
          <Box sx={{ 
            p: 2.5, 
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, textTransform: 'capitalize' }}>
                {selectedMonth?.name} {selectedYear}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                {selectedMonth?.events?.length || 0} evento{selectedMonth?.events?.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setMonthModalOpen(false)} 
              sx={{ 
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.1)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Events List */}
          <Box sx={{ p: 2, overflowY: 'auto', flex: 1 }}>
            {selectedMonth?.events?.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {selectedMonth.events.map((event, index) => (
                  <Box
                    key={event.id || index}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        minHeight: 50,
                        borderRadius: 2,
                        bgcolor: event.backgroundColor || '#8b5cf6',
                        flexShrink: 0,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {event.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Chip 
                          label={dayjs(event.start).format('D MMM')}
                          size="small"
                          sx={{ 
                            height: 22,
                            fontSize: '0.7rem',
                            bgcolor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                            color: isDark ? '#a78bfa' : '#7c3aed',
                          }}
                        />
                        {event.start && (
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(event.start).format('h:mm A')}
                          </Typography>
                        )}
                      </Box>
                      {event.type && (
                        <Chip 
                          label={event.type}
                          size="small"
                          sx={{ 
                            mt: 1,
                            height: 20,
                            fontSize: '0.65rem',
                            bgcolor: event.backgroundColor || '#8b5cf6',
                            color: event.textColor || '#fff',
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 4,
                color: 'text.secondary',
              }}>
                <EventIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
                <Typography>No hay eventos para este mes</Typography>
              </Box>
            )}
          </Box>
        </Paper>
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
