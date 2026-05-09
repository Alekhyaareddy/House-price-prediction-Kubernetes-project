/**
 * In Kubernetes/Production, we use relative paths.
 * The Nginx proxy handles the redirection to the backend service.
 */
const API_BASE = '/api'; 

export const API = {
  predict: `${API_BASE}/predict`,
  stats: `${API_BASE}/stats`,
  distribution: (filter) => `${API_BASE}/dataset/distribution?neighborhood=${filter}`
};