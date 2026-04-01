import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

export const api = {
  // Profile
  getProfile: () => axios.get(`${API_BASE}/profile`),
  updateProfile: (data) => axios.put(`${API_BASE}/profile`, data),

  // Skills
  getSkills: () => axios.get(`${API_BASE}/skills`),
  updateSkills: (data) => axios.put(`${API_BASE}/skills`, data),

  // Contacts
  getContacts: () => axios.get(`${API_BASE}/contacts`),
  updateContacts: (data) => axios.put(`${API_BASE}/contacts`, data),
};
