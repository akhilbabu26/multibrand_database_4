import api from './api';

export const addressService = {
    getAddresses: async () => {
        const data = await api.get('/addresses');
        if (Array.isArray(data)) return data;
        return data?.addresses ?? [];
    },

    getAddress: async (id) => {
        return api.get(`/addresses/${id}`);
    },

    createAddress: async (payload) => {
        return api.post('/addresses', payload);
    },

    updateAddress: async (id, payload) => {
        return api.patch(`/addresses/${id}`, payload);
    },

    deleteAddress: async (id) => {
        return api.delete(`/addresses/${id}`);
    },

    setDefault: async (id) => {
        return api.patch(`/addresses/${id}/default`);
    },
};

export default addressService;
