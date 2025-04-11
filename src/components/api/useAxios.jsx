import axios from 'axios';
import { useEffect, useState } from 'react';

// Hook personalizado para obtener datos con Axios
export const useGetAxios = (endpoint) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getAxios = async () => {
      try {
        const response = await axios.get(endpoint);
        setData(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    getAxios();
  }, [endpoint]);

  return { data, error, isLoading };
};

export const postAxios = (endpoint, payload) =>{
  const promise = new Promise((resolve, reject) => {
    axios
    .post(endpoint, payload)
    .then((res) => resolve(res.data))
    .cath((error) => reject(error))
  })
  return promise
}


export default useGetAxios;