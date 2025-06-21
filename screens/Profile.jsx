import React, { useContext,useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Avatar, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { getStorageItem } from "../shared/constants";
import BtnSecondary from "../components/BtnSecondary";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  console.log(user);

  const handleEditProfile = () => {
    navigation.navigate("EditProfile"); // Create an EditProfile
  };

  // useEffect(() => {
  //   getLoggedInUser();
  // }, []);

  return (
    <View style={styles.container}>
      <Avatar.Image size={100} label="MB" />
      <Text style={styles.name}>{user.full_name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.phone}>{user.phone_number}</Text>
      <Text style={styles.phone}>{user.address}</Text>
      <Text style={styles.name}>Company Info</Text>
      <Text style={styles.email}>Email: johndoe@example.com</Text>
      <Text style={styles.phone}>Tel: +256 700 000 000</Text>
      {/* Buttons */}

      <View style={{ width: "80%" }}>
        <BtnSecondary onPress={()=>navigation.navigate("Login")} title="Logout" />
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: "gray",
    marginTop: 5,
  },
  phone: {
    fontSize: 16,
    color: "gray",
    marginTop: 5,
    marginBottom: 20,
  },
});
