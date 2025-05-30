import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "../styles";
import Places from "../components/Places";
import Currency from "../components/Currency";
import Banks from "../components/Banks";
import { COLORS } from "../theme";

const Settings = ({ navigation }) => {
  const [places, setPlaces] = useState(true);
  const [currency, setCurrency] = useState(false);
  const [bank, setBank] = useState(false);

  const showPlaces = () => {
    setPlaces(true);
    setCurrency(false);
    setBank(false);
  };

  const showCurrency = () => {
    setPlaces(false);
    setCurrency(true);
    setBank(false);
  };

  const showBank = () => {
    setPlaces(false);
    setCurrency(false);
    setBank(true);
  };

  return (
    <View
      style={{
        padding: 20,
        backgroundColor: "#fff",
      }}
    >
      <View style={{ display: "flex", flexDirection: "row" }}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-sharp" size={32} color="black" />
        </Pressable>
        <View style={{ marginLeft: 100 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>Settings</Text>
        </View>
      </View>

      <ScrollView style={{ marginTop: 2 }}>
        <View style={{ flexDirection: "row" }}>
          <Pressable
            onPress={showPlaces}
            style={[cstyles.nav, places && cstyles.activeNav]} // Apply activeNav only when places is true
          >
            <Text style={[cstyles.textNav, places && cstyles.activeTextNav]}>
              Places
            </Text>
          </Pressable>

          <Pressable
            onPress={showCurrency}
            style={[cstyles.nav, currency && cstyles.activeNav]} // Apply activeNav only when currency is true
          >
            <Text style={[cstyles.textNav, currency && cstyles.activeTextNav]}>
              Currency
            </Text>
          </Pressable>

          <Pressable
            onPress={showBank}
            style={[cstyles.nav, bank && cstyles.activeNav]} // Apply activeNav only when bank is true
          >
            <Text style={[cstyles.textNav, bank && cstyles.activeTextNav]}>
              Banks
            </Text>
          </Pressable>
        </View>
        {places && <Places />}
        {currency && <Currency />}
        {bank && <Banks />}

        <View style={{ height: 50 }}></View>
      </ScrollView>
    </View>
  );
};

export default Settings;

const cstyles = StyleSheet.create({
  textNav: {
    fontWeight: "bold",
    color: "#616161",
    textAlign: "center",
  },
  nav: {
    borderWidth: 1,
    borderColor: "#e1e1e1",
    padding: 5,
    width: "33%",
  },
  activeTextNav: {
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  activeNav: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 5,
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: COLORS.primary,
    width: "33%",
    textAlign: "center",
  },
});
