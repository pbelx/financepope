import React, { createContext, useContext, useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../hooks/auth";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import { LoadingSplash } from "../screens/Splash";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [init, setInit] = useState(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        setIsLoading,
        token,
        setToken,
        isAuthenticated,
        setIsAuthenticated,
        init,
        setInit,
      }}
    >
      <AuthLoader>{children}</AuthLoader>
    </AuthContext.Provider>
  );
}

const AuthLoader = ({ children }) => {
  const {
    isLoading,
    token,
    setToken,
    setIsLoading,
    init,
    setUser,
    setIsAuthenticated,
    isAuthenticated,
  } = useContext(AuthContext);
  const { getAuthenticatedUser } = useAuth();

  // Load Token from SecureStore (mobile) or localStorage (web)
  useEffect(() => {
    async function setup() {
      setIsLoading(true);
      try {
        let authToken = null;

        if (Platform.OS === "web") {
          authToken = localStorage.getItem("token");
        } else {
          authToken = await SecureStore.getItemAsync("token");
        }

        if (authToken) {
          setToken(authToken);
        } else {
          setToken(false);
        }
      } catch (error) {
        console.error("Error loading token:", error);
        setToken(false);
      }
    }
    setup();
  }, [init]);

  async function getUser() {
    const response = await getAuthenticatedUser();
    if (response.status) {
      setUser(response.payload);
    }
  }

  useEffect(() => {
    async function setup() {
      if (token) {
        await getUser();
        setIsAuthenticated(true);
      } else if (token === false) {
        setIsAuthenticated(false);
      }
    }
    setup();
  }, [token]);

  useEffect(() => {
    if (isAuthenticated !== null) {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Load User from SecureStore (mobile) or localStorage (web)
  useEffect(() => {
    const getUser = async () => {
      try {
        let _user = null;

        if (Platform.OS === "web") {
          _user = localStorage.getItem("user");
        } else {
          _user = await SecureStore.getItemAsync("user");
        }

        if (_user) {
          setUser(JSON.parse(_user));
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    getUser();
  }, []);

  return (
    <>
      {!isLoading && children}
      {isLoading && <LoadingSplash />}
    </>
  );
};
