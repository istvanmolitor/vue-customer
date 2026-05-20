import { createApiClient } from '@user'
import type { CustomerAddress } from '../types'

const api = createApiClient({ baseURL: '/api/admin/customer' })

interface ListParams {
  page?: number;
  search?: string;
  sort?: string;
  direction?: string;
}

interface StoreData {
  name: string;
  internal_name: string;
  tax_number: string;
  description: string;
  customer_group_id: number | null;
  currency_id: number | null;
  language_id: number | null;
  is_buyer: boolean;
  is_seller: boolean;
  invoice_address: CustomerAddress;
  shipping_address: CustomerAddress;
}

export const customerApi = {
  async list(params: ListParams = {}) {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  async create() {
    const response = await api.get('/customers/create');
    return response.data;
  },

  async store(data: StoreData) {
    const response = await api.post('/customers', data);
    return response.data;
  },

  async show(id: number) {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  async edit(id: number) {
    const response = await api.get(`/customers/${id}/edit`);
    return response.data;
  },

  async update(id: number, data: StoreData) {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};

