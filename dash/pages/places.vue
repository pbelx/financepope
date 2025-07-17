<template>
  <v-container fluid class="pa-4">
    <v-row class="mb-4">
      <v-col class="d-flex align-center">
        <h1 class="text-h4 font-weight-bold">Country Management</h1>
      </v-col>
    </v-row>

    <!-- Create/Edit Place Form -->
    <v-card class="mb-6" elevation="3">
      <v-card-title>
        <h2 class="text-h5">{{ editingPlace ? 'Edit Place' : 'Create New Place' }}</h2>
        <v-spacer />
        <v-btn
          v-if="editingPlace"
          variant="text"
          @click="cancelEdit"
          prepend-icon="mdi-close"
        >
          Cancel Edit
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleSubmitPlace" ref="placeFormRef">
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="placeForm.name"
                label="Place Name"
                variant="outlined"
                :rules="[rules.required]"
                prepend-inner-icon="mdi-map-marker"
                required
                persistent-hint
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="placeForm.selectedCurrencyIds"
                :items="currencyOptions"
                label="Select Currencies"
                item-title="display"
                item-value="id"
                variant="outlined"
                multiple
                chips
                :rules="[rules.arrayRequired]"
                prepend-inner-icon="mdi-cash-multiple"
                :menu-props="{ closeOnContentClick: false }"
                persistent-hint
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="placeForm.selectedBankIds"
                :items="bankOptions"
                label="Select Banks"
                item-title="display"
                item-value="id"
                variant="outlined"
                multiple
                chips
                :rules="[rules.arrayRequired]"
                prepend-inner-icon="mdi-bank"
                :menu-props="{ closeOnContentClick: false }"
                persistent-hint
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="d-flex justify-end">
              <v-btn
                type="submit"
                color="primary"
                size="large"
                :loading="submittingPlace"
                :disabled="!isFormValid"
              >
                <v-icon start>{{ editingPlace ? 'mdi-content-save' : 'mdi-plus' }}</v-icon>
                {{ submittingPlace ? (editingPlace ? 'Updating...' : 'Creating...') : (editingPlace ? 'Update Place' : 'Create Place') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Places List -->
    <v-card elevation="3">
      <v-card-title>
        <h2 class="text-h5">Places List</h2>
        <v-spacer />
        <v-btn
          icon
          @click="fetchPlaces"
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
          <p class="mt-4 text-grey-600">Loading places...</p>
        </div>

        <div v-else-if="places.length === 0" class="text-center py-8">
          <v-icon size="64" color="grey-400">mdi-map-marker-off</v-icon>
          <p class="mt-4 text-grey-600 text-h6">No places found</p>
          <p class="text-grey-500">Create your first place using the form above</p>
        </div>

        <v-data-table
          v-else
          :headers="tableHeaders"
          :items="places"
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

          <template #item.name="{ item }">
            <div class="text-h6 font-weight-bold">
              <v-icon size="small" class="mr-2">mdi-map-marker</v-icon>
              {{ item.name }}
            </div>
          </template>

          <template #item.currencies="{ item }">
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-for="currency in item.currencys"
                :key="currency.id"
                size="small"
                variant="flat"
                color="blue-grey lighten-5"
              >
                <v-icon size="small" start>mdi-cash</v-icon>
                {{ currency.name }}
              </v-chip>
              <span v-if="item.currencys.length === 0" class="text-grey-500">No currencies</span>
            </div>
          </template>

          <template #item.banks="{ item }">
            <div class="d-flex flex-wrap ga-1">
              <v-chip
                v-for="bank in item.banks"
                :key="bank.id"
                size="small"
                variant="flat"
                color="green lighten-5"
              >
                <v-icon size="small" start>mdi-bank</v-icon>
                {{ bank.name }}
              </v-chip>
              <span v-if="item.banks.length === 0" class="text-grey-500">No banks</span>
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
              @click="editPlace(item)"
              class="mr-1"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              @click="viewPlace(item)"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- View Place Dialog -->
    <v-dialog v-model="viewDialog" max-width="600">
      <v-card v-if="selectedPlace">
        <v-card-title class="headline">
          <v-icon start>mdi-map-marker</v-icon>
          Place Details - {{ selectedPlace.name }}
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <div class="mb-4">
                <h3 class="text-h6 mb-2">Basic Information</h3>
                <p><strong>ID:</strong> {{ selectedPlace.id }}</p>
                <p><strong>Name:</strong> {{ selectedPlace.name }}</p>
                <p><strong>Created:</strong> {{ formatDate(selectedPlace.created_at) }}</p>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <h3 class="text-h6 mb-2">Currencies</h3>
              <div v-if="selectedPlace.currencys && selectedPlace.currencys.length > 0">
                <v-chip
                  v-for="currency in selectedPlace.currencys"
                  :key="currency.id"
                  class="mr-2 mb-2"
                  size="small"
                  variant="flat"
                  color="blue-grey lighten-5"
                >
                  <v-icon size="small" start>mdi-cash</v-icon>
                  {{ currency.name }}
                </v-chip>
              </div>
              <p v-else class="text-grey-500">No currencies assigned</p>
            </v-col>
            <v-col cols="12" md="6">
              <h3 class="text-h6 mb-2">Banks</h3>
              <div v-if="selectedPlace.banks && selectedPlace.banks.length > 0">
                <v-chip
                  v-for="bank in selectedPlace.banks"
                  :key="bank.id"
                  class="mr-2 mb-2"
                  size="small"
                  variant="flat"
                  color="green lighten-5"
                >
                  <v-icon size="small" start>mdi-bank</v-icon>
                  {{ bank.name }}
                </v-chip>
              </div>
              <p v-else class="text-grey-500">No banks assigned</p>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="viewDialog = false">Close</v-btn>
          <v-btn color="primary" @click="editPlace(selectedPlace)">
            <v-icon start>mdi-pencil</v-icon>
            Edit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { ref, computed, onMounted, reactive, toRefs } from 'vue'

// Composables
const config = useRuntimeConfig()
const { token } = useAuth()

// Reactive data
const places = ref([])
const currencies = ref([])
const banks = ref([])
const loading = ref(false)
const submittingPlace = ref(false)
const editingPlace = ref(null)

// Use reactive for form data to prevent unwanted resets
const formState = reactive({
  name: '',
  selectedCurrencyIds: [],
  selectedBankIds: []
})

// Create a reactive reference to the form data
const placeForm = ref(formState)

// UI state
const viewDialog = ref(false)
const selectedPlace = ref(null)
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Form reference
const placeFormRef = ref(null)

// Table headers
const tableHeaders = ref([
  { title: 'ID', key: 'id', sortable: true, width: '100px' },
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Currencies', key: 'currencies', sortable: false },
  { title: 'Banks', key: 'banks', sortable: false },
  { title: 'Created Date', key: 'created_at', sortable: true, width: '120px' },
  { title: 'Actions', key: 'actions', sortable: false, width: '120px' }
])

// Form validation rules
const rules = {
  required: (value) => {
    return !!value || 'This field is required'
  },
  arrayRequired: (value) => {
    return (Array.isArray(value) && value.length > 0) || 'At least one item must be selected'
  }
}

// Computed properties
const currencyOptions = computed(() => {
  return currencies.value.map(currency => ({
    id: currency.id,
    display: currency.name
  }))
})

const bankOptions = computed(() => {
  return banks.value.map(bank => ({
    id: bank.id,
    display: bank.name
  }))
})

const isFormValid = computed(() => {
  return placeForm.value.name?.trim() &&
         Array.isArray(placeForm.value.selectedCurrencyIds) &&
         placeForm.value.selectedCurrencyIds.length > 0 &&
         Array.isArray(placeForm.value.selectedBankIds) &&
         placeForm.value.selectedBankIds.length > 0
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

const showSnackbar = (message, color = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

const resetForm = () => {
  // Reset form values properly
  placeForm.value.name = ''
  placeForm.value.selectedCurrencyIds = []
  placeForm.value.selectedBankIds = []
  editingPlace.value = null
  
  // Reset form validation if form ref exists
  if (placeFormRef.value) {
    placeFormRef.value.resetValidation()
  }
}

const cancelEdit = () => {
  resetForm()
  showSnackbar('Edit cancelled', 'info')
}

// API functions
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

const fetchBanks = async () => {
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/banks`, {
      headers: getAuthHeaders()
    })

    if (response.status && response.payload) {
      banks.value = response.payload
    } else {
      console.error('Failed to fetch banks:', response.payload || 'Unknown error')
      showSnackbar('Failed to fetch banks', 'error')
    }
  } catch (error) {
    console.error('Error fetching banks:', error)
    showSnackbar(`Error fetching banks: ${error.message}`, 'error')
    
    // Mock data for banks if API fails
    banks.value = [
      { id: 1, name: 'Centenary Bank' },
      { id: 2, name: 'Stanbic Bank' },
      { id: 3, name: 'DFCU Bank' },
      { id: 4, name: 'Equity Bank' }
    ]
  }
}

const fetchPlaces = async () => {
  loading.value = true
  try {
    const response = await $fetch(`${config.public.apiBaseUrl}/places`, {
      headers: getAuthHeaders()
    })

    if (response.status && response.payload) {
      places.value = response.payload
    } else {
      console.error('Failed to fetch places:', response.payload || 'Unknown error')
      showSnackbar('Failed to fetch places', 'error')
    }
  } catch (error) {
    console.error('Error fetching places:', error)
    showSnackbar(`Error fetching places: ${error.message}`, 'error')
  } finally {
    loading.value = false
  }
}

const handleSubmitPlace = async () => {
  // Validate form before submission
  if (placeFormRef.value) {
    const { valid } = await placeFormRef.value.validate()
    if (!valid) {
      showSnackbar('Please fill in all required fields correctly', 'error')
      return
    }
  }

  if (!isFormValid.value) {
    showSnackbar('Please fill in all required fields', 'error')
    return
  }

  try {
    submittingPlace.value = true
    const isEditing = !!editingPlace.value

    const payload = {
      name: placeForm.value.name.trim(),
      currencys: placeForm.value.selectedCurrencyIds,
      banks: placeForm.value.selectedBankIds
    }

    if (isEditing) {
      payload.id = editingPlace.value.id
    }

    const response = await $fetch(`${config.public.apiBaseUrl}/places`, {
      method: isEditing ? 'PUT' : 'POST',
      headers: getAuthHeaders(),
      body: payload
    })

    if (response.status) {
      showSnackbar(
        `Place ${isEditing ? 'updated' : 'created'} successfully!`,
        'success'
      )
      resetForm()
      await fetchPlaces()
    } else {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} place:`, response.payload || 'Unknown error')
      showSnackbar(response.payload || `Failed to ${isEditing ? 'update' : 'create'} place`, 'error')
    }
  } catch (error) {
    console.error(`Error ${editingPlace.value ? 'updating' : 'creating'} place:`, error)
    showSnackbar(`Failed to ${editingPlace.value ? 'update' : 'create'} place: ${error.message}`, 'error')
  } finally {
    submittingPlace.value = false
  }
}

// Action handlers
const editPlace = (place) => {
  editingPlace.value = { ...place } // Create a copy to avoid direct mutation
  
  // Populate form with existing data
  placeForm.value.name = place.name || ''
  placeForm.value.selectedCurrencyIds = place.currencys ? place.currencys.map(c => c.id) : []
  placeForm.value.selectedBankIds = place.banks ? place.banks.map(b => b.id) : []
  
  viewDialog.value = false
  
  // Scroll to form
  document.querySelector('.v-card').scrollIntoView({ behavior: 'smooth' })
  showSnackbar(`Editing ${place.name}`, 'info')
}

const viewPlace = (place) => {
  selectedPlace.value = { ...place } // Create a copy to avoid mutations
  viewDialog.value = true
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchCurrencies(),
    fetchBanks()
  ])
  await fetchPlaces()
})
</script>

<style scoped>
.primary--text {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>