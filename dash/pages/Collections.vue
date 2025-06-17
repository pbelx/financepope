<template>
    <v-container fluid class="pa-4">
      <v-row class="mb-4">
        <v-col class="d-flex align-center">
          <h1 class="text-h4 font-weight-bold">Collections</h1>
        </v-col>
      </v-row>
  
      <v-card class="mb-6" elevation="3">
        <v-card-title>
          <h2 class="text-h5">Create New Collection</h2>
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleCreateCollection">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="amount"
                  label="Enter Amount"
                  type="number"
                  step="0.01"
                  min="0"
                  variant="outlined"
                  :rules="[rules.required, rules.positiveNumber]"
                 
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedCurrencyId"
                  :items="currencyOptions"
                  label="Select Currency"
                  item-title="display"
                  item-value="id"
                  variant="outlined"
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-cash"
                />
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedMemberId"
                  :items="memberOptions"
                  label="Assign to Member"
                  item-title="display"
                  item-value="id"
                  variant="outlined"
                  :rules="[rules.required]"
                  prepend-inner-icon="mdi-account"
                />
              </v-col>
              <v-col cols="12" md="6" class="d-flex align-center">
                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  :loading="creatingCollection"
                  :disabled="!isFormValid"
                  block
                >
                  <v-icon left>mdi-plus</v-icon>
                  {{ creatingCollection ? 'Creating...' : 'Create Collection' }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
  
      <v-card elevation="3">
        <v-card-title>
          <h2 class="text-h5">Your Collections</h2>
          <v-spacer />
          <v-btn
            icon
            @click="fetchCollections"
            :loading="loading"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text>
          <div v-if="loading" class="text-center py-8">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            />
            <p class="mt-4 text-grey-600">Loading collections...</p>
          </div>
  
          <div v-else-if="collections.length === 0" class="text-center py-8">
            <v-icon size="64" color="grey-400">mdi-inbox</v-icon>
            <p class="mt-4 text-grey-600 text-h6">No collections found</p>
          </div>
  
          <v-data-table
            v-else
            :headers="tableHeaders"
            :items="collections"
            :items-per-page="10"
            class="elevation-1"
            item-key="id"
          >
            <template #item.id="{ item }">
              <v-chip
                size="small"
                variant="outlined"
                prepend-icon="mdi-pound"
              >
                {{ item.id }}
              </v-chip>
            </template>
  
            <template #item.amount="{ item }">
              <div class="text-h6 font-weight-bold primary--text">
                {{ formatAmount(item.amount) }}
              </div>
            </template>
  
            <template #item.currency_display="{ item }">
              <v-chip
                size="small"
                variant="flat"
                color="blue-grey lighten-5"
              >
                <v-icon size="small" start>mdi-cash-multiple</v-icon>
                {{ item.currency_display || 'N/A' }}
              </v-chip>
            </template>
  
            <template #item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                :text-color="getStatusTextColor(item.status)"
                size="small"
              >
                {{ item.status || 'N/A' }}
              </v-chip>
            </template>
  
            <template #item.member="{ item }">
              <div class="d-flex align-center">
                <v-icon size="small" class="mr-2">mdi-account</v-icon>
                {{ item.member ? (item.member.full_name || item.member.email) : `Member ID: ${item.userId}` }}
              </div>
            </template>
  
            <template #item.created_at="{ item }">
              <span class="text-caption">
                {{ formatDate(item.created_at) }}
              </span>
            </template>
  
            <template #item.actions="{ item }">
              <v-btn
                icon
                size="small"
                variant="text"
                @click="viewCollection(item)"
              >
                <v-icon>mdi-eye</v-icon>
              </v-btn>
              <v-btn
                icon
                size="small"
                variant="text"
                @click="editCollection(item)"
              >
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
  
      <v-snackbar
        v-model="snackbar.show"
        :color="snackbar.color"
        :timeout="4000"
        location="top"
      >
        {{ snackbar.message }}
        <template #actions>
          <v-btn
            text
            @click="snackbar.show = false"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  // Nuxt 3 specific imports:
  // - `useRuntimeConfig` for environment variables
  // - `$fetch` is a global auto-imported utility for making HTTP requests
  // - `useAuth` is a placeholder for your authentication composable
  
  // Composables
  const config = useRuntimeConfig()

  const { user, token } = useAuth()
  
  // Reactive data
  const collections = ref([])
  const currencies = ref([])
  const members = ref([])
  const loading = ref(false)
  const creatingCollection = ref(false)
  
  // Form data
  const amount = ref('')
  const selectedCurrencyId = ref(null)
  const selectedMemberId = ref(null)
  
  // UI state
  const snackbar = ref({
    show: false,
    message: '',
    color: 'success'
  })
  
  // Table headers - Added a new column for 'Currency'
  const tableHeaders = ref([
    { title: 'ID', key: 'id', sortable: true, width: '100px' },
    { title: 'Amount', key: 'amount', sortable: true },
    { title: 'Currency', key: 'currency_display', sortable: false }, // New currency column
    { title: 'Status', key: 'status', sortable: true, width: '120px' },
    { title: 'Member', key: 'member', sortable: false },
    { title: 'Created Date', key: 'created_at', sortable: true, width: '120px' },
    // { title: 'Actions', key: 'actions', sortable: false, width: '100px' }
  ])
  
  // Form validation rules
  const rules = {
    required: (value) => !!value || 'This field is required',
    positiveNumber: (value) => {
      const num = parseFloat(value)
      return (!isNaN(num) && num > 0) || 'Please enter a valid positive number'
    }
  }
  
  // Computed properties
  const currencyOptions = computed(() => {
    return currencies.value.map(currency => ({
      id: currency.id,
      display: formatCurrencyDisplay(currency)
    }))
  })
  
  const memberOptions = computed(() => {
    return members.value.map(member => ({
      id: member.id,
      display: member.full_name || member.email || `Member ID: ${member.id}`
    }))
  })
  
  const isFormValid = computed(() => {
    return amount.value &&
               selectedCurrencyId.value &&
               selectedMemberId.value &&
               parseFloat(amount.value) > 0
  })
  
  // Get authorization headers
  const getAuthHeaders = () => {
    const authToken = token.value
    if (!authToken) {
      // In a real Nuxt app, you might redirect to login or show a more specific error
      console.error('No authentication token found. User might not be logged in.');
      // Consider returning empty headers or throwing an error that's caught upstream
      return {};
    }
    return {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  }
  
  // Helper functions (kept largely as is, adjusted `formatAmount`)
  const getMemberInfo = (userId) => {
    if (!userId) return null;
    const member = members.value.find(mem => mem.id === userId);
    return member || null;
  }
  
  const formatCurrencyDisplay = (currency) => {
    if (!currency) return 'N/A';
    if (currency.symbol) {
      return `${currency.name} (${currency.symbol})`
    } else if (currency.code) {
      return `${currency.name} (${currency.code})`
    }
    return currency.name
  }
  
  // Adjusted to format only the amount, currency will be in a separate column
  const formatAmount = (amountValue) => {
    if (!amountValue) return '0';
    return parseFloat(amountValue).toLocaleString();
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }
  
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'success'
      case 'rejected':
        return 'error'
      case 'pending':
      default:
        return 'warning'
    }
  }
  
  const getStatusTextColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'white'
      case 'rejected':
        return 'white'
      case 'pending':
      default:
        return 'black'
    }
  }
  
  const showSnackbar = (message, color = 'success') => {
    snackbar.value = {
      show: true,
      message,
      color
    }
  }
  
  // Table action handlers
  const viewCollection = (collection) => {
    console.log('View collection:', collection)
    showSnackbar(`Viewing collection #${collection.id}`, 'info')
    // In a Nuxt app, you might use navigateTo for routing:
    // navigateTo(`/collections/${collection.id}`);
  }
  
  const editCollection = (collection) => {
    console.log('Edit collection:', collection)
    showSnackbar(`Edit collection #${collection.id}`, 'info')
    // In a Nuxt app, you might use navigateTo for routing:
    // navigateTo(`/collections/${collection.id}/edit`);
  }
  
  // API functions - Using Nuxt's $fetch and useRuntimeConfig
  const fetchCurrencies = async () => {
    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/currency/all`, {
        headers: getAuthHeaders()
      })
  
      if (response.status && response.payload) {
        currencies.value = response.payload
      } else {
        console.error('Failed to fetch currencies:', response.payload || 'Unknown error')
        showSnackbar('Failed to fetch currencies', 'error')
      }
    } catch (error) {
      console.error('Error fetching currencies:', error)
      showSnackbar(`Error fetching currencies: ${error.message}`, 'error')
    }
  }
  
  const fetchMembers = async () => {
    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/users/members`, {
        headers: getAuthHeaders()
      })
  
      if (response.status && response.payload) {
        members.value = response.payload
      } else {
        console.error('Failed to fetch members:', response.payload || 'Unknown error')
        showSnackbar('Failed to fetch members', 'error')
      }
    } catch (error) {
      console.error('Error fetching members:', error)
      showSnackbar(`Error fetching members: ${error.message}`, 'error')
    }
  }
  
  const fetchCollections = async () => {
    loading.value = true
    try {
      const response = await $fetch(`${config.public.apiBaseUrl}/collections`, {
        headers: getAuthHeaders()
      })
  
      if (response.status && response.payload) {
        collections.value = response.payload.map(collection => {
          const member = getMemberInfo(collection.userId);
          const currency = collection.currency;
  
          return {
            ...collection,
            member: member, // Add the full member object
            currency: currency, // The full currency object is already there from the API
            // Add a display property for the currency column
            currency_display: currency ? (currency.symbol || currency.code || currency.name) : 'N/A'
          };
        });
      } else {
        console.error('Failed to fetch collections:', response.payload || 'Unknown error');
        showSnackbar('Failed to fetch collections', 'error');
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
      showSnackbar(`Error fetching collections: ${error.message}`, 'error')
    } finally {
      loading.value = false
    }
  }
  
  const handleCreateCollection = async () => {
    if (!isFormValid.value) {
      showSnackbar('Please fill in all required fields', 'error')
      return
    }
  
    try {
      creatingCollection.value = true
      const response = await $fetch(`${config.public.apiBaseUrl}/collections`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: {
          amount: parseFloat(amount.value),
          userId: selectedMemberId.value,
          currencyId: selectedCurrencyId.value
        }
      })
  
      if (response.status) {
        showSnackbar('Collection created successfully!', 'success')
        // Clear form
        amount.value = ''
        selectedCurrencyId.value = null
        selectedMemberId.value = null
        // Refresh collections
        await fetchCollections()
      } else {
        console.error('Failed to create collection:', response.payload || 'Unknown error');
        showSnackbar(response.payload || 'Failed to create collection', 'error')
      }
    } catch (error) {
      console.error('Error creating collection:', error)
      showSnackbar(`Failed to create collection: ${error.message}`, 'error')
    } finally {
      creatingCollection.value = false
    }
  }
  
  // Lifecycle - onMounted is suitable for client-side data fetching
  onMounted(async () => {
    // It's good practice to await these to ensure they are available
    // before collections are fetched, especially if collections data
    // relies on member/currency details for display.
    await Promise.all([
      fetchCurrencies(),
      fetchMembers()
    ]);
    await fetchCollections();
  })
  </script>
  
  <style scoped>
  .primary--text {
    color: rgb(var(--v-theme-primary)) !important;
  }
  </style>