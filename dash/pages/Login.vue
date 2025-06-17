<template>
  <v-container fluid class="login-container">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card class="login-card" elevation="8">
          <v-card-title class="text-center pb-4">
            <h2 class="login-title">Login</h2>
          </v-card-title>

          <v-card-text>
            <v-form @submit.prevent="handleLogin" ref="loginForm">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                placeholder="Enter Email"
                :rules="emailRules"
                :disabled="loading"
                required
                outlined
                dense
                prepend-inner-icon="mdi-email"
                class="mb-3"
                autocomplete="email"
              />

              <v-text-field
                v-model="password"
                :label="'Password'"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter Password"
                :rules="passwordRules"
                :disabled="loading"
                required
                outlined
                dense
                prepend-inner-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append="togglePasswordVisibility"
                class="mb-3"
                autocomplete="current-password"
              />

              <v-alert
                v-if="error"
                type="error"
                dense
                text
                class="mb-3"
              >
                {{ error }}
              </v-alert>

              <v-alert
                v-if="success"
                type="success"
                dense
                text
                class="mb-3"
              >
                {{ success }}
              </v-alert>

              <v-btn
                type="submit"
                :loading="loading"
                :disabled="loading"
                color="primary"
                large
                block
                class="mb-4"
              >
                {{ loading ? 'Logging In...' : 'Login' }}
              </v-btn>
            </v-form>

            <div class="login-links text-center">
              <v-btn
                text
                small
                color="primary"
                :disabled="loading"
                @click="navigateToResetPassword"
                class="mr-4"
              >
                Forgot Password?
              </v-btn>

              <v-btn
                text
                small
                color="secondary"
                :disabled="loading"
                @click="navigateToSignup"
              >
                Sign Up
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
definePageMeta({
  middleware: 'guest',
  layout: 'auth'
});

// Assuming useAuth provides a way to get the current user's details
// If it doesn't, you'll need to modify useAuth to store and expose the user object
const { login, isAuthenticated, user } = useAuth(); // Added 'user' here

const email = ref('');
const password = ref('');
const loading = ref(false);
const showPassword = ref(false);
const error = ref(null);
const success = ref(null);
const loginForm = ref(null);

const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Email must be valid'
];

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters'
];

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const handleLogin = async () => {
  error.value = null;
  success.value = null;
  console.log('handleLogin triggered');

  const { valid } = await loginForm.value.validate();
  if (!valid) {
    return;
  }

  loading.value = true;

  try {
    // This 'response' variable will receive { status: true, message: 'Login successful!' }
    // or { status: false, message: '...' } from useAuth().login
    const response = await login(email.value, password.value);
    console.log('Login Response from useAuth (in Login.vue):', response);

    if (response.status) {
      // You now need to check the 'user' data that is reactive in useAuth
      // This is why you imported 'user' from useAuth earlier.
      // Access the user from the composable's reactive state.
      if (user.value && user.value.is_admin) { // Corrected access to reactive 'user'
        success.value = response.message || 'Login successful! Redirecting to dashboard...';
        setTimeout(async () => {
          await navigateTo('/dashboard');
        }, 1000);
      } else {
        // If not an admin, show a message and prevent redirection to dashboard
        success.value = 'Login successful, but you are not an administrator. Access denied to dashboard.';
      }
    } else {
      error.value = response.message || 'Login failed. Please try again.';
    }
  } catch (err) {
    console.error('Login failed outside useAuth (in Login.vue catch):', err);
    error.value = 'An unexpected error occurred. Please try again.';
  } finally {
    loading.value = false;
  }
};
const navigateToResetPassword = async () => {
  await navigateTo('/reset-password');
};

const navigateToSignup = async () => {
  await navigateTo('/signup');
};

onMounted(() => {
  // This initial check on mount should also consider the admin status if you want
  // to prevent non-admins from being redirected to /dashboard on refresh if already logged in.
  // For now, I'm keeping it as is, assuming the primary check is after a fresh login.
  if (isAuthenticated.value && user.value && user.value.is_admin) {
    console.log('User already logged in and is admin, redirecting to dashboard');
    navigateTo('/dashboard');
  } else if (isAuthenticated.value && user.value && !user.value.is_admin) {
    console.log('User already logged in but not admin. Preventing dashboard redirect.');
    // Optionally redirect non-admins to a different default page here
    // navigateTo('/user-profile');
  }
});

useHead({
  title: 'Login - Your App Name',
  meta: [
    { name: 'description', content: 'Login to your account' }
  ]
});
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  border-radius: 16px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1) !important;
}

.login-title {
  color: #333;
  font-weight: 600;
  font-size: 2rem;
  margin: 0;
}

.login-links {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
  margin-top: 16px;
}

/* Custom responsive adjustments */
@media (max-width: 600px) {
  .login-container {
    padding: 10px;
  }

  .login-title {
    font-size: 1.5rem;
  }
}
</style>