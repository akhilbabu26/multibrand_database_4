import api from './api';
import { unwrapData } from '../lib/http';

export const addressService = {
    getAddresses: async () => {
        const res = await api.get('/addresses');
        const data = unwrapData(res.data);
        if (Array.isArray(data)) return data;
        return data?.addresses ?? [];
    },

    getAddress: async (id) => {
        const res = await api.get(`/addresses/${id}`);
        return unwrapData(res.data);
    },

    createAddress: async (payload) => {
        const res = await api.post('/addresses', payload);
        return res.data;
    },

    updateAddress: async (id, payload) => {
        const res = await api.patch(`/addresses/${id}`, payload);
        return res.data;
    },

    deleteAddress: async (id) => {
        const res = await api.delete(`/addresses/${id}`);
        return res.data;
    },

    setDefault: async (id) => {
        const res = await api.patch(`/addresses/${id}/default`);
        return res.data;
    },
};

export default addressService;
