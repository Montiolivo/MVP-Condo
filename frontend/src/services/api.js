import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Audio endpoints
export const audioService = {
  getAll: (status) => {
    const params = status ? { status } : {};
    return api.get('/api/audio', { params });
  },
  
  getById: (id) => api.get(`/api/audio/${id}`),
  
  upload: (formData) => {
    return api.post('/api/audio/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  generateAta: (id) => api.post(`/api/audio/${id}/gerar-ata`),
};

export default api;
