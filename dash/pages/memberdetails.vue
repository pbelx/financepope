<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h4">Member Details</span>
            <v-btn icon @click="goBack">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </v-card-title>

          <v-card-text v-if="loading">
            <div class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="64" />
              <p class="mt-4 text-grey-600">Loading member details...</p>
            </div>
          </v-card-text>

          <v-card-text v-else-if="member">
            <v-row>
              <v-col cols="12" md="6">
                <v-list-item>
                  <v-list-item-content>
                    <v-list-item-title class="text-h6">{{ member.full_name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ member.email }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-col>
            </v-row>

            <v-divider class="my-4" />

            <h5 class="text-h5 mb-4">Completed Orders</h5>

            <v-data-table
              :headers="orderHeaders"
              :items="member.orders"
              :loading="loading"
              class="elevation-1"
              :items-per-page="5"
              item-key="id"
            >
              <template v-slot:item.id="{ item }">
                <v-chip size="small" variant="outlined" prepend-icon="mdi-pound">
                  {{ item.id }}
                </v-chip>
              </template>

              <template v-slot:item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small">{{ item.status }}</v-chip>
              </template>

              <template v-slot:item.created_at="{ item }">
                <span class="text-caption">{{ formatDate(item.created_at) }}</span>
              </template>
            </v-data-table>

            <h5 class="text-h5 mb-4 mt-8">Pending Orders</h5>

            <v-data-table
              :headers="orderHeaders"
              :items="pendingOrders"
              :loading="loading"
              class="elevation-1"
              :items-per-page="5"
              item-key="id"
            >
              <template v-slot:item.id="{ item }">
                <v-chip size="small" variant="outlined" prepend-icon="mdi-pound">
                  {{ item.id }}
                </v-chip>
              </template>

              <template v-slot:item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small">{{ item.status }}</v-chip>
              </template>

              <template v-slot:item.created_at="{ item }">
                <span class="text-caption">{{ formatDate(item.created_at) }}</span>
              </template>
            </v-data-table>

            <h5 class="text-h5 mb-4 mt-8">Collections</h5>

            <v-data-table
              :headers="collectionHeaders"
              :items="collections"
              :loading="loading"
              class="elevation-1"
              :items-per-page="5"
              item-key="id"
            >
              <template v-slot:item.id="{ item }">
                <v-chip size="small" variant="outlined" prepend-icon="mdi-pound">
                  {{ item.id }}
                </v-chip>
              </template>

              <template v-slot:item.status="{ item }">
                <v-chip :color="getStatusColor(item.status)" size="small">{{ item.status }}</v-chip>
              </template>

              <template v-slot:item.created_at="{ item }">
                <span class="text-caption">{{ formatDate(item.created_at) }}</span>
              </template>
            </v-data-table>
          </v-card-text>

          <v-card-text v-else>
            <div class="text-center py-8">
              <v-icon size="64" color="grey-400">mdi-account-off</v-icon>
              <p class="mt-4 text-grey-600 text-h6">Member not found</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="errorSnackbar" color="error" timeout="5000">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="errorSnackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// Page metadata
definePageMeta({
  title: 'Member Details',
  requiresAuth: true
})

// Composables
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { token } = useAuth()

// Reactive data
const member = ref(null)
const loading = ref(false)
const errorSnackbar = ref(false)
const errorMessage = ref('')
const pendingOrders = ref([])
const collections = ref([])

// Table headers
const orderHeaders = [
  { title: 'Order ID', key: 'id', sortable: true, width: '120px' },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Date', key: 'createdAt', sortable: true },
]

const collectionHeaders = [
  { title: 'Collection ID', key: 'id', sortable: true, width: '120px' },
  { title: 'Amount', key: 'amount', sortable: true },
  { title: 'Currency', key: 'currency.name', sortable: true },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Date', key: 'created_at', sortable: true },
]

// Get authorization headers
const getAuthHeaders = () => {
  const authToken = token.value
  if (!authToken) {
    console.error('No authentication token found')
    return {}
  }
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  }
}

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'error'
    default:
      return 'grey'
  }
}

const showError = (message) => {
  errorMessage.value = message
  errorSnackbar.value = true
}

const goBack = () => {
  router.back()
}

// API functions
const fetchMemberDetails = async () => {
  loading.value = true
  const memberId = route.query.id
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/users/user/${memberId}`,
    {
      headers: getAuthHeaders()
    })
    
    if (response.status && response.payload) {
      member.value = response.payload
    } else {
      showError('Failed to fetch member details')
    }
  } catch (error) {
    showError(`Error fetching member details: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const fetchMemberOrders = async () => {
  const memberId = route.query.id
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/order/completed/member/${memberId}`,
    {
      headers: getAuthHeaders()
    })

    if (response.status && response.payload) {
      if (member.value) {
        member.value.orders = response.payload
      } else {
        member.value = { orders: response.payload } // Initialize if member is null
      }
    } else {
      showError('Failed to fetch member orders')
    }
  } catch (error) {
    showError(`Error fetching member orders: ${error.message}`)
  }
}

const fetchPendingOrders = async () => {
  const memberId = route.query.id
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/order/pending/user/${memberId}`,
    {
      headers: getAuthHeaders()
    })

    if (response.status && response.payload) {
      pendingOrders.value = response.payload
    } else {
      showError('Failed to fetch pending orders')
    }
  } catch (error) {
    showError(`Error fetching pending orders: ${error.message}`)
  }
}

const fetchMemberCollections = async () => {
  const memberId = route.query.id
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/collections/member/${memberId}`,
    {
      headers: getAuthHeaders()
    })

    if (response.status && response.payload) {
      collections.value = response.payload
    } else {
      showError('Failed to fetch member collections')
    }
  } catch (error) {
    showError(`Error fetching member collections: ${error.message}`)
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchMemberDetails(),
    fetchMemberOrders(),
    fetchPendingOrders(),
    fetchMemberCollections()
  ])
})
</script>

<style scoped>
.v-card-title {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.v-data-table {
  border-radius: 8px;
}

.v-btn {
  text-transform: none;
}
</style>
