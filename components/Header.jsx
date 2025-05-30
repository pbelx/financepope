import React, { useContext, useEffect, useState } from "react";
import styles from "../styles";
import {
  View,
  TextInput,
  Text,
  Button,
  Image,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";
import {
  Feather,
  FontAwesome5,
  Entypo,
  Ionicons,
  FontAwesome,
  MaterialIcons,
  AntDesign,
} from "@expo/vector-icons";

import { Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../theme";

const Header = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState(0);

  const [modaldrawer, setmodaldrawer] = useState(false);


  const openmodaldrawer = () => {
    setmodaldrawer(true);
  };

  const closemodaldrawer = () => {
    setmodaldrawer(false);
  };

  const vheight = Dimensions.get("window").height * 0.85;

  return (
    <>
      {modaldrawer ? (
        <View
          style={{
            flexDirection: "row",
            position: "absolute",
            zIndex: 999,
            top: 0,
            right: 0,
            left: 0,
            // height: "100%",
            width: "100%",
          }}
        >
          <View
            style={{
              width: "70%",
              borderRadius: 7,
              borderColor: "#e1e1e1",
              borderWidth: 1,
              backgroundColor: "#fff",
              padding: 25,
            }}
          >
            <Pressable
              onPress={closemodaldrawer}
              style={{ marginLeft: "80%", marginTop: -20, padding: 5 }}
            >
              <Text style={{ fontSize: 22 }}>X</Text>
            </Pressable>

            <ScrollView style={{ height: vheight }}>


              <Pressable
                onPress={() => navigation.navigate("Users")}
                style={{ padding: 5, margin: 5, flexDirection: "row" }}
              >
                <AntDesign name="user" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 20 }}>Users</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("Members")}
                style={{ padding: 5, margin: 5, flexDirection: "row" }}
              >
                <AntDesign name="user" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 20 }}>Members</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("Settings")}
                style={{ padding: 5, margin: 5, flexDirection: "row" }}
              >
                <AntDesign name="setting" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 20 }}>Settings</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("Messages")}
                style={{ padding: 5, margin: 5, flexDirection: "row" }}
              >
                <AntDesign name="message1" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 20 }}>Messages</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("AllOrders")}
                style={{ padding: 5, margin: 5, flexDirection: "row" }}
              >
                <Ionicons name="gift-outline" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 20 }}>All Orders</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("Collected")}
                style={{ padding: 5, margin: 5, flexDirection: "row" }}
              >
                <MaterialIcons name="collections" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 20 }}>Collected</Text>
              </Pressable>


              <Pressable
                onPress={() => navigation.navigate("Admin")}
                style={{ padding: 5, margin: 5, flexDirection: "row" }}
              >
                <MaterialIcons name="dashboard" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 20 }}>Admin</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("Balances")}
                style={{ padding: 5, margin: 5, flexDirection: "row" }}
              >
                <MaterialIcons name="money-off" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 20 }}>Balances</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("Commissions")}
                style={{ padding: 5, margin: 5, flexDirection: "row" }}
              >
                <MaterialIcons name="money" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 20 }}>Commissions</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("AdminPendingOrder")}
                style={{ padding: 5, margin: 5, flexDirection: "row" }}
              >
                <MaterialIcons name="airplay" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 20 }}>Pending Orders</Text>
              </Pressable>

              <Pressable
                onPress={() => navigation.navigate("CompletedOrderAdmin")}
                style={{ padding: 5, margin: 5, flexDirection: "row" }}
              >
                <MaterialIcons name="check" size={20} color="black" />
                <Text style={{ fontSize: 16, marginLeft: 20 }}>Completed Order</Text>
              </Pressable>
            </ScrollView>
          </View>

          <View style={{ width: "40%" }} onPress={closemodaldrawer}></View>
        </View>
      ) : null}
      <View style={{ backgroundColor: COLORS.primary, padding: 5 }}>
        <View
          style={{
            flexDirection: "row",
            display: "flex",
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: Platform.OS === "ios" ? 35 : 20,
            paddingBottom: 20,
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: "row", width:'90%' }}>
              <Pressable style={{}} onPress={openmodaldrawer}>
                <Ionicons name="menu" size={32} color="white" />
              </Pressable>

              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  marginLeft: 0, marginLeft: 20,
                  color: "#fff",
                  fontFamily: "Gilroy-Bold",
                }}
              >
                Finance
              </Text>
            </View>
            <View>
              <MaterialIcons name="notifications-none" size={32} color="white" />
            </View>

          </View>

        </View>

      </View>
    </>
  );
};

export default Header;
