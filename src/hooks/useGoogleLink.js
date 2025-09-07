import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../components/context/GlobalAuth';

const useGoogleLink = () => {
      const { token } = useAuth();
  const [googleProfile, setGoogleProfile] = useState(null);
  const [isLinked, setIsLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoogleProfile = useCallback(async () => {
    const authConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL_2}/oauth/google/profile`, authConfig);
      if (response.data.googleLinked) {
        setGoogleProfile(response.data.google);
        setIsLinked(true);
      } else {
        setGoogleProfile(null);
        setIsLinked(false);
      }
    } catch (error) {
      console.error('Error fetching Google profile link status:', error);
      setIsLinked(false);
      setGoogleProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGoogleProfile();

    const params = new URLSearchParams(window.location.search);
    if (params.get('google_link') === 'ok') {
      Swal.fire('¡Éxito!', 'Tu cuenta de Google ha sido vinculada correctamente.', 'success');
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('google_link') === 'error') {
        Swal.fire('Error', 'No se pudo vincular la cuenta de Google.', 'error');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

  }, [fetchGoogleProfile]);

          const handleLink = async () => {
    const authConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };
    if (!token) return;
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL_2}/oauth/google/link/state`,
        authConfig
      );

      const { authUrl, state, redirectUri } = data;

      if (!authUrl || !state || !redirectUri) {
        console.error('Respuesta inválida del backend:', data);
        Swal.fire('Error', 'Respuesta inválida del servidor.', 'error');
        return;
      }

      // Redirige directo a Google
      window.location.href = authUrl;
    } catch (error) {
      console.error('Error starting Google link process:', error);
      Swal.fire('Error', 'No se pudo iniciar la vinculación. Inténtalo de nuevo.', 'error');
    }
  };

  const handleUnlink = async () => {
    const authConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    };
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Se desvinculará tu cuenta de Google.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desvincular',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
            if (result.isConfirmed) {
        if (!token) return;
        try {
          await axios.delete(`${import.meta.env.VITE_API_URL_2}/oauth/google/link`, authConfig);
          Swal.fire('¡Éxito!', 'Tu cuenta de Google ha sido desvinculada.', 'success');
          fetchGoogleProfile(); // Refresh state
        } catch (error) {
          console.error('Error unlinking Google account:', error);
          Swal.fire('Error', 'No se pudo desvincular la cuenta. Inténtalo de nuevo.', 'error');
        }
      }
    });
  };

  return { isLinked, isLoading, googleProfile, handleLink, handleUnlink };
};

export default useGoogleLink;
