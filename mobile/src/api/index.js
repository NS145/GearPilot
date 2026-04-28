import api from './client';

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const trayAPI = {
  getByQR: (code) => api.get(`/tray/by-qr/${code}`),
  get: (id) => api.get(`/tray/${id}`)
};

export const laptopAPI = {
  create: (data) => api.post('/laptop', data),
  update: (id, data) => api.put(`/laptop/${id}`, data)
};

export const assignmentAPI = {
  getAll: (params) => api.get('/assignment', { params }),
  assign: (data) => api.post('/assignment/assign', data),
  fulfill: (data) => api.post('/assignment/fulfill', data),
  return: (data) => api.post('/assignment/return', data)
};

export const employeeAPI = {
  getAll: (params) => api.get('/employee', { params })
};
