import React, { useEffect, useMemo, useState } from 'react';
import TourTooltip, { modernTourStyles, modernTourLocale } from './TourTooltip';

const PropertiesTour = () => {
  const [run, setRun] = useState(false);
  const [joyrideMod, setJoyrideMod] = useState(null); // { Joyride, STATUS }

  useEffect(() => {
    const seen = localStorage.getItem('propertiesTourSeen');
    if (!seen) {
      setRun(true);
    }
    import('react-joyride')
      .then((mod) => setJoyrideMod({ Joyride: mod.default, STATUS: mod.STATUS }))
      .catch(() => setJoyrideMod(null));
  }, []);

  const steps = useMemo(
    () => [
      {
        target: 'body',
        placement: 'center',
        title: 'Sección Propiedades',
        content:
          'Aquí puedes buscar, crear y gestionar tus propiedades. Puedes saltar el tour cuando quieras.',
        disableBeacon: true,
      },
      {
        target: '[data-tour="propiedades-title"]',
        title: 'Propiedades',
        content: 'Título de la sección actual.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="propiedades-add"]',
        title: 'Nueva propiedad',
        content: 'Pulsa aquí para crear una nueva propiedad.',
        placement: 'left',
      },
      {
        target: '[data-tour="propiedades-search"]',
        title: 'Buscar',
        content: 'Puedes buscar por dirección, tipo, propietario o localidad.',
        placement: 'bottom',
      },
      {
        target: '[data-tour="propiedades-card"]',
        title: 'Tarjeta de propiedad',
        content: 'Cada tarjeta muestra la info principal y te permite abrir el detalle.',
        placement: 'top',
      },
      {
        target: '[data-tour="propiedades-card-addimg"]',
        title: 'Agregar imágenes',
        content: 'Añade fotos a la propiedad desde aquí.',
        placement: 'left',
      },
      {
        target: '[data-tour="propiedades-card-delete"]',
        title: 'Eliminar propiedad',
        content: 'Elimina la propiedad (acción irreversible).',
        placement: 'right',
      },
      {
        target: '[data-tour="propiedades-pagination"]',
        title: 'Paginación',
        content: 'Navega entre páginas de resultados.',
        placement: 'top',
      },
    ],
    []
  );

  const handleCallback = (data) => {
    if (!joyrideMod) return;
    const { status } = data;
    const finishedStatuses = [joyrideMod.STATUS.FINISHED, joyrideMod.STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      localStorage.setItem('propertiesTourSeen', 'true');
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
      disableScrolling
      scrollToFirstStep
      tooltipComponent={TourTooltip}
      styles={modernTourStyles}
      locale={modernTourLocale}
      floaterProps={{ hideArrow: false, styles: { floater: { filter: 'none' }, wrapper: { cursor: 'auto' } } }}
      callback={handleCallback}
    />
  );
};

export default PropertiesTour;
