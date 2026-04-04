import api from './api';

export const addressService = {
    /**
     * Get all user addresses
     */
    getAddresses: async () => {
        try {
            const res = await api.get('/address');
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Create new address
     */
    createAddress: async (addressData) => {
        try {
            const res = await api.post('/address', addressData);
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Update address
     */
    updateAddress: async (addressId, addressData) => {
        try {
            const res = await api.patch(`/address/${addressId}`, addressData);
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    /**
     * Delete address
     */
    deleteAddress: async (addressId) => {
        try {
            const res = await api.delete(`/address/${addressId}`);
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
};

export default addressService;
