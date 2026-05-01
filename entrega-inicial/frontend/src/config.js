// URL base del API de valoración.
// Para cambiarla, crea un archivo .env en la raíz del proyecto con:
//   VITE_API_BASE_URL=http://tu-servidor:puerto
// O pasa la variable de entorno al construir la imagen Docker.
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001') + '/api/v1';
