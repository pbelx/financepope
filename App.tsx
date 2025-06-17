import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import Navigation from "./Navigation"; // Assuming Navigation.js is where you define your navigation
import { StatusBar } from "react-native";
import * as Linking from "expo-linking";
import * as Font from "expo-font";
import { useEffect, useState } from "react";
import { AuthProvider } from "./context/AuthContext";

const linking = {
  prefixes: ["FLFL://", Linking.createURL("/"), "https://app.flflstore.com/#"],
  config: {
    screens: {
      Home: "home",
      // productDetails: "productDetails:id",
    },
  },
};

export default function App() {
  return (
    <>
      <AuthProvider>
        <StatusBar backgroundColor="#0033A1" barStyle="light-content" />
        <NavigationContainer linking={linking}>
          <Navigation />
        </NavigationContainer>
      </AuthProvider>
    </>
  );
}
