import api from './axios';

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

// Racks
export const rackAPI = {
  getAll: (params) => api.get('/rack', { params }),
  get: (id) => api.get(`/rack/${id}`),
  create: (data) => api.post('/rack', data),
  update: (id, data) => api.put(`/rack/${id}`, data),
  delete: (id) => api.delete(`/rack/${id}`)
};

// Trays
export const trayAPI = {
  getAll: (params) => api.get('/tray', { params }),
  get: (id) => api.get(`/tray/${id}`),
  getByQR: (code) => api.get(`/tray/by-qr/${code}`),
  create: (data) => api.post('/tray', data),
  update: (id, data) => api.put(`/tray/${id}`, data),
  delete: (id) => api.delete(`/tray/${id}`)
};

// Laptops
export const laptopAPI = {
  getAll: (params) => api.get('/laptop', { params }),
  getDashboard: (params) => api.get('/laptop/dashboard', { params }),
  get: (id) => api.get(`/laptop/${id}`),
  create: (data) => api.post('/laptop', data),
  update: (id, data) => api.put(`/laptop/${id}`, data),
  delete: (id) => api.delete(`/laptop/${id}`)
};

// Assignments
export const assignmentAPI = {
  getAll: (params) => api.get('/assignment', { params }),
  get: (id) => api.get(`/assignment/${id}`),
  assign: (data) => api.post('/assignment/assign', data),
  return: (data) => api.post('/assignment/return', data)
};

// Employees
export const employeeAPI = {
  getAll: (params) => api.get('/employee', { params }),
  get: (id) => api.get(`/employee/${id}`),
  create: (data) => api.post('/employee', data),
  update: (id, data) => api.put(`/employee/${id}`, data),
  delete: (id) => api.delete(`/employee/${id}`)
};

// Activity
export const activityAPI = {
  getAll: (params) => api.get('/activity', { params })
};

// Tickets
export const ticketAPI = {
  getAll: (params) => api.get('/tickets', { params }),
  getMyTickets: (params) => api.get('/tickets/my-tickets', { params }),
  create: (data) => api.post('/tickets', data),
  respond: (id, data) => api.put(`/tickets/${id}/respond`, data)
};
