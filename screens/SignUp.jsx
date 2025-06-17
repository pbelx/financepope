import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import styles from "../styles";
import { Ionicons } from "@expo/vector-icons";
import AuthHeader from "../components/AuthHeader";
import BtnPrimary from "../components/BtnPrimary";
import { generateAxiosInstance } from "../shared/constants";
// import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/auth";

const SignUp = ({ navigation }) => {
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [full_name, setFull_name] = useState("");
  const [phone_number, setPhone_number] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState(true);
  const handleSignUp = async () => {
    try {
      setLoading(true);
      const response = await signUp(
        full_name,
        email,
        password,
        phone_number,
        address
      );

      setLoading(false);

      if (response.status) {
        // navigation.navigate("Home", {
        //   email: email,
        // });
        navigation.navigate("Login");
      } else {
        alert(response.payload);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: "#fff" }}>
      <AuthHeader />
      <View style={{ padding: 20 }}>
        <Text style={styles.pageTitle}>SignUp</Text>

        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Full Name"
          onChangeText={(text) => setFull_name(text)}
          value={full_name}
        />

        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Phone Number"
          onChangeText={(text) => setPhone_number(text)}
          value={phone_number}
        />

        <Text style={styles.inputLabel}>Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Address"
          onChangeText={(text) => setAddress(text)}
          value={address}
        />

        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Enter Email"
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.inputLabel}>Password</Text>
          {type ? (
            <Ionicons
              onPress={() => setType(!type)}
              name="eye-off"
              size={24}
              color="black"
            />
          ) : (
            <Ionicons
              onPress={() => setType(!type)}
              name="eye"
              size={24}
              color="black"
            />
          )}
        </View>
        <TextInput
          secureTextEntry={type}
          style={styles.input}
          placeholder="Enter Password"
          onChangeText={(text) => setPassword(text)}
          value={password}
        />

        <BtnPrimary
          title="Sign up"
          loading={loading}
          spinnerColor="#fff"
          onPress={handleSignUp}
        />

        <View style={{ display: "flex", marginTop: 20, flexDirection: "row" }}>
          <Pressable>
            <Text style={styles.textp}>Already Have An Account?</Text>
          </Pressable>
          <Pressable
            style={{ marginLeft: 20 }}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.texts}>Login</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignUp;
