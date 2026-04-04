import api from './api';

const userService = {
    getAllUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    
    getUserById: async (id) => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },
    
    updateUser: async (id, data) => {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    }
};

export default userService;
