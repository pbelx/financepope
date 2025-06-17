<template>
  <v-container fluid>
    <v-row class="mb-1">
      <v-col cols="12">
        <v-card elevation="2">
          <v-card-title class="primary white--text">
            <v-icon size="large" color="white" class="mr-3">mdi-clipboard-text-clock</v-icon>
            Pending Orders Management
            <v-spacer></v-spacer>
            <v-chip color="white" text-color="primary" variant="outlined">
              <v-icon start size="small">mdi-counter</v-icon>
              Total: {{ totalCount }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <v-row align="center">
              <!-- <v-col cols="12" md="6">
                <v-text-field v-model="searchQuery" prepend-inner-icon="mdi-magnify" label="Search orders..." outlined
                  dense clearable @input="onSearch"></v-text-field>
              </v-col>
              <v-col cols="12" md="3">
                <v-select v-model="statusFilter" :items="['pending', 'processing', 'completed', 'cancelled']"
                  label="Filter by Status" outlined dense clearable @update:model-value="onFilter"
                  placeholder="All Statuses"></v-select>
              </v-col> -->
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
          <v-data-table-server :headers="headers" :items="orders" :loading="loading" :items-length="totalCount"
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

            <template v-slot:item.currency="{ item }">
              <div class="font-weight-bold">
                {{ getCurrencyCode(item.fromCurrency) }}
              </div>
            </template>

            <template v-slot:item.sender="{ item }">
              <div>
                <div class="font-weight-medium">{{ item.senderName }}</div>
                <div class="text-caption text-grey">{{ item.senderPhone }}</div>
              </div>
            </template>

            <template v-slot:item.receiver="{ item }">
              <div>
                <div class="font-weight-medium">{{ item.receiverName }}</div>
                <div class="text-caption text-grey">{{ item.receiverPhone }}</div>
                <div class="text-caption text-grey">{{ getPlaceName(item.receiverPlace) }}</div>
              </div>
            </template>

            <template v-slot:item.bank="{ item }">
              <v-chip size="small" variant="outlined">
                {{ getBankName(item.bank) }}
              </v-chip>
            </template>

            <template v-slot:item.member="{ item }">
              <div v-if="item.member" class="d-flex align-center">
                <v-avatar size="24" class="mr-2">
                  <v-icon size="small">mdi-account</v-icon>
                </v-avatar>
                {{ item.member.full_name }}
              </div>
              <v-chip v-else size="small" color="grey" variant="outlined">
                Unassigned
              </v-chip>
            </template>

            <template v-slot:item.createdAt="{ item }">
              <div>
                <div>{{ formatDate(item.createdAt) }}</div>
                <div class="text-caption text-grey">{{ formatTime(item.createdAt) }}</div>
              </div>
            </template>

            <template v-slot:item.actions="{ item }">
              <div class="d-flex">
                <v-tooltip bottom>
                  <template v-slot:activator="{ props }">
                    <v-btn icon size="small" color="primary" v-bind="props" @click="openStatusModal(item)">
                      <v-icon size="small">mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                  <span>Update Status</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template v-slot:activator="{ props }">
                    <v-btn icon size="small" color="secondary" v-bind="props" @click="openAssignModal(item)">
                      <v-icon size="small">mdi-account-plus</v-icon>
                    </v-btn>
                  </template>
                  <span>Assign Member</span>
                </v-tooltip>

                <v-tooltip bottom>
                  <template v-slot:activator="{ props }">
                    <v-btn icon size="small" color="info" v-bind="props" @click="viewOrderDetails(item)">
                      <v-icon size="small">mdi-eye</v-icon>
                    </v-btn>
                  </template>
                  <span>View Details</span>
                </v-tooltip>
              </div>
            </template>

            <template v-slot:loading>
              <div class="text-center pa-4">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <div class="mt-2">Loading orders...</div>
              </div>
            </template>

            <template v-slot:no-data>
              <div class="text-center pa-8">
                <v-icon size="64" color="grey">mdi-clipboard-text-off</v-icon>
                <div class="headline text-grey mt-4">No pending orders found</div>
                <div class="text-grey">All orders have been processed or there are no orders yet.</div>
                <v-btn color="primary" class="mt-4" @click="refreshOrders">
                  <v-icon start>mdi-refresh</v-icon>
                  Refresh
                </v-btn>
              </div>
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
            <br>
            <span class="text-grey">{{ selectedOrder.senderName }} → {{ selectedOrder.receiverName }}</span>
          </div>

          <v-select v-model="newStatus" :items="statusUpdateOptions" item-title="title" item-value="value"
            label="New Status" variant="outlined" :disabled="updatingStatus"></v-select>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeStatusModal" :disabled="updatingStatus">
            Cancel
          </v-btn>
          <v-btn color="primary" @click="updateOrderStatus" :loading="updatingStatus" :disabled="!newStatus">
            Update Status
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="assignModalVisible" max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          <v-icon start>mdi-account-plus</v-icon>
          Assign Member
        </v-card-title>

        <v-card-text v-if="selectedOrder">
          <div class="mb-4">
            <strong>Order #{{ selectedOrder.id }}</strong>
            <br>
            <span class="text-medium-emphasis">{{ selectedOrder.senderName }} → {{ selectedOrder.receiverName }}</span>
          </div>

          <v-select v-model="selectedMemberId" :items="members" item-title="full_name" item-value="id"
            label="Select Member" variant="outlined" :disabled="assigningMember" clearable
            placeholder="Choose a member...">
            <template v-slot:item="{ props, item }">
              <v-list-item v-bind="props">
                <template v-slot:prepend>
                  <v-avatar size="32">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>{{ item.raw.full_name }}</v-list-item-title>
                <v-list-item-subtitle>{{ item.raw.email }}</v-list-item-subtitle>
              </v-list-item>
            </template>

            <template v-slot:selection="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="24" class="mr-2">
                  <v-icon size="small">mdi-account</v-icon>
                </v-avatar>
                {{ members.find(member => member.id === selectedMemberId)?.full_name }}
              </div>
            </template>
          </v-select>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="closeAssignModal" :disabled="assigningMember">
            Cancel
          </v-btn>
          <v-btn color="primary" @click="assignMember" :loading="assigningMember" :disabled="!selectedMemberId">
            Assign Member
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="detailsModalVisible" max-width="800">
      <v-card v-if="selectedOrder">
        <v-card-title class="headline">
          <v-icon start>mdi-clipboard-text</v-icon>
          Order Details - #{{ selectedOrder.id }}
          <v-spacer></v-spacer>
          <v-chip :color="getStatusColor(selectedOrder.status)" theme="dark">
            {{ selectedOrder.status.toUpperCase() }}
          </v-chip>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-subtitle class="pb-0">
                  <v-icon start size="small">mdi-account-arrow-right</v-icon>
                  Sender Information
                </v-card-subtitle>
                <v-card-text>
                  <div class="mb-2"><strong>Name:</strong> {{ selectedOrder.senderName }}</div>
                  <div class="mb-2"><strong>Phone:</strong> {{ selectedOrder.senderPhone }}</div>
                  <div class="mb-2"><strong>Address:</strong> {{ selectedOrder.senderAddress }}</div>
                  <div class="mb-2"><strong>Amount:</strong> {{ formatCurrency(selectedOrder.amount,
                    selectedOrder.fromCurrency) }}</div>
                  <div><strong>User:</strong> {{ selectedOrder.user.full_name }}</div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-subtitle class="pb-0">
                  <v-icon start size="small">mdi-account-arrow-left</v-icon>
                  Receiver Information
                </v-card-subtitle>
                <v-card-text>
                  <div class="mb-2"><strong>Name:</strong> {{ selectedOrder.receiverName }}</div>
                  <div class="mb-2"><strong>Phone:</strong> {{ selectedOrder.receiverPhone }}</div>
                  <div class="mb-2"><strong>Address:</strong> {{ selectedOrder.receiverAddress }}</div>
                  <div class="mb-2"><strong>Location:</strong> {{ getPlaceName(selectedOrder.receiverPlace) }}</div>
                  <div class="mb-2"><strong>Currency:</strong> {{ getCurrencyInfo(selectedOrder.receiverCurrency).name
                    }}
                  </div>
                  <div><strong>Bank:</strong> {{ getBankName(selectedOrder.bank) }}</div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12">
              <v-card variant="outlined">
                <v-card-subtitle class="pb-0">
                  <v-icon start size="small">mdi-information</v-icon>
                  Additional Information
                </v-card-subtitle>
                <v-card-text>
                  <v-row>
                    <v-col cols="12" md="4">
                      <div class="mb-2"><strong>Relationship:</strong> {{ selectedOrder.relationship }}</div>
                    </v-col>
                    <v-col cols="12" md="4">
                      <div class="mb-2"><strong>Created:</strong> {{ formatDate(selectedOrder.createdAt) }}</div>
                    </v-col>
                    <v-col cols="12" md="4">
                      <div class="mb-2">
                        <strong>Assigned Member:</strong>
                        {{ selectedOrder.member ? selectedOrder.member.full_name : 'Unassigned' }}
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="detailsModalVisible = false">Close</v-btn>
          <v-btn color="primary" @click="openStatusModal(selectedOrder)">
            <v-icon start size="small">mdi-pencil</v-icon>
            Update Status
          </v-btn>
          <v-btn color="secondary" @click="openAssignModal(selectedOrder)">
            <v-icon start size="small">mdi-account-plus</v-icon>
            Assign Member
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout" location="top">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminPendingOrders',
  data() {
    return {
      // Main data
      orders: [],
      totalCount: 0,
      loading: true,
      refreshing: false,

      // Table options for server-side pagination
      tableOptions: {
        page: 1,
        itemsPerPage: 10,
        sortBy: [],
        sortDesc: [],
      },

      // Search and filter
      searchQuery: '',
      statusFilter: null,

      // Modal states
      statusModalVisible: false,
      assignModalVisible: false,
      detailsModalVisible: false,
      selectedOrder: null,

      // Status update
      newStatus: null,
      updatingStatus: false,

      // Member assignment
      selectedMemberId: null,
      assigningMember: false,


      // Reference data
      places: [],
      currencies: [],
      allBanks: [],
      members: [],

      // UI
      snackbar: {
        show: false,
        message: '',
        color: 'success',
        timeout: 5000
      },

      // Table headers
      headers: [
        { title: 'Order ID', key: 'id', sortable: true, width: '100px' },
        { title: 'Status', key: 'status', sortable: true, width: '120px' },
        { title: 'Currency', key: 'currency', sortable: false, width: '130px' },
        { title: 'Amount', key: 'amount', sortable: true, width: '130px' },

        { title: 'Sender', key: 'sender', sortable: false, width: '150px' },
        { title: 'Receiver', key: 'receiver', sortable: false, width: '180px' },
        { title: 'Bank', key: 'bank', sortable: false, width: '120px' },
        { title: 'Assigned Member', key: 'member', sortable: false, width: '150px' },
        { title: 'Created', key: 'createdAt', sortable: true, width: '130px' },
        { title: 'Actions', key: 'actions', sortable: false, width: '140px' }
      ],

      // Options
      statusOptions: [
        { title: 'Pending', value: 'pending' },
        { title: 'Processing', value: 'processing' },
        { title: 'Completed', value: 'completed' },
        { title: 'Cancelled', value: 'cancelled' }
      ],

      statusUpdateOptions: [
        { title: 'Processing', value: 'processing' },
        { title: 'Completed', value: 'completed' },
        { title: 'Pending', value: 'pending' },
        { title: 'Cancelled', value: 'cancelled' },
      ]
    }
  },

  created() {
    const token = localStorage.getItem('token');
    this.$api = axios.create({
      baseURL: 'https://finance.flflstore.com/api', // Ensure this is your correct API base URL
      // baseURL: 'http://localhost:3001/api',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
        // Add other headers if needed
      }
    });
  },


  async mounted() {
    await this.initializeData();
  },

  methods: {
    // Initialize data
    async initializeData() {
      try {
        await Promise.all([
          this.fetchCurrencies(),
          this.fetchPlaces(),
          this.fetchMembers()
        ]);
        // Initial fetch with current table options
        await this.fetchOrders(this.tableOptions.page, this.tableOptions.itemsPerPage);
      } catch (error) {
        this.showSnackbar('Failed to initialize data', 'error');
      }
    },

    // API calls
    async fetchOrders() {
      this.loading = true; // Always set loading to true when fetching
      try {
        // Build query parameters based on tableOptions
        const params = new URLSearchParams({
          page: this.tableOptions.page.toString(),
          limit: this.tableOptions.itemsPerPage.toString(),
        });

        // Add sorting
        if (this.tableOptions.sortBy && this.tableOptions.sortBy.length > 0) {
          params.append('sortBy', this.tableOptions.sortBy[0].key);
          params.append('sortDesc', this.tableOptions.sortBy[0].order === 'desc' ? 'true' : 'false');
        }

        // Add search query if exists
        if (this.searchQuery && this.searchQuery.trim()) {
          params.append('search', this.searchQuery.trim());
        }

        // Add status filter if selected
        if (this.statusFilter) {
          params.append('status', this.statusFilter);
        }

        // const response = await this.$api.get(`/order/pending/paginated?${params.toString()}`);
        const response = await this.$api.get(`/order/pending/paginated?${params.toString()}`);
        

        if (response.data.status) {
          this.orders = response.data.payload.orders;
          this.totalCount = response.data.payload.total;
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        this.showSnackbar('Failed to fetch orders', 'error');

        // Mock data with filtering applied for demo
        let mockOrders = [
          {
            id: 14,
            user: {
              id: 5,
              full_name: "kamala",
              email: "member@kmail.com",
              phone_number: "combe road 3"
            },
            member: null,
            amount: 5000,
            fromCurrency: 2,
            receiverPlace: "4",
            receiverCurrency: 3,
            senderName: "king hosa",
            senderPhone: "2323",
            senderAddress: "combe x",
            relationship: "family",
            receiverName: "peter",
            receiverPhone: "kwasa",
            receiverAddress: "23das",
            bank: "2",
            status: "pending",
            createdAt: "2025-06-04T22:56:05.663Z"
          },
          {
            id: 13,
            user: {
              id: 2,
              full_name: "jax",
              email: "j@j.com",
              phone_number: "kisumu"
            },
            member: {
              id: 3,
              full_name: "wendy williams",
              email: "w@gmail.com",
              is_member: true
            },
            amount: 5000,
            fromCurrency: 2,
            receiverPlace: "4",
            receiverCurrency: 3,
            senderName: "jomo kenyata",
            senderPhone: "23434232",
            senderAddress: "kenya",
            relationship: "baba",
            receiverName: "Kim kalu",
            receiverPhone: "23423423",
            receiverAddress: "TZ",
            bank: "2",
            status: "cancelled",
            createdAt: "2025-05-29T13:14:35.647Z"
          }
        ];

        // Apply status filter to mock data
        if (this.statusFilter) {
          mockOrders = mockOrders.filter(order => order.status === this.statusFilter);
        }

        // Apply search filter to mock data
        if (this.searchQuery && this.searchQuery.trim()) {
          const searchTerm = this.searchQuery.toLowerCase();
          mockOrders = mockOrders.filter(order =>
            order.id.toString().includes(searchTerm) ||
            order.senderName.toLowerCase().includes(searchTerm) ||
            order.receiverName.toLowerCase().includes(searchTerm) ||
            order.senderPhone.includes(searchTerm) ||
            order.receiverPhone.includes(searchTerm)
          );
        }

        this.orders = mockOrders;
        this.totalCount = mockOrders.length;
      } finally {
        this.loading = false;
        this.refreshing = false;
      }
    },
    async fetchCurrencies() {
      try {
        const response = await this.$api.get('/currency/all');
        if (response.data.status) {
          this.currencies = response.data.payload;
        }
      } catch (error) {
        // Mock data
        this.currencies = [
          { id: 1, name: 'US Dollar', symbol: '$', code: 'USD' },
          { id: 2, name: 'Uganda Shilling', symbol: 'UGX', code: 'UGX' },
          { id: 3, name: 'Kenyan Shilling', symbol: 'KES', code: 'KES' }
        ];
      }
    },

    async fetchPlaces() {
      try {
        const response = await this.$api.get('/places');
        if (response.data.status) {
          this.places = response.data.payload;

          // Extract banks from places
          const banksFromPlaces = [];
          this.places.forEach(place => {
            if (place.banks && place.banks.length > 0) {
              place.banks.forEach(bank => {
                if (!banksFromPlaces.find(b => b.id === bank.id)) {
                  banksFromPlaces.push({
                    ...bank,
                    placeName: place.name
                  });
                }
              });
            }
          });
          this.allBanks = banksFromPlaces;
        }
      } catch (error) {
        // Mock data
        this.places = [
          { id: 1, name: 'Kampala' },
          { id: 2, name: 'Nairobi' },
          { id: 3, name: 'Dar es Salaam' },
          { id: 4, name: 'Kigali' }
        ];

        this.allBanks = [
          { id: 1, name: 'Centenary Bank' },
          { id: 2, name: 'Stanbic Bank' },
          { id: 3, name: 'DFCU Bank' }
        ];
      }
    },

    async fetchMembers() {
      try {
        const response = await this.$api.get('/users/members');
        if (response.data.status) {
          this.members = response.data.payload;
          console.log(this.members);

        }
      } catch (error) {
        // Mock data
        this.members = [
          {
            id: 1,
            full_name: 'John Doe',
            email: 'john@example.com',
            is_member: true
          },
          {
            id: 2,
            full_name: 'Jane Smith',
            email: 'jane@example.com',
            is_member: true
          },
          {
            id: 3,
            full_name: 'wendy williams',
            email: 'w@gmail.com',
            is_member: true
          }
        ];
      }
    },

    // Helper methods
    getBankName(bankId) {
      const bank = this.allBanks.find(bank => bank.id?.toString() === bankId?.toString());
      return bank ? bank.name : `Bank ID: ${bankId}`;
    },

    getCurrencyInfo(currencyId) {
      const currency = this.currencies.find(curr => curr.id?.toString() === currencyId?.toString());
      return currency || { name: `Currency ID: ${currencyId}`, symbol: '', code: '' };
    },

    getPlaceName(placeId) {
      const place = this.places.find(place => place.id?.toString() === placeId?.toString());
      return place ? place.name : `Place ID: ${placeId}`;
    },

    formatCurrency(amount, currencyId) {
      const currency = this.getCurrencyInfo(currencyId);
      return `${currency.symbol || currency.code} ${amount.toLocaleString()}`;
    },
    getCurrencyCode(currencyId) {
      const currency = this.currencies.find(curr => curr.id?.toString() === currencyId?.toString());
      return currency ? currency.code : '';
    },

    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString();
    },

    formatTime(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleTimeString();
    },

    getStatusColor(status) {
      const colors = {
        pending: 'orange',
        processing: 'blue',
        completed: 'green',
        cancelled: 'red'
      };
      return colors[status] || 'grey';
    },

    // Event handlers
    onTableOptionsUpdate(options) {
      // Vuetify 3's v-data-table-server updates v-model:page, v-model:items-per-page directly.
      // The @update:options event can still be used if you need to react to all changes,
      // but the `options` object now directly reflects the model values.
      this.tableOptions.page = options.page;
      this.tableOptions.itemsPerPage = options.itemsPerPage;
      this.tableOptions.sortBy = options.sortBy;
      this.fetchOrders();
    },

    onSearch() {
      this.tableOptions.page = 1; // Reset to first page on search
      this.fetchOrders();
    },

    onFilter() {
      this.tableOptions.page = 1; // Reset to first page when filtering
      this.fetchOrders();
    },

    refreshOrders() {
      this.refreshing = true;
      this.tableOptions.page = 1; // Reset page on refresh
      this.fetchOrders();
    },

    // Modal methods
    openStatusModal(order) {
      this.selectedOrder = order;
      this.newStatus = null;
      this.statusModalVisible = true;
      this.detailsModalVisible = false;
    },

    closeStatusModal() {
      this.statusModalVisible = false;
      this.selectedOrder = null;
      this.newStatus = null;
    },

    openAssignModal(order) {
      this.selectedOrder = order;
      this.selectedMemberId = order.member?.id || null;
      this.assignModalVisible = true;
      this.detailsModalVisible = false;
    },

    closeAssignModal() {
      this.assignModalVisible = false;
      this.selectedOrder = null;
      this.selectedMemberId = null;
    },

    viewOrderDetails(order) {
      this.selectedOrder = order;
      this.detailsModalVisible = true;
    },

    // Action methods
    async updateOrderStatus() {
      if (!this.newStatus || !this.selectedOrder) return;

      this.updatingStatus = true;
      try {
        const response = await this.$api.put('/order/update', {
          id: this.selectedOrder.id,
          status: this.newStatus
        });

        if (response.data.status) {
          // Remove from pending list if status changed from pending
          if (this.newStatus !== 'pending') {
            this.orders = this.orders.filter(order => order.id !== this.selectedOrder.id);
            this.totalCount--;
          } else {
            // If status is changed back to pending, refresh the list to include it
            this.fetchOrders();
          }

          this.showSnackbar(`Order #${this.selectedOrder.id} status updated to ${this.newStatus}`, 'success');
          this.closeStatusModal();
        } else {
          this.showSnackbar(response.data.payload || 'Failed to update order status', 'error');
        }
      } catch (error) {
        console.error('Error updating order status:', error);
        this.showSnackbar('Failed to update order status', 'error');
      } finally {
        this.updatingStatus = false;
      }
    },

    async assignMember() {
      if (!this.selectedMemberId) {
        this.showSnackbar('Please select a member to assign', 'error');
        return;
      }

      this.assigningMember = true;
      try {
        const response = await this.$api.put('/order/assign-member', {
          orderId: this.selectedOrder.id,
          memberId: this.selectedMemberId
        });

        if (response.data.status) {
          const selectedMember = this.members.find(member => member.id === this.selectedMemberId);

          // Update local order state
          this.orders = this.orders.map(order =>
            order.id === this.selectedOrder.id
              ? { ...order, member: selectedMember }
              : order
          );

          this.showSnackbar('Member assigned successfully', 'success');
          this.closeAssignModal();
        } else {
          this.showSnackbar(response.data.payload || 'Failed to assign member', 'error');
        }
      } catch (error) {
        console.error('Error assigning member:', error);
        this.showSnackbar('Failed to assign member', 'error');
      } finally {
        this.assigningMember = false;
      }
    },

    // Utility methods
    showSnackbar(message, color = 'success') {
      this.snackbar = {
        show: true,
        message,
        color,
        timeout: 5000
      };
    }
  }
}
</script>

<style scoped>
.v-data-table {
  background-color: transparent;
}

.v-card-title {
  word-break: normal;
}

/* Vuetify 3 removed `--text` variations, replaced by `text-` utility classes */
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