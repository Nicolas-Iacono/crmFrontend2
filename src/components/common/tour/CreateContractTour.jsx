import React, { useEffect, useMemo, useState } from 'react';
import TourTooltip, { modernTourStyles, modernTourLocale } from './TourTooltip';

const CreateContractTour = () => {
  const [run, setRun] = useState(false);
  const [joyrideMod, setJoyrideMod] = useState(null);

  useEffect(() => {
    const seen = localStorage.getItem('createContractTourSeen');
    if (!seen) setRun(true);
    import('react-joyride')
      .then((mod) => setJoyrideMod({ Joyride: mod.default, STATUS: mod.STATUS }))
      .catch(() => setJoyrideMod(null));
  }, []);

  const steps = useMemo(() => [
    { target: 'body', placement: 'center', title: 'Crear Contrato', content: 'Te guiamos por los pasos para crear un contrato.', disableBeacon: true },
    { target: '[data-tour="crearcontrato-title"]', title: 'Título', content: 'Estás en la pantalla de creación de contratos.', placement: 'bottom' },
    { target: '[data-tour="crearcontrato-stepper"]', title: 'Pasos', content: 'Avanzá paso por paso usando el stepper.', placement: 'bottom' },
    { target: '[data-tour="crearcontrato-new-propietario"]', title: 'Nuevo Propietario', content: 'Podés crear un propietario sin salir del flujo.', placement: 'left' },
    { target: '[data-tour="crearcontrato-next"]', title: 'Siguiente', content: 'Usá este botón para avanzar.', placement: 'top' },
    { target: '[data-tour="crearcontrato-submit"]', title: 'Crear Contrato', content: 'Cuando completes todos los pasos, creá el contrato aquí.', placement: 'top' },
  ], []);

  const handleCallback = (data) => {
    if (!joyrideMod) return;
    const finished = [joyrideMod.STATUS.FINISHED, joyrideMod.STATUS.SKIPPED];
    if (finished.includes(data.status)) {
      localStorage.setItem('createContractTourSeen', 'true');
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

export default CreateContractTour;
