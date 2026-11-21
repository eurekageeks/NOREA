import api from './api';

const data = (p) => p.then((r) => r.data);

export const authService = {
  me: () => data(api.get('/auth/me')),
  login: (payload) => data(api.post('/auth/login', payload)),
  register: (payload) => data(api.post('/auth/register', payload)),
  logout: () => data(api.post('/auth/logout')),
  changePassword: (payload) => data(api.put('/auth/password', payload)),
};

export const programService = {
  list: (params) => data(api.get('/programs', { params })),
  get: (slugOrId) => data(api.get(`/programs/${slugOrId}`)),
  create: (payload) => data(api.post('/programs', payload)),
  update: (id, payload) => data(api.put(`/programs/${id}`, payload)),
  remove: (id) => data(api.delete(`/programs/${id}`)),
};

export const enquiryService = {
  submit: (payload) => data(api.post('/enquiries', payload)),
  list: (params) => data(api.get('/enquiries', { params })),
  get: (id) => data(api.get(`/enquiries/${id}`)),
  update: (id, payload) => data(api.put(`/enquiries/${id}`, payload)),
  remove: (id) => data(api.delete(`/enquiries/${id}`)),
  exportCsv: (params) => api.get('/enquiries/export', { params, responseType: 'blob' }),
};

export const studentService = {
  list: (params) => data(api.get('/students', { params })),
  get: (id) => data(api.get(`/students/${id}`)),
  create: (payload) => data(api.post('/students', payload)),
  update: (id, payload) => data(api.put(`/students/${id}`, payload)),
  remove: (id, mode = 'delete') => data(api.delete(`/students/${id}`, { params: { mode } })),
};

export const admissionService = {
  list: (params) => data(api.get('/admissions', { params })),
  create: (payload) => data(api.post('/admissions', payload)),
  update: (id, payload) => data(api.put(`/admissions/${id}`, payload)),
  remove: (id) => data(api.delete(`/admissions/${id}`)),
};

export const dashboardService = {
  stats: () => data(api.get('/dashboard/stats')),
  analytics: (params) => data(api.get('/dashboard/enquiry-analytics', { params })),
  activity: (params) => data(api.get('/dashboard/activity', { params })),
};

export const settingsService = {
  get: () => data(api.get('/settings')),
  update: (settings) => data(api.put('/settings', { settings })),
};

export const userService = {
  list: () => data(api.get('/users')),
  create: (payload) => data(api.post('/users', payload)),
  update: (id, payload) => data(api.put(`/users/${id}`, payload)),
  remove: (id) => data(api.delete(`/users/${id}`)),
};

export const portalService = {
  overview: () => data(api.get('/portal/overview')),
  updateProfile: (payload) => data(api.put('/portal/profile', payload)),
};

export const uploadService = {
  image: (file, onProgress) => {
    const form = new FormData();
    form.append('image', file);
    return data(
      api.post('/uploads/image', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => onProgress?.(Math.round((e.loaded * 100) / (e.total || 1))),
      })
    );
  },
};
