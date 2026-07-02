import axios from 'axios';

const API_URL = '/api/milestones';

const milestoneApi = {
  getAll: async (projectName = '', version = '', search = '') => {
    const params = { projectName, version };
    if (search) params.search = search;
    const response = await axios.get(API_URL, { params });
    return response.data;
  },

  create: async (projectName = '', version = '', milestone = '', date = '') => {
    const response = await axios.post(API_URL, { projectName, version, milestone, date });
    return response.data;
  },

  update: async (id, data) => {
    const response = await axios.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  remove: async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },
};

export default milestoneApi;
