import { create } from 'zustand';
import segretariaService from '../services/segretariaService';

const useSegretariaStore = create((set, get) => ({
  // State
  todos: [],
  todosBacheca: { todo: [], in_progress: [], done: [] },
  selectedTodo: null,
  todosStats: null,
  documents: [],
  documentsByCategoria: {},
  selectedDocument: null,
  loading: false,
  error: null,

  // Actions - Todos
  fetchTodos: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await segretariaService.getTodos(params);
      set({ todos: response.data.results || response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchTodosBacheca: async () => {
    set({ loading: true, error: null });
    try {
      const response = await segretariaService.getTodosBacheca();
      set({ todosBacheca: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchMyTodos: async () => {
    set({ loading: true, error: null });
    try {
      const response = await segretariaService.getMyTodos();
      set({ todos: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchTodosStats: async () => {
    set({ loading: true, error: null });
    try {
      const response = await segretariaService.getTodosStats();
      set({ todosStats: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createTodo: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await segretariaService.createTodo(data);
      set((state) => ({
        todos: [...state.todos, response.data],
        loading: false,
      }));
      // Refresh bacheca
      get().fetchTodosBacheca();
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateTodo: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const response = await segretariaService.updateTodo(id, data);
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? response.data : t)),
        selectedTodo:
          state.selectedTodo?.id === id ? response.data : state.selectedTodo,
        loading: false,
      }));
      // Refresh bacheca
      get().fetchTodosBacheca();
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteTodo: async (id) => {
    set({ loading: true, error: null });
    try {
      await segretariaService.deleteTodo(id);
      set((state) => ({
        todos: state.todos.filter((t) => t.id !== id),
        loading: false,
      }));
      // Refresh bacheca
      get().fetchTodosBacheca();
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  markTodoDone: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await segretariaService.markTodoDone(id);
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? response.data : t)),
        loading: false,
      }));
      // Refresh bacheca
      get().fetchTodosBacheca();
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Actions - Documents
  fetchDocuments: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await segretariaService.getDocuments(params);
      set({ documents: response.data.results || response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  fetchDocumentsByCategoria: async () => {
    set({ loading: true, error: null });
    try {
      const response = await segretariaService.getDocumentsByCategoria();
      set({ documentsByCategoria: response.data, loading: false });
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  createDocument: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await segretariaService.createDocument(formData);
      set((state) => ({
        documents: [...state.documents, response.data],
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateDocument: async (id, formData) => {
    set({ loading: true, error: null });
    try {
      const response = await segretariaService.updateDocument(id, formData);
      set((state) => ({
        documents: state.documents.map((d) =>
          d.id === id ? response.data : d
        ),
        selectedDocument:
          state.selectedDocument?.id === id
            ? response.data
            : state.selectedDocument,
        loading: false,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteDocument: async (id) => {
    set({ loading: true, error: null });
    try {
      await segretariaService.deleteDocument(id);
      set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Utility
  clearError: () => set({ error: null }),
  clearSelectedTodo: () => set({ selectedTodo: null }),
  clearSelectedDocument: () => set({ selectedDocument: null }),
}));

export default useSegretariaStore;