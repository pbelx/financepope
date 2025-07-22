// composables/useOrderStatus.js
import { ref, reactive } from 'vue';
import { useAdminApi } from './useAdminApi';

export const useOrderStatus = () => {
  const { getAllOrders, updateOrderStatus: apiUpdateStatus } = useAdminApi();

  const orders = ref([]);
  const totalCount = ref(0);
  const loading = ref(true);
  const refreshing = ref(false);

  const tableOptions = reactive({
    page: 1,
    itemsPerPage: 10,
    sortBy: [],
    sortDesc: [],
  });

  const searchQuery = ref('');
  const statusFilter = ref(null);

  const fetchOrders = async () => {
    loading.value = true;
    const { success, data, error } = await getAllOrders();
    if (success) {
      orders.value = data.payload;
      totalCount.value = data.payload.length;
    } else {
      // Handle error
      console.error(error);
    }
    loading.value = false;
  };

  const updateStatus = async (orderId, newStatus) => {
    const { success, error } = await apiUpdateStatus(orderId, newStatus);
    if (success) {
      await fetchOrders(); // Refresh the list
    } else {
      // Handle error
      console.error(error);
    }
  };

  return {
    orders,
    totalCount,
    loading,
    refreshing,
    tableOptions,
    searchQuery,
    statusFilter,
    fetchOrders,
    updateStatus,
  };
};