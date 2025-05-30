import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import styles from "../styles";
import BtnPrimary from "../components/BtnPrimary";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { generateAxiosInstance } from "../shared/constants";
const Messages = () => {
  const navigation = useNavigation();

  const [messages, setmessages] = useState([]);

  const fetchmessages = async () => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      let res = await axiosInstance.get("/messages");
      if (res.data.status) {
        console.log("messages", res.data.payload);
        setmessages(res.data.payload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchmessages();
  }, []);
  return (
    <View style={{ padding: 20 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Pressable
          onPress={() => navigation.navigate("Home")}
          style={{ padding: 5 }}
        >
          <AntDesign name="arrowleft" size={32} color="black" />
        </Pressable>
        <Text style={styles.gtitle}>Messages</Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          marginTop: 20,
          backgroundColor: "#e1e1e1",
        }}
      >
        <View style={{ width: "80%", padding: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Messages</Text>
        </View>
        <View style={{ width: "20%", padding: 10, marginLeft: 10 }}>
          <Text>Action</Text>
        </View>
      </View>
      {messages.map((message) => {
        return (
          <View
            style={{
              borderBottomWidth: 1,
              padding: 10,
              borderBottomColor: "#e1e1e1",
            }}
          >
            <Text>{message.message}</Text>
          </View>
        );
      })}
    </View>
  );
};
export default Messages;
