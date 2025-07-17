
'''
<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h4">Members Management</span>
          </v-card-title>
          
          <v-card-text>
            <!-- Authentication Check -->
            <v-alert 
              v-if="!isAuthenticated" 
              color="warning" 
              icon="mdi-alert"
              class="mb-4"
            >
              Authentication required. Please log in to manage members.
              <template v-slot:append>
                <v-btn 
                  @click="navigateTo('/login')" 
                  color="warning"
                  variant="outlined"
                  size="small"
                >
                  Login
                </v-btn>
              </template>
            </v-alert>
            
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular
                indeterminate
                color="primary"
                size="64"
              />
              <p class="mt-4 text-grey-600">Loading members...</p>
            </div>

            <!-- No members state -->
            <div v-else-if="users.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-400">mdi-account-off</v-icon>
              <p class="mt-4 text-grey-600 text-h6">No members found</p>
            </div>

            <!-- Members Table -->
            <v-data-table
              v-else
              :headers="headers"
              :items="users"
              :loading="loading"
              class="elevation-1"
              :items-per-page="10"
              item-key="id"
            >
              <template v-slot:item.id="{ item }">
                <v-chip
                  size="small"
                  variant="outlined"
                  prepend-icon="mdi-pound"
                >
                  {{ item.id }}
                </v-chip>
              </template>

              <template v-slot:item.full_name="{ item }">
                <div class="text-h6 font-weight-bold">
                  <v-icon size="small" class="mr-2">mdi-account</v-icon>
                  {{ item.full_name }}
                </div>
              </template>

              <template v-slot:item.created_at="{ item }">
                <span class="text-caption">
                  {{ formatDate(item.created_at) }}
                </span>
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon
                  size="small"
                  variant="text"
                  color="grey"
                  disabled
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Error Snackbar -->
    <v-snackbar
      v-model="errorSnackbar"
      color="error"
      timeout="5000"
    >
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="errorSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
// Page metadata
definePageMeta({
  title: 'Members Management',
  requiresAuth: true
})

// Composables
const config = useRuntimeConfig()
const { token } = useAuth()

// Reactive data
const users = ref([])
const loading = ref(false)
const errorSnackbar = ref(false)
const errorMessage = ref('')

// Table headers
const headers = [
  { title: 'ID', key: 'id', sortable: true, width: '100px' },
  { title: 'Full Name', key: 'full_name', sortable: true },
  { title: 'Email', key: 'email', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'center' }
]

// Computed properties
const isAuthenticated = computed(() => {
  return !!token.value
})

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

const showError = (message) => {
  errorMessage.value = message
  errorSnackbar.value = true
}

// API functions
const fetchMembers = async () => {
  loading.value = true
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/users/members`, {
      headers: getAuthHeaders()
    })
    
    if (response.status && response.payload) {
      users.value = response.payload
    } else {
      showError('Failed to fetch members')
    }
  } catch (error) {
    showError(`Error fetching members: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  if (isAuthenticated.value) {
    await fetchMembers()
  }
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
''
