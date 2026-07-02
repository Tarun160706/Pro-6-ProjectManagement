import axios from 'axios';

const API_URL = '/api/out-of-scope';

const outOfScopeApi = {
  getAll: async (projectName = '', version = '', search = '') => {
    const params = { projectName, version };
    if (search) params.search = search;
    const response = await axios.get(API_URL, { params });
    return response.data;
  },

  create: async (text, projectName = '', version = '') => {
    const response = await axios.post(API_URL, { text, projectName, version });
    return response.data;
  },

  update: async (id, text) => {
    const response = await axios.put(`${API_URL}/${id}`, { text });
    return response.data;
  },

  remove: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },
};

export default outOfScopeApi;
