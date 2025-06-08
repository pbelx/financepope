import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Platform-agnostic storage utility
const setStorageItem = async (key, value) => {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getStorageItem = async (key) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const removeStorageItem = async (key) => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

// Live server URL
export const HOST_URL = "https://finance.flflstore.com";
// export const HOST_URL = "http://192.168.102.234:3001";
// export const HOST_URL = "http://192.168.100.5:3001";
//  export const HOST_URL = "http://192.168.100.20:3001";
export const UPLOADS_URL = HOST_URL + "/useruploads/";
export const IMAGE_PLACEHOLDER =
  "https://placehold.jp/3d4070/ffffff/150x150.png?text=No%20Image";
export const generateAxiosInstance = async (
  authenticated = true,
  authToken = null
) => {
  if (authenticated) {
    const token = authToken || (await getStorageItem("token"));
    // console.log("Token used:", token);
    const axiosInstance = axios.create({
      baseURL: HOST_URL + "/api",
    });

    const requestHandler = (request) => {
      request.headers.Authorization = `Bearer ${token}`;
      return request;
    };

    const errorHandler = (error) => Promise.reject(error);

    axiosInstance.interceptors.request.use(
      (request) => requestHandler(request),
      (error) => errorHandler(error)
    );

    return axiosInstance;
  }
  return axios.create({
    baseURL: HOST_URL + "/api",
  });
};
