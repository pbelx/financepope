import React, { useContext, useEffect, useState } from "react";

import {
  View,
  Image,
  Text,
  Pressable,
  ScrollView,
  Share,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Header from "../components/Header";
// import { usePushNotifications } from "../context/usePushNotifications";

const Shop = ( ) => {


  return (
    <View style={{ flex: 1 }}>
      <Header />

      <View style={{ padding: 5, flex: 1 }}>
       <Text>Hello</Text>
      </View>
    </View>
  );
};

const styless = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },
  photo: {
    borderRadius: 30,
    height: 60,
    width: 60,
    objectFit: "cover",
  },
  text: {
    fontSize: 17,
    textAlign: "center",
    marginTop: 8,
    marginLeft: 10,
  },
});

export default Shop;
