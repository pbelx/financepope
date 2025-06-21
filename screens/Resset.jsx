// @ts-check
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  ImageBackground,
  TextInput,
  ActivityIndicator,
} from "react-native";
import styles from "../styles";
import { Ionicons } from "@expo/vector-icons";
import AuthHeader from "../components/AuthHeader";
import BtnPrimary from "../components/BtnPrimary";

const Resset = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleRequestCode = async () => {
    
  };

  const handleChangePassword = async () => {
 
  };

  return (
    <ScrollView>
      <AuthHeader />

      <View style={{ padding: 20, marginTop: 50 }}>
        <Text style={styles.pageTitle}>Resset Password</Text>
        {emailSent ? (
          <>
            <Text style={styles.inputLabel}>Code</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Code"
              value={code}
              onChangeText={(text) => setCode(text)}
            />

            <Text style={styles.inputLabel}>New Password</Text>
            <TextInput
              secureTextEntry={true}
              style={styles.input}
              placeholder="Enter New Password"
              value={password}
              onChangeText={(text) => setPassword(text)}
            />
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              secureTextEntry={true}
              style={styles.input}
              placeholder="Enter Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => setConfirmPassword(text)}
            />
            <BtnPrimary
              title="Request Code"
              loading={passwordLoading}
              spinnerColor="#fff"
              onPress={handleChangePassword}
            />
          </>
        ) : (
          <>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Email"
              value={email}
              onChangeText={(text) => setEmail(text)}
            />
            <BtnPrimary
              title="Request Code"
              loading={emailLoading}
              spinnerColor="#fff"
              onPress={handleRequestCode}
            />
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default Resset;
