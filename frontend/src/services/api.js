// src/services/api.js
import axios from 'axios';

// Creamos una instancia configurada con la variable de entorno
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, 
    headers: {
        'Content-Type': 'application/json',
    }
});

// Ejemplo: Servicio para obtener pacientes
export const getPacientes = async () => {
    try {
        const response = await api.get('/pacientes/');
        return response.data;
    } catch (error) {
        console.error("Error obteniendo pacientes:", error);
        throw error;
    }
};

export default api;