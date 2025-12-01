import api from './api';

const segretariaService = {
  // To-Do
  getTodos: (params = {}) => {
    return api.get('/segreteria/todos/', { params });
  },

  getTodo: (id) => {
    return api.get(`/segreteria/todos/${id}/`);
  },

  getTodosBacheca: () => {
    return api.get('/segreteria/todos/bacheca/');
  },

  getMyTodos: () => {
    return api.get('/segreteria/todos/miei/');
  },

  getTodosStats: () => {
    return api.get('/segreteria/todos/statistiche/');
  },

  createTodo: (data) => {
    return api.post('/segreteria/todos/', data);
  },

  updateTodo: (id, data) => {
    return api.patch(`/segreteria/todos/${id}/`, data);
  },

  deleteTodo: (id) => {
    return api.delete(`/segreteria/todos/${id}/`);
  },

  markTodoDone: (id) => {
    return api.post(`/segreteria/todos/${id}/mark_done/`);
  },

  // Documents
  getDocuments: (params = {}) => {
    return api.get('/segreteria/documents/', { params });
  },

  getDocument: (id) => {
    return api.get(`/segreteria/documents/${id}/`);
  },

  getDocumentsByCategoria: () => {
    return api.get('/segreteria/documents/by_categoria/');
  },

  getRecentDocuments: (params = {}) => {
    return api.get('/segreteria/documents/recenti/', { params });
  },

  createDocument: (formData) => {
    return api.post('/segreteria/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateDocument: (id, formData) => {
    return api.patch(`/segreteria/documents/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteDocument: (id) => {
    return api.delete(`/segreteria/documents/${id}/`);
  },
};

export default segretariaService;