import axios from 'axios';

const api = axios.create({
  baseURL: '/api/admin/customer',
});

interface ListParams {
  page?: number;
  search?: string;
  sort?: string;
  direction?: string;
}

interface StoreData {
  name: string;
  description: string;
}

export const customerGroupApi = {
  async list(params: ListParams = {}) {
    const response = await api.get('/customer-groups', { params });
    return response.data;
  },

  async create() {
    const response = await api.get('/customer-groups/create');
    return response.data;
  },

  async store(data: StoreData) {
    const response = await api.post('/customer-groups', data);
    return response.data;
  },

  async show(id: number) {
    const response = await api.get(`/customer-groups/${id}`);
    return response.data;
  },

  async edit(id: number) {
    const response = await api.get(`/customer-groups/${id}/edit`);
    return response.data;
  },

  async update(id: number, data: StoreData) {
    const response = await api.put(`/customer-groups/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/customer-groups/${id}`);
    return response.data;
  },
};

