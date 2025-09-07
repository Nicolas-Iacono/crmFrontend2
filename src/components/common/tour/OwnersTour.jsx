import React, { useEffect, useMemo, useState } from 'react';

const OwnersTour = () => {
  const [run, setRun] = useState(false);
  const [joyrideMod, setJoyrideMod] = useState(null);

  useEffect(() => {
    const seen = localStorage.getItem('ownersTourSeen');
    if (!seen) setRun(true);
    import('react-joyride')
      .then((mod) => setJoyrideMod({ Joyride: mod.default, STATUS: mod.STATUS }))
      .catch(() => setJoyrideMod(null));
  }, []);

  const steps = useMemo(() => [
    {
      target: 'body',
      placement: 'center',
      title: 'Sección Propietarios',
      content: 'Gestioná propietarios: buscá, creá y administrá sus datos.',
      disableBeacon: true,
    },
    {
      target: '[data-tour="owners-title"]',
      title: 'Propietarios',
      content: 'Título de la sección actual.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="owners-add"]',
      title: 'Nuevo propietario',
      content: 'Creá un propietario desde aquí.',
      placement: 'left',
    },
    {
      target: '[data-tour="owners-search"]',
      title: 'Buscar',
      content: 'Buscá por nombre, apellido, email, teléfono o DNI.',
      placement: 'bottom',
    },
    {
      target: '[data-tour="owners-pagination"]',
      title: 'Paginación',
      content: 'Navegá entre páginas de resultados.',
      placement: 'top',
    },
  ], []);

  const handleCallback = (data) => {
    if (!joyrideMod) return;
    const { status } = data;
    const finished = [joyrideMod.STATUS.FINISHED, joyrideMod.STATUS.SKIPPED];
    if (finished.includes(status)) {
      localStorage.setItem('ownersTourSeen', 'true');
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
      styles={{ options: { primaryColor: '#6f33f1', zIndex: 20000 } }}
      locale={{ back: 'Atrás', close: 'Cerrar', last: 'Finalizar', next: 'Siguiente', skip: 'Saltar' }}
      callback={handleCallback}
    />
  );
};

export default OwnersTour;
