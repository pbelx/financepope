<template>
  <v-container fluid>
    <v-row class="mb-1">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="primary white--text">
            <v-icon size="large" color="white" class="mr-3">mdi-format-list-checks</v-icon>
            Order Status Management
            <v-spacer></v-spacer>
            <v-chip color="white" text-color="primary" variant="outlined">
              <v-icon start size="small">mdi-counter</v-icon>
              Total: {{ totalCount }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <v-row align="center">
              <v-col cols="12" md="6">
                <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="Search orders..." outlined
                  dense clearable @input="onSearch"></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select v-model="statusFilter" :items="['pending', 'processing', 'completed', 'cancelled']"
                  label="Filter by Status" outlined dense clearable @update:model-value="onFilter"
                  placeholder="All Statuses"></v-select>
              </v-col>
              <v-col cols="12" md="3">
                <v-btn color="primary" @click="refreshOrders" :loading="refreshing" block>
                  <v-icon start>mdi-refresh</v-icon>
                  Refresh
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card elevation="2">
          <v-data-table-server :headers="headers" :items="filteredOrders" :loading="loading" :items-length="totalCount"
            v-model:page="tableOptions.page" v-model:items-per-page="tableOptions.itemsPerPage"
            v-model:sort-by="tableOptions.sortBy" @update:options="onTableOptionsUpdate" class="elevation-1">
            <template v-slot:item.status="{ item }">
              <v-chip :color="getStatusColor(item.status)" theme="dark" size="small">
                {{ item.status.toUpperCase() }}
              </v-chip>
            </template>

            <template v-slot:item.amount="{ item }">
              <div class="font-weight-bold">
                {{ item.amount.toLocaleString() }}
              </div>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-tooltip bottom>
                <template v-slot:activator="{ props }">
                  <v-btn icon size="small" color="primary" v-bind="props" @click="openStatusModal(item)">
                    <v-icon size="small">mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Update Status</span>
              </v-tooltip>
            </template>
          </v-data-table-server>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="statusModalVisible" max-width="500">
      <v-card>
        <v-card-title class="headline">
          <v-icon start>mdi-pencil</v-icon>
          Update Order Status
        </v-card-title>

        <v-card-text v-if="selectedOrder">
          <div class="mb-4">
            <strong>Order #{{ selectedOrder.id }}</strong>
          </div>

          <v-select v-model="newStatus" :items="statusUpdateOptions" item-title="title" item-value="value"
            label="New Status" variant="outlined" :disabled="updatingStatus"></v-select>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeStatusModal" :disabled="updatingStatus">
            Cancel
          </v-btn>
          <v-btn color="primary" @click="updateOrderStatusHandler" :loading="updatingStatus" :disabled="!newStatus">
            Update Status
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOrderStatus } from '@/composables/useOrderStatus';

const { 
  orders, 
  totalCount, 
  loading, 
  refreshing, 
  tableOptions, 
  searchQuery, 
  statusFilter, 
  fetchOrders, 
  updateStatus 
} = useOrderStatus();

const headers = [
  { title: 'Order ID', key: 'id', sortable: true, width: '100px' },
  { title: 'Status', key: 'status', sortable: true, width: '120px' },
  { title: 'Amount', key: 'amount', sortable: true, width: '130px' },
  { title: 'Sender Name', key: 'senderName', sortable: false, width: '150px' },
  { title: 'Receiver Name', key: 'receiverName', sortable: false, width: '180px' },
  { title: 'Created At', key: 'createdAt', sortable: true, width: '130px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '140px' }
];

const statusModalVisible = ref(false);
const selectedOrder = ref(null);
const newStatus = ref(null);
const updatingStatus = ref(false);

const statusUpdateOptions = [
  { title: 'Processing', value: 'processing' },
  { title: 'Completed', value: 'completed' },
  { title: 'Pending', value: 'pending' },
  { title: 'Cancelled', value: 'cancelled' },
];

const onSearch = () => {
  tableOptions.page = 1;
  // The filtering logic is now handled by the computed property
};

const onFilter = () => {
  tableOptions.page = 1;
  // The filtering logic is now handled by the computed property
};

const refreshOrders = async () => {
  refreshing.value = true;
  await fetchOrders();
  refreshing.value = false;
};

const onTableOptionsUpdate = (options) => {
  tableOptions.page = options.page;
  tableOptions.itemsPerPage = options.itemsPerPage;
  tableOptions.sortBy = options.sortBy;
  // No need to call fetchOrders here as the data is already in memory
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    cancelled: 'red'
  };
  return colors[status] || 'grey';
};

const openStatusModal = (order) => {
  selectedOrder.value = order;
  newStatus.value = null;
  statusModalVisible.value = true;
};

const closeStatusModal = () => {
  statusModalVisible.value = false;
  selectedOrder.value = null;
  newStatus.value = null;
};

const updateOrderStatusHandler = async () => {
  if (!newStatus.value || !selectedOrder.value) return;

  updatingStatus.value = true;
  await updateStatus(selectedOrder.value.id, newStatus.value);
  updatingStatus.value = false;
  closeStatusModal();
};

const filteredOrders = computed(() => {
  let filtered = orders.value;

  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value);
  }

  if (searchQuery.value) {
    const searchTerm = searchQuery.value.toLowerCase();
    filtered = filtered.filter(order =>
      order.id.toString().includes(searchTerm) ||
      order.senderName.toLowerCase().includes(searchTerm) ||
      order.receiverName.toLowerCase().includes(searchTerm)
    );
  }

  return filtered;
});

onMounted(() => {
  fetchOrders();
});

</script>

<style scoped>
.v-data-table {
  background-color: transparent;
}

.v-card-title {
  word-break: normal;
}

.text-caption {
  font-size: 0.75rem !important;
}

.text-grey {
  color: #9e9e9e !important;
}

.text-medium-emphasis {
  opacity: var(--v-medium-emphasis-opacity);
}
</style>