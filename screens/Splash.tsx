import { useState, useEffect } from "react";
import styles from "../styles";
import {
  Pressable,
  Text,
  View,
  Image,
  ActivityIndicator,
  ImageBackground,
} from "react-native";

export const LoadingSplash = () => (
  <View style={styles.bgoverlay}>
    <View style={styles.spaceview}></View>
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <Text>Loading...</Text>
    </View>

    <ActivityIndicator size="large" style={{ marginTop: 200 }} color="white" />
  </View>
);
