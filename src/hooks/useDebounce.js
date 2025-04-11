import { useEffect, useState } from 'react';

/**
 * Hook personalizado para implementar debounce en valores
 * @param {any} value - El valor que se quiere debounce
 * @param {number} delay - Tiempo de retraso en milisegundos
 * @returns {any} - El valor después del debounce
 */
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Establecer un temporizador que actualizará el valor después del tiempo de retraso
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el temporizador si el valor cambia antes del tiempo de retraso
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
