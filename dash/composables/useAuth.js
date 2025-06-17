// composables/useAuth.js
export const useAuth = () => {
  // Use runtime config instead of hardcoded URL
  const config = useRuntimeConfig();
  const API_BASE_URL = config.public.apiBaseUrl;
  
  // Use Nuxt's built-in state management
  const isAuthenticated = useState('auth.isAuthenticated', () => false);
  const user = useState('auth.user', () => null);
  const token = useState('auth.token', () => null);
  
  // Utility functions for localStorage with SSR safety
  const saveToStorage = (key, value) => {
    if (process.client) {
      localStorage.setItem(key, value);
    }
  };

  const getFromStorage = (key) => {
    if (process.client) {
      return localStorage.getItem(key);
    }
    return null;
  };

  const removeFromStorage = (key) => {
    if (process.client) {
      localStorage.removeItem(key);
    }
  };

  // Function to log in a user
  const login = async (email, password) => {
    try {
      const response = await $fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        body: {
          email,
          password,
        },
      });

      console.log('Login API Response:', response);

      // Handle different response structures
      const data = response.data || response;
      
      if (data && data.status) {
        const { token: receivedToken, user: userData } = data.payload;

        // Save to localStorage
        saveToStorage("token", receivedToken);
        saveToStorage("user", JSON.stringify(userData));

        // Update reactive state
        token.value = receivedToken;
        user.value = userData;
        isAuthenticated.value = true;

        return { status: true, message: 'Login successful!' };
      } else {
        return { status: false, message: data?.payload || data?.message || 'Login failed.' };
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle different error structures from $fetch
      let errorMessage = "An unexpected error occurred during login.";
      
      if (error.data) {
        errorMessage = error.data.message || error.data.payload || errorMessage;
      } else if (error.response?.data) {
        errorMessage = error.response.data.message || error.response.data.payload || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { status: false, message: errorMessage };
    }
  };

  // Function to log out a user
  const signOut = async () => {
    try {
      // Optional: If you have a backend logout endpoint, call it here
      // await $fetch(`${API_BASE_URL}/auth/logout`, {
      //   method: 'POST',
      //   body: { token: token.value }
      // });

      removeFromStorage("token");
      removeFromStorage("user");

      token.value = null;
      user.value = null;
      isAuthenticated.value = false;

      // Use Nuxt's navigation
      await navigateTo('/login');

      return { status: true, message: 'Logged out successfully.' };
    } catch (error) {
      console.error("Logout error:", error);
      return { status: false, message: error.message || 'Error during logout.' };
    }
  };

  // Function to check authentication status
  const checkAuthStatus = () => {
    if (process.client) {
      const storedToken = getFromStorage('token');
      const storedUser = getFromStorage('user');

      if (storedToken && storedUser) {
        token.value = storedToken;
        user.value = JSON.parse(storedUser);
        isAuthenticated.value = true;
        console.log('Auth status: User is authenticated.');
      } else {
        isAuthenticated.value = false;
        user.value = null;
        token.value = null;
        console.log('Auth status: User is not authenticated.');
      }
    }
  };

  return {
    isAuthenticated: readonly(isAuthenticated),
    user: readonly(user),
    token: readonly(token),
    login,
    signOut,
    checkAuthStatus,
  };
};