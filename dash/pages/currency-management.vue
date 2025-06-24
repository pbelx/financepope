```vue
<template>
  <v-app>
    <v-main>
      <v-container fluid class="pa-6">
        <div v-if="!isAuthenticated" class="text-center pa-8">
          <v-card class="mx-auto" max-width="400" elevation="4">
            <v-card-title class="justify-center">
              <v-icon color="warning" size="48">mdi-lock</v-icon>
            </v-card-title>
            <v-card-text class="text-center">
              <h2 class="text-h5 mb-4">Authentication Required</h2>
              <p class="text-body-1 grey--text">
                Please log in to access currency management.
              </p>
            </v-card-text>
            <v-card-actions class="justify-center pb-4">
              <v-btn
                @click="redirectToLogin"
                color="primary"
                large
                elevation="2"
              >
                <v-icon left>mdi-login</v-icon>
                Go to Login
              </v-btn>
            </v-card-actions>
          </v-card>
        </div>

        <div v-else>
          <div class="d-flex align-center justify-space-between mb-6">
            <div class="d-flex align-center">
              <v-btn 
                icon 
                @click="$router.back()" 
                class="mr-4"
                size="large"
              >
                <v-icon>mdi-arrow-left</v-icon>
              </v-btn>
              <h1 class="text-h4 font-weight-bold">Currency Management</h1>
            </div>
            
            <div class="d-flex align-center">
              <v-chip
                class="mr-4"
                color="primary"
                outlined
              >
                <v-icon left small>mdi-account</v-icon>
                {{ user?.name || user?.email || 'User' }}
              </v-chip>
              <v-btn
                @click="handleLogout"
                outlined
                color="error"
                small
              >
                <v-icon left small>mdi-logout</v-icon>
                Logout
              </v-btn>
            </div>
          </div>

          <v-card class="mb-6" elevation="2">
            <v-card-title>
              <v-icon class="mr-2" color="warning">mdi-currency-usd</v-icon>
              {{ isEdit ? 'Edit Currency' : 'Add New Currency' }}
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text>
              <v-row>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="form.name"
                    label="Currency Name"
                    placeholder="e.g., US Dollar"
                    outlined
                    dense
                    :rules="[rules.required]"
                    prepend-inner-icon="mdi-currency-usd"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="form.code"
                    label="Currency Code"
                    placeholder="e.g., USD"
                    outlined
                    dense
                    :rules="[rules.required, rules.codeFormat]"
                    prepend-inner-icon="mdi-code-tags"
                    counter="3"
                    maxlength="3"
                    @input="form.code = form.code.toUpperCase()"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="form.ratePerDollar"
                    label="Rate Per Dollar"
                    placeholder="e.g., 1.00"
                    outlined
                    dense
                    type="number"
                    step="0.01"
                    :rules="[rules.required, rules.positiveNumber]"
                    prepend-inner-icon="mdi-calculator"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.symbol"
                    label="Currency Symbol (Optional)"
                    placeholder="e.g., $, €, £"
                    outlined
                    dense
                    prepend-inner-icon="mdi-currency-sign"
                    maxlength="5"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-card-text>
            <v-card-actions class="px-6 pb-4">
              <v-btn
                v-if="isEdit"
                @click="cancelEdit"
                outlined
                color="grey"
                class="mr-2"
              >
                Cancel
              </v-btn>
              <v-btn
                @click="isEdit ? updateCurrency() : addCurrency()"
                :loading="posting"
                :disabled="!isFormValid"
                color="primary"
                elevation="2"
              >
                <v-icon left>{{ isEdit ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
                {{ isEdit ? 'Update Currency' : 'Add Currency' }}
              </v-btn>
            </v-card-actions>
          </v-card>

          <v-card elevation="2">
            <v-card-title class="d-flex align-center">
              <v-icon class="mr-2" color="success">mdi-format-list-bulleted</v-icon>
              Currencies List
              <v-spacer></v-spacer>
              <v-chip color="primary" text-color="white">
                {{ currencies.length }} Total
              </v-chip>
              <v-btn
                @click="fetchCurrencies"
                icon
                small
                class="ml-2"
                :loading="loading"
              >
                <v-icon>mdi-refresh</v-icon>
              </v-btn>
            </v-card-title>
            <v-divider></v-divider>

            <div v-if="loading" class="text-center pa-6">
              <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
              <p class="mt-4 text-body-1">Loading currencies...</p>
            </div>

            <div v-else-if="currencies.length === 0" class="text-center pa-6">
              <v-icon size="64" color="grey lighten-1">mdi-currency-usd-off</v-icon>
              <p class="text-h6 mt-4 grey--text">No currencies found</p>
              <p class="text-body-2 grey--text">Add your first currency above</p>
            </div>

            <div v-else>
              <v-row class="ma-0 pa-4 grey lighten-4">
                <v-col cols="4" class="font-weight-bold">Currency Name</v-col>
                <v-col cols="2" class="font-weight-bold">Code</v-col>
                <v-col cols="3" class="font-weight-bold">Rate Per Dollar</v-col>
                <v-col cols="3" class="font-weight-bold text-center">Actions</v-col>
              </v-row>

              <div class="currency-list" style="max-height: 400px; overflow-y: auto;">
                <v-row 
                  v-for="currency in currencies" 
                  :key="currency.id"
                  class="ma-0 pa-4 border-bottom"
                  :class="{ 'selected-row': selectedCurrency?.id === currency.id }"
                >
                  <v-col cols="4" class="d-flex align-center">
                    <v-avatar size="32" color="warning" class="mr-3">
                      <span class="white--text font-weight-bold">
                        {{ currency.symbol || currency.code || currency.name.charAt(0) }}
                      </span>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ currency.name }}</div>
                    </div>
                  </v-col>
                  <v-col cols="2" class="d-flex align-center">
                    <div class="text-caption grey--text">{{ currency.code }}</div>
                  </v-col>
                  <v-col cols="3" class="d-flex align-center">
                    <div>
                      <div class="font-weight-bold text-primary">
                        {{ formatCurrency(currency.rate_per_dollar) }}
                      </div>
                      <div class="text-caption grey--text">per USD</div>
                    </div>
                  </v-col>
                  <v-col cols="3" class="d-flex align-center justify-center">
                    <v-btn
                      @click="editCurrency(currency)"
                      small
                      color="orange"
                      outlined
                      class="mr-2"
                    >
                      <v-icon small left>mdi-pencil</v-icon>
                      Edit
                    </v-btn>
                    <v-btn
                      @click="confirmDelete(currency)"
                      small
                      color="error"
                      outlined
                      disabled
                    >
                      <v-icon small>mdi-delete</v-icon>
                    </v-btn>
                  </v-col>
                </v-row>
              </div>
            </div>
          </v-card>
        </div>

        <v-dialog v-model="deleteDialog" max-width="400">
          <v-card>
            <v-card-title class="headline">
              <v-icon color="error" class="mr-2">mdi-alert</v-icon>
              Confirm Delete
            </v-card-title>
            <v-card-text>
              Are you sure you want to delete the currency "{{ currencyToDelete?.name }}"?
              This action cannot be undone.
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn @click="deleteDialog = false" text>Cancel</v-btn>
              <v-btn 
                @click="deleteCurrency" 
                color="error"
                :loading="deleting"
              >
                Delete
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-snackbar
          v-model="snackbar.show"
          :color="snackbar.color"
          :timeout="3000"
          top
        >
          {{ snackbar.message }}
          <template v-slot:action="{ attrs }">
            <v-btn
              color="white"
              text
              v-bind="attrs"
              @click="snackbar.show = false"
            >
              Close
            </v-btn>
          </template>
        </v-snackbar>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Authentication composable
const { isAuthenticated, user, token, checkAuthStatus, signOut } = useAuth()

// Reactive data
const currencies = ref([])
const loading = ref(false)
const posting = ref(false)
const deleting = ref(false)
const isEdit = ref(false)
const selectedCurrency = ref(null)
const deleteDialog = ref(false)
const currencyToDelete = ref(null)

// Form data - ADD code and symbol fields
const form = ref({
  name: '',
  code: '',
  symbol: '',
  ratePerDollar: ''
})

// Snackbar for notifications
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Form validation rules - ADD code format validation
const rules = {
  required: value => !!value || 'This field is required',
  positiveNumber: value => {
    if (!value) return true
    const num = parseFloat(value)
    return (num > 0) || 'Rate must be greater than 0'
  },
  codeFormat: value => {
    if (!value) return true
    return value.length === 3 || 'Currency code must be exactly 3 characters'
  }
}

// Computed properties - UPDATE validation
const isFormValid = computed(() => {
  return form.value.name && 
           form.value.code && 
           form.value.code.length === 3 &&
           form.value.ratePerDollar && 
           parseFloat(form.value.ratePerDollar) > 0
})

// Methods
const showMessage = (message, color = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

// Methods - UPDATE resetForm
const resetForm = () => {
  form.value = {
    name: '',
    code: '',
    symbol: '',
    ratePerDollar: ''
  }
  isEdit.value = false
  selectedCurrency.value = null
}

const formatCurrency = (rate) => {
  if (!rate) return '0.00'
  return parseFloat(rate).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4
  })
}

// Authentication methods
const redirectToLogin = () => {
  navigateTo('/login')
}

const handleLogout = async () => {
  const result = await signOut()
  if (result.status) {
    showMessage('Logged out successfully', 'success')
  } else {
    showMessage(result.message, 'error')
  }
}

// API methods with authentication headers
const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token.value}`
  }
}

const fetchCurrencies = async () => {
  if (!isAuthenticated.value) {
    showMessage('Please log in to access currencies', 'error')
    return
  }

  try {
    loading.value = true
    const config = useRuntimeConfig()
    const apiBaseUrl = config.public.apiBaseUrl
    
    const response = await $fetch(`${apiBaseUrl}/currency/all`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    
    if (response.status) {
      currencies.value = response.data?.payload || response.payload || []
    } else {
      showMessage('Failed to fetch currencies', 'error')
    }
  } catch (error) {
    console.error('Error fetching currencies:', error)
    if (error.status === 401 || error.statusCode === 401) {
      showMessage('Session expired. Please log in again.', 'error')
      await signOut()
    } else {
      showMessage('Error loading currencies', 'error')
    }
  } finally {
    loading.value = false
  }
}

// UPDATE addCurrency method
const addCurrency = async () => {
  if (!isAuthenticated.value) {
    showMessage('Please log in to add currencies', 'error')
    return
  }

  if (!isFormValid.value) {
    showMessage('Please fill in all required fields', 'error')
    return
  }

  try {
    posting.value = true
    const config = useRuntimeConfig()
    const apiBaseUrl = config.public.apiBaseUrl
    
    const formData = {
      name: form.value.name.trim(),
      code: form.value.code.trim().toUpperCase(),
      symbol: form.value.symbol.trim() || form.value.code.trim().toUpperCase(),
      ratePerDollar: parseFloat(form.value.ratePerDollar)
    }

    const response = await $fetch(`${apiBaseUrl}/currency/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    })

    if (response.success) {
      showMessage('Currency added successfully!', 'success')
      await fetchCurrencies()
      resetForm()
    } else {
      showMessage('Failed to add currency', 'error')
    }
  } catch (error) {
    console.error('Error adding currency:', error)
    if (error.status === 401 || error.statusCode === 401) {
      showMessage('Session expired. Please log in again.', 'error')
      await signOut()
    } else {
      showMessage('Error adding currency: ' + (error.data?.message || error.message), 'error')
    }
  } finally {
    posting.value = false
  }
}

// UPDATE updateCurrency method
const updateCurrency = async () => {
  if (!isAuthenticated.value) {
    showMessage('Please log in to update currencies', 'error')
    return
  }

  if (!isFormValid.value || !selectedCurrency.value) {
    showMessage('Please fill in all required fields', 'error')
    return
  }

  try {
    posting.value = true
    const config = useRuntimeConfig()
    const apiBaseUrl = config.public.apiBaseUrl
    
    const formData = {
      id: selectedCurrency.value.id,
      name: form.value.name.trim(),
      code: form.value.code.trim().toUpperCase(),
      symbol: form.value.symbol.trim() || form.value.code.trim().toUpperCase(),
      ratePerDollar: parseFloat(form.value.ratePerDollar)
    }

    const response = await $fetch(`${apiBaseUrl}/currency/update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: formData
    })

    if (response.success) {
      showMessage('Currency updated successfully!', 'success')
      await fetchCurrencies()
      resetForm()
    } else {
      showMessage('Failed to update currency', 'error')
    }
  } catch (error) {
    console.error('Error updating currency:', error)
    if (error.status === 401 || error.statusCode === 401) {
      showMessage('Session expired. Please log in again.', 'error')
      await signOut()
    } else {
      showMessage('Error updating currency: ' + (error.data?.message || error.message), 'error')
    }
  } finally {
    posting.value = false
  }
}

// UPDATE editCurrency method
const editCurrency = (currency) => {
  selectedCurrency.value = currency
  form.value = {
    name: currency.name,
    code: currency.code || '',
    symbol: currency.symbol || '',
    ratePerDollar: currency.rate_per_dollar.toString()
  }
  isEdit.value = true
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  resetForm()
}

const confirmDelete = (currency) => {
  currencyToDelete.value = currency
  deleteDialog.value = true
}

const deleteCurrency = async () => {
  if (!currencyToDelete.value || !isAuthenticated.value) return

  try {
    deleting.value = true
    const config = useRuntimeConfig()
    const apiBaseUrl = config.public.apiBaseUrl
    
    const response = await $fetch(`${apiBaseUrl}/currency/delete/${currencyToDelete.value.id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })

    if (response.status) {
      showMessage('Currency deleted successfully!', 'success')
      await fetchCurrencies()
      deleteDialog.value = false
      currencyToDelete.value = null
    } else {
      showMessage('Failed to delete currency', 'error')
    }
  } catch (error) {
    console.error('Error deleting currency:', error)
    if (error.status === 401 || error.statusCode === 401) {
      showMessage('Session expired. Please log in again.', 'error')
      await signOut()
    } else {
      showMessage('Error deleting currency: ' + (error.data?.message || error.message), 'error')
    }
  } finally {
    deleting.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Check authentication status first
  checkAuthStatus()
  
  // Only fetch currencies if authenticated
  if (isAuthenticated.value) {
    fetchCurrencies()
  }
})
</script>

<style scoped>
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06) !important;
}

.border-bottom:last-child {
  border-bottom: none !important;
}

.selected-row {
  background-color: rgba(25, 118, 210, 0.08) !important;
}

.currency-list .v-row:hover {
  background-color: rgba(0, 0, 0, 0.02);
  transition: background-color 0.2s ease;
}

.v-card {
  border-radius: 12px !important;
}

.v-btn {
  text-transform: none !important;
}

.stat-card {
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-2px);
}

/* Custom scrollbar for currency list */
.currency-list::-webkit-scrollbar {
  width: 6px;
}

.currency-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.currency-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.currency-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
```