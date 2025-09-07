import React, { useEffect, useMemo, useState } from 'react';

/**
 * AppTour
 * - Shows a first-time guided tour using react-joyride
 * - Persists dismissal in localStorage under "onboardingTourSeen"
 * - Can be skipped at any time using the built-in Skip button
 */
const AppTour = () => {
  const [run, setRun] = useState(false);
  const [joyrideMod, setJoyrideMod] = useState(null); // { Joyride, STATUS }

  useEffect(() => {
    const seen = localStorage.getItem('onboardingTourSeen');
    if (!seen) {
      setRun(true);
    }
    // Lazy load react-joyride to avoid breaking the app if it's not installed yet
    import('react-joyride')
      .then((mod) => {
        setJoyrideMod({ Joyride: mod.default, STATUS: mod.STATUS });
      })
      .catch(() => {
        // If not installed, silently skip rendering the tour
        setJoyrideMod(null);
      });
  }, []);

  const steps = useMemo(
    () => [
      {
        target: 'body',
        placement: 'center',
        title: 'Bienvenido a Tuinmo CRM',
        content:
          'Te mostraremos un breve recorrido por la aplicación. Puedes saltarlo cuando quieras usando el botón "Saltar".',
        disableBeacon: true,
      },
      // Abrir menú (móvil o escritorio)
      {
        target: '[data-tour="open-drawer"]',
        title: 'Menú principal',
        content: 'Toca aquí para abrir el menú lateral con accesos a funciones, para cambiar el logo de tu inmobiliria dirigete a ajustes.',
        placement: 'bottom',
      },
      // Navegación inferior (solo móvil)
      {
        target: '[data-tour="nav-inicio"]',
        title: 'Inicio',
        content: 'Accede a la pantalla principal del CRM.',
        placement: 'top',
      },
      {
        target: '[data-tour="nav-personas"]',
        title: 'Personas',
        content: 'Gestiona Propietarios, Inquilinos y Garantes desde este menú.',
        placement: 'top',
      },
      {
        target: '[data-tour="nav-propiedades"]',
        title: 'Propiedades',
        content: 'Listado y gestión de propiedades.',
        placement: 'top',
      },
      {
        target: '[data-tour="nav-calendario"]',
        title: 'Calendario',
        content: 'Consulta tu agenda y vencimientos.',
        placement: 'top',
      },
      // Items del drawer (cuando esté abierto)
      {
        target: '[data-tour="drawer-calculadora"]',
        title: 'Calculadora de alquileres',
        content: 'Herramienta para calcular actualizaciones y proyecciones.',
        placement: 'right',
      },
      {
        target: '[data-tour="drawer-calendario"]',
        title: 'Calendario',
        content: 'Acceso rápido a tu calendario con recordatorios.',
        placement: 'right',
      },
      {
        target: '[data-tour="drawer-ajustes"]',
        title: 'Ajustes',
        content: 'Configura tu cuenta, logo, datos del negocio y más.',
        placement: 'right',
      },
      {
        target: '[data-tour="toggle-tema"]',
        title: 'Tema claro/oscuro',
        content: 'Cambia el tema de la aplicación según tu preferencia.',
        placement: 'left',
      },
      // Chat IA
      {
        target: '[data-tour="open-chat"]',
        title: 'Asistente TuinmoIA (Beta)',
        content: 'Abre el chat para recibir ayuda y responder dudas dentro de la app.',
        placement: 'left',
      },
    ],
    []
  );

  const handleCallback = (data) => {
    const { status } = data;
    const finishedStatuses = joyrideMod ? [joyrideMod.STATUS.FINISHED, joyrideMod.STATUS.SKIPPED] : [];

    if (finishedStatuses.includes(status)) {
      localStorage.setItem('onboardingTourSeen', 'true');
      setRun(false);
    }
  };

  if (!run || !joyrideMod) return null;

  return (
    <joyrideMod.Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      disableOverlayClose={false}
      spotlightClicks={false}
      disableScrolling={true}
      scrollToFirstStep={true}
      styles={{
        options: {
          primaryColor: '#6f33f1',
          zIndex: 20000,
        },
        tooltipTitle: {
          fontFamily: 'Poppins, sans-serif',
        },
        tooltipContent: {
          fontFamily: 'Poppins, sans-serif',
        },
      }}
      locale={{
        back: 'Atrás',
        close: 'Cerrar',
        last: 'Finalizar',
        next: 'Siguiente',
        skip: 'Saltar',
      }}
      callback={handleCallback}
    />
  );
};

export default AppTour;
