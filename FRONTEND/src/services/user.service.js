import api from './api';

const userService = {
    listUsers: async (params = {}) => {
        const inner = await api.get('/admin/users', { params });
        return {
            users: inner?.users ?? [],
            total: inner?.total ?? 0,
            page: inner?.page ?? 1,
            limit: inner?.limit ?? 10,
        };
    },

    getUserById: async (id) => {
        return api.get(`/admin/users/${id}`);
    },

    blockUser: async (id) => {
        return api.patch(`/admin/users/${id}/block`);
    },

    unblockUser: async (id) => {
        return api.patch(`/admin/users/${id}/unblock`);
    },

    deleteUser: async (id) => {
        return api.delete(`/admin/users/${id}`);
    },
};

export default userService;
