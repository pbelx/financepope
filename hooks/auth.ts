import axios from "axios";
import { HOST_URL, generateAxiosInstance } from "../shared/constants";
import * as SecureStore from "expo-secure-store";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Platform } from "react-native";

export const useAuth = () => {
  const { setUser, setInit, init } = useContext(AuthContext);

  async function saveToStorage(key: string, value: string) {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  }

  async function getFromStorage(key: string) {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  }

  async function removeFromStorage(key: string) {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  }

  async function signUp(
    full_name: string,
    email: string,
    password: string,
    phone_number: string,
    address: string
  ) {
    try {
      const response = await axios.post(`${HOST_URL}/api/users/signup`, {
        full_name,
        email,
        password,
        phone_number,
        address,
      });

      const data = response.data;

      if (data.status) {
        const { token, user } = data.payload;

        await saveToStorage("token", token);
        await saveToStorage("user", JSON.stringify(user));

        setUser(user);
      }

      return data;
    } catch (error) {
      console.error("Signup error:", error);
      return { payload: "An error occurred while signing up", status: false };
    }
  }

  async function signIn(email: string, password: string) {
    // console.log(email, password);
    try {
      const response = await axios.post(`${HOST_URL}/api/auth/login`, {
        email,
        password,
      });
      const data = response.data;
      // console.log(data);

      if (data.status) {
        const { token, user } = data.payload;

        await saveToStorage("token", token);
        await saveToStorage("user", JSON.stringify(user));

        setUser(user);
      }
      return data;
    } catch (error) {
      console.error("Login error:", error);
      return { payload: "Incorrect Email or Password", status: false };
    }
  }

  async function confirmEmail(email: string, code: string) {
    try {
      const response = await axios.post(`${HOST_URL}/api/users/verify-user`, {
        email,
        otp: code,
      });
      return response.data;
    } catch (error) {
      return {
        payload: "An error occurred while confirming email",
        status: false,
      };
    }
  }

  async function passwordResetRequest(email: string) {
    try {
      const response = await axios.post(`${HOST_URL}/api/auth/request-code`, {
        email,
      });
      return response.data;
    } catch (error) {
      return {
        payload: "An error occurred while requesting password reset",
        status: false,
      };
    }
  }

  async function resetPassword(email: string, code: string, password: string) {
    try {
      const response = await axios.put(`${HOST_URL}/api/auth/update-password`, {
        email,
        token: code,
        password,
      });
      return response.data;
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        payload: "An error occurred while resetting password",
        status: false,
      };
    }
  }

  async function getAuthenticatedUser() {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      const response = await axiosInstance.get("/auth/me");
      return response.data;
    } catch (error) {
      return {
        payload: "An error occurred while getting user",
        status: false,
      };
    }
  }

  async function signOut() {
    await removeFromStorage("token");
    await removeFromStorage("user");
    setInit(!init);
  }

  return {
    signUp,
    signIn,
    confirmEmail,
    passwordResetRequest,
    resetPassword,
    getAuthenticatedUser,
    signOut,
  };
};
