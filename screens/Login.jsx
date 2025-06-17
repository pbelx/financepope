import React, { useContext, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import styles from "../styles";
import { Ionicons } from "@expo/vector-icons";
import AuthHeader from "../components/AuthHeader";
import BtnPrimary from "../components/BtnPrimary";
import { generateAxiosInstance } from "../shared/constants";
import { useAuth } from "../hooks/auth";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();

  const [type, setType] = useState(true);
  async function handleLogin() {
    console.log("handleLogin");
    if (email && password) {
      setLoading(true)
      const response = await signIn(email, password);
      console.log(response);
      if (response.status) {
        setLoading(false)
        navigation.navigate("Home");
      } else {
        alert(response.payload);
        setLoading(false)
      }
    }
  }


  return (
    <ScrollView style={{ backgroundColor: "#fff" }}>
      <AuthHeader />

      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold" }}>Login</Text>

        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Email"
          onChangeText={(text) => setEmail(text)}
          value={email}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.inputLabel}>Password</Text>

          {type ? (
            <Ionicons
              onPress={() => setType(!type)}
              name="eye-off" style={{ marginTop: 20 }}
              size={24}
              color="black"
            />
          ) : (
            <Ionicons
              onPress={() => setType(!type)}
              name="eye"
              style={{ marginTop: 20 }}
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
          title="Login"
          onPress={handleLogin}
          loading={loading}
          spinnerColor="#fff"
        />

        <View
          style={{
            display: "flex",
            marginTop: 20,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Pressable onPress={() => navigation.navigate("Resset")}>
            <Text style={styles.textp}>Forgot Password ?</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.texts}>SignUp</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

export default Login;
