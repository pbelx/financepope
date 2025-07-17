<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h4">Bank Management</span>
            <v-btn
              color="primary"
              @click="openAddBankDialog"
              prepend-icon="mdi-plus"
            >
              Add Bank
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <!-- Authentication Check -->
            <v-alert 
              v-if="!isAuthenticated" 
              color="warning" 
              icon="mdi-alert"
              class="mb-4"
            >
              Authentication required. Please log in to manage banks.
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
              <p class="mt-4 text-grey-600">Loading banks...</p>
            </div>

            <!-- No banks state -->
            <div v-else-if="banks.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey-400">mdi-bank-off</v-icon>
              <p class="mt-4 text-grey-600 text-h6">No banks found</p>
              <p class="text-grey-500">Create your first bank using the Add Bank button</p>
            </div>

            <!-- Banks Table -->
            <v-data-table
              v-else
              :headers="headers"
              :items="banks"
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

              <template v-slot:item.name="{ item }">
                <div class="text-h6 font-weight-bold">
                  <v-icon size="small" class="mr-2">mdi-bank</v-icon>
                  {{ item.name }}
                </div>
              </template>

              <template v-slot:item.created_at="{ item }">
                <span class="text-caption">
                  {{ formatDate(item.created_at) }}
                </span>
              </template>
              
              <template v-slot:item.actions="{ item }">
                <v-btn
                  icon="mdi-pencil"
                  size="small"
                  color="primary"
                  variant="text"
                  @click="openEditBankDialog(item)"
                >
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Bank Dialog -->
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ isEditing ? 'Edit Bank' : 'Add New Bank' }}</span>
        </v-card-title>
        
        <v-card-text>
          <v-form ref="form" v-model="formValid" lazy-validation>
            <v-text-field
              v-model="bankForm.name"
              label="Bank Name"
              :rules="bankNameRules"
              required
              variant="outlined"
              prepend-inner-icon="mdi-bank"
            ></v-text-field>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="closeDialog"
            :disabled="submitting"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            @click="saveBank"
            :loading="submitting"
            :disabled="!formValid"
          >
            {{ isEditing ? 'Update' : 'Create' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="successSnackbar"
      color="success"
      timeout="3000"
    >
      {{ successMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="successSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

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
  title: 'Bank Management',
  requiresAuth: true
})

// Composables
const config = useRuntimeConfig()
const { token } = useAuth()

// Reactive data
const banks = ref([])
const loading = ref(false)
const dialog = ref(false)
const formValid = ref(false)
const submitting = ref(false)
const isEditing = ref(false)
const successSnackbar = ref(false)
const errorSnackbar = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Form data
const bankForm = ref({
  id: null,
  name: ''
})

// Form reference
const form = ref(null)

// Table headers
const headers = [
  { title: 'ID', key: 'id', sortable: true, width: '100px' },
  { title: 'Bank Name', key: 'name', sortable: true },
  { title: 'Created Date', key: 'created_at', sortable: true, width: '150px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px' }
]

// Form validation rules
const bankNameRules = [
  v => !!v || 'Bank name is required',
  v => (v && v.length >= 2) || 'Bank name must be at least 2 characters',
  v => (v && v.length <= 100) || 'Bank name must be less than 100 characters'
]

// Computed properties
const isAuthenticated = computed(() => {
  return !!token.value
})

// Get authorization headers (same as places.vue)
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

const showSuccess = (message) => {
  successMessage.value = message
  successSnackbar.value = true
}

const showError = (message) => {
  errorMessage.value = message
  errorSnackbar.value = true
}

// API functions
const fetchBanks = async () => {
  loading.value = true
  try {
    console.log('Fetching banks from:', `${config.public.apiBaseUrl}/banks`)
    
    const response = await $fetch(`${config.public.apiBaseUrl}/banks`, {
      headers: getAuthHeaders()
    })
    
    console.log('Banks API Response:', response)
    
    if (response.status && response.payload) {
      banks.value = response.payload
      console.log('Banks loaded:', banks.value.length, 'banks')
    } else {
      console.error('Failed to fetch banks:', response.payload || 'Unknown error')
      showError('Failed to fetch banks')
    }
  } catch (error) {
    console.error('Error fetching banks:', error)
    showError(`Error fetching banks: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// Dialog functions
const openAddBankDialog = () => {
  isEditing.value = false
  bankForm.value = {
    id: null,
    name: ''
  }
  dialog.value = true
  
  // Reset form validation
  nextTick(() => {
    if (form.value) {
      form.value.resetValidation()
    }
  })
}

const openEditBankDialog = (bank) => {
  isEditing.value = true
  bankForm.value = {
    id: bank.id,
    name: bank.name
  }
  dialog.value = true
  
  // Reset form validation
  nextTick(() => {
    if (form.value) {
      form.value.resetValidation()
    }
  })
}

const closeDialog = () => {
  dialog.value = false
  bankForm.value = {
    id: null,
    name: ''
  }
  isEditing.value = false
  formValid.value = false
}

const saveBank = async () => {
  if (!isAuthenticated.value) {
    showError('Please log in to manage banks')
    return
  }

  // Validate form
  if (form.value) {
    const isValid = await form.value.validate()
    if (!isValid.valid) return
  }

  submitting.value = true
  
  try {
    const url = `${config.public.apiBaseUrl}/banks`
    const method = isEditing.value ? 'PUT' : 'POST'
    const payload = isEditing.value 
      ? { id: bankForm.value.id, name: bankForm.value.name }
      : { name: bankForm.value.name }

    const response = await $fetch(url, {
      method,
      headers: getAuthHeaders(),
      body: payload
    })

    if (response && response.status) {
      showSuccess(isEditing.value ? 'Bank updated successfully!' : 'Bank created successfully!')
      closeDialog()
      await fetchBanks() // Refresh the list
    } else {
      throw new Error(response?.payload || `Failed to ${isEditing.value ? 'update' : 'create'} bank`)
    }
  } catch (error) {
    console.error('Error saving bank:', error)
    showError(error.data?.payload || error.message || `Failed to ${isEditing.value ? 'update' : 'create'} bank`)
  } finally {
    submitting.value = false
  }
}

// Lifecycle
onMounted(async () => {
  if (isAuthenticated.value) {
    await fetchBanks()
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