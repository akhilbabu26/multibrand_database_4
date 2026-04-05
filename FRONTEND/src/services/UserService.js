import api from './api';
import { unwrapData } from '../lib/http';

const userService = {
    listUsers: async (params = {}) => {
        const res = await api.get('/admin/users', { params });
        const inner = unwrapData(res.data);
        return {
            users: inner?.users ?? [],
            total: inner?.total ?? 0,
            page: inner?.page ?? 1,
            limit: inner?.limit ?? 10,
        };
    },

    getUserById: async (id) => {
        const res = await api.get(`/admin/users/${id}`);
        return unwrapData(res.data);
    },

    blockUser: async (id) => {
        const res = await api.patch(`/admin/users/${id}/block`);
        return res.data;
    },

    unblockUser: async (id) => {
        const res = await api.patch(`/admin/users/${id}/unblock`);
        return res.data;
    },

    deleteUser: async (id) => {
        const res = await api.delete(`/admin/users/${id}`);
        return res.data;
    },
};

export default userService;
