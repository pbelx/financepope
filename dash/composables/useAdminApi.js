// composables/useAdminApi.js
export const useAdminApi = () => {
  const config = useRuntimeConfig();
  const API_BASE_URL = config.public.apiBaseUrl;
  const { $api } = useNuxtApp();

  // Dashboard Statistics
  const getDashboardStats = async () => {
    try {
      const response = await $api.get('/admin/dashboard-stats');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch dashboard stats' };
    }
  };

  // User Management
  const getAllUsers = async () => {
    try {
      const response = await $api.get('/users/users');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch users' };
    }
  };

  const getAllAdmins = async () => {
    try {
      const response = await $api.get('/users/admins');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching admins:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch admins' };
    }
  };

  const getAllMembers = async () => {
    try {
      const response = await $api.get('/users/members');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching members:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch members' };
    }
  };

  const makeUserMember = async (userId) => {
    try {
      const response = await $api.post('/users/make-member', { userId });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error making user member:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to promote user to member' };
    }
  };

  const makeUserAdmin = async (userId) => {
    try {
      const response = await $api.post('/users/make-admin', { userId });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error making user admin:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to promote user to admin' };
    }
  };

  const makeUserRegular = async (userId) => {
    try {
      const response = await $api.post('/users/make-user', { userId });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error making user regular:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to demote user' };
    }
  };

  // Order Management
  const getAllOrders = async () => {
    try {
      const response = await $api.get('/order/all');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching orders:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch orders' };
    }
  };

  const getPendingOrders = async () => {
    try {
      const response = await $api.get('/order/pending/all');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch pending orders' };
    }
  };

  const getCompletedOrders = async () => {
    try {
      const response = await $api.get('/order/completed/all');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching completed orders:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch completed orders' };
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await $api.put('/order/update', { orderId, status });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to update order status' };
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const response = await $api.delete('/order/delete', { data: { orderId } });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting order:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to delete order' };
    }
  };

  const assignMemberToOrder = async (orderId, memberId) => {
    try {
      const response = await $api.put('/order/assign-member', { orderId, memberId });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error assigning member to order:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to assign member to order' };
    }
  };

  // System Configuration
  const getAllCurrencies = async () => {
    try {
      const response = await $api.get('/currency/all');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching currencies:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch currencies' };
    }
  };

  const createCurrency = async (currencyData) => {
    try {
      const response = await $api.post('/currency/create', currencyData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating currency:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to create currency' };
    }
  };

  const updateCurrency = async (currencyData) => {
    try {
      const response = await $api.put('/currency/update', currencyData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating currency:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to update currency' };
    }
  };

  const deleteCurrency = async (currencyId) => {
    try {
      const response = await $api.delete(`/currency/delete/${currencyId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error deleting currency:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to delete currency' };
    }
  };

  const getAllBanks = async () => {
    try {
      const response = await $api.get('/banks');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching banks:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch banks' };
    }
  };

  const createBank = async (bankData) => {
    try {
      const response = await $api.post('/banks', bankData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating bank:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to create bank' };
    }
  };

  const updateBank = async (bankData) => {
    try {
      const response = await $api.put('/banks', bankData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating bank:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to update bank' };
    }
  };

  const getAllPlaces = async () => {
    try {
      const response = await $api.get('/places');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching places:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch places' };
    }
  };

  const createPlace = async (placeData) => {
    try {
      const response = await $api.post('/places', placeData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating place:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to create place' };
    }
  };

  const updatePlace = async (placeData) => {
    try {
      const response = await $api.put('/places', placeData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating place:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to update place' };
    }
  };

  // Collections Management
  const getAllCollections = async () => {
    try {
      const response = await $api.get('/collections');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching collections:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch collections' };
    }
  };

  const confirmCollection = async (collectionId) => {
    try {
      const response = await $api.put(`/collections/${collectionId}/confirm`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error confirming collection:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to confirm collection' };
    }
  };

  const rejectCollection = async (collectionId) => {
    try {
      const response = await $api.put(`/collections/${collectionId}/reject`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error rejecting collection:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to reject collection' };
    }
  };

  // Messaging & Notifications
  const getAllMessages = async () => {
    try {
      const response = await $api.get('/messages');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching messages:', error);
      return { success: false, error: error.response?.data?.payload || error.response?.data?.message || 'Failed to fetch messages' };
    }
  };

  const getMessagesByOrder = async (orderId) => {
    try {
      const response = await $api.get(`/messages/${orderId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching messages by order:', error);
      return { success: false, error: error.response?.data?.payload || error.response?.data?.message || 'Failed to fetch messages' };
    }
  };

  const getDirectChatThread = async (targetUserId) => {
    try {
      const response = await $api.get(`/messages/user/${targetUserId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching direct chat thread:', error);
      return { success: false, error: error.response?.data?.payload || error.response?.data?.message || 'Failed to fetch direct chat' };
    }
  };

  const getChatHistory = async (orderId) => {
    try {
      const response = await $api.get(`/messages/chat/${orderId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return { success: false, error: error.response?.data?.payload || error.response?.data?.message || 'Failed to fetch chat history' };
    }
  };

  const sendAdminMessage = async (messageData) => {
    try {
      const response = await $api.post('/messages/admin', messageData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error sending admin message:', error);
      return { success: false, error: error.response?.data?.payload || error.response?.data?.message || 'Failed to send message' };
    }
  };

  const createDirectMessage = async (messageData) => {
    try {
      const response = await $api.post('/messages/direct', messageData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating direct message:', error);
      return { success: false, error: error.response?.data?.payload || error.response?.data?.message || 'Failed to send direct message' };
    }
  };

  const markOrderMessagesAsRead = async (orderId) => {
    try {
      const response = await $api.patch(`/messages/read/${orderId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error marking order messages as read:', error);
      return { success: false, error: error.response?.data?.payload || error.response?.data?.message || 'Failed to mark messages as read' };
    }
  };

  const markDirectMessagesAsRead = async (targetUserId) => {
    try {
      const response = await $api.patch(`/messages/read/user/${targetUserId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error marking direct messages as read:', error);
      return { success: false, error: error.response?.data?.payload || error.response?.data?.message || 'Failed to mark direct messages as read' };
    }
  };

  const getUserNotifications = async (userId) => {
    try {
      const response = await $api.get(`/notifications/${userId}`);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return { success: false, error: error.response?.data?.payload || error.response?.data?.message || 'Failed to fetch notifications' };
    }
  };

  const createNotification = async (notificationData) => {
    try {
      const response = await $api.post('/notifications', notificationData);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error creating notification:', error);
      return { success: false, error: error.response?.data?.payload || error.response?.data?.message || 'Failed to create notification' };
    }
  };

  return {
    // Dashboard
    getDashboardStats,
    
    // User Management
    getAllUsers,
    getAllAdmins,
    getAllMembers,
    makeUserMember,
    makeUserAdmin,
    makeUserRegular,
    
    // Order Management
    getAllOrders,
    getPendingOrders,
    getCompletedOrders,
    updateOrderStatus,
    deleteOrder,
    assignMemberToOrder,
    
    // System Configuration
    getAllCurrencies,
    createCurrency,
    updateCurrency,
    deleteCurrency,
    getAllBanks,
    createBank,
    updateBank,
    getAllPlaces,
    createPlace,
    updatePlace,
    
    // Collections
    getAllCollections,
    confirmCollection,
    rejectCollection,
    
    // Messaging & Notifications
    getAllMessages,
    getMessagesByOrder,
    getDirectChatThread,
    getChatHistory,
    sendAdminMessage,
    createDirectMessage,
    markOrderMessagesAsRead,
    markDirectMessagesAsRead,
    getUserNotifications,
    createNotification
  };
};