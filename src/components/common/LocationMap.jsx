import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, CircularProgress } from '@mui/material';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMap = ({ address, businessName, height = '300px' }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const geocodeAddress = async () => {
      if (!address || address === 'Ciudad, País') {
        setError('Dirección no disponible');
        setLoading(false);
        return;
      }

      try {
        // Using Nominatim (OpenStreetMap) geocoding service
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setCoordinates([lat, lon]);
        } else {
          setError('No se pudo encontrar la ubicación');
        }
      } catch (err) {
        console.error('Error geocoding address:', err);
        setError('Error al buscar la ubicación');
      } finally {
        setLoading(false);
      }
    };

    geocodeAddress();
  }, [address]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height={height}
        sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error || !coordinates) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height={height}
        sx={{ 
          bgcolor: 'rgba(255, 255, 255, 0.1)', 
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}
      >
        <Typography color="white" variant="body2">
          {error || 'Ubicación no disponible'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height, borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={coordinates}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={coordinates}>
          <Popup>
            <div>
              <strong>{businessName}</strong>
              <br />
              {address}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </Box>
  );
};

export default LocationMap;
