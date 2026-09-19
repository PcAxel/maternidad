// src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Agrega automáticamente el token JWT a cada petición, si existe.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

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
