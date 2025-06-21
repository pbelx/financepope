import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Picker, Pressable, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Card, Avatar, IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BtnPrimary from "../components/BtnPrimary";
import BtnSecondary from "../components/BtnSecondary";
import gstyles from "../styles";
import { COLORS } from "../theme";
import AntDesign from '@expo/vector-icons/AntDesign';

const AllOrders = () => {
  const [transactions, setTransactions] = useState([]);
  const navigation = useNavigation();
  useEffect(() => {
    setTransactions([
      { id: 1, user: "Omeny Robert", sender: "John Doe", receiver: "Jane Smith", amount: "$100", status: "Pending" },
      { id: 2, user: "Akao Teddy", sender: "Alice Brown", receiver: "Bob White", amount: "$2,500", status: "Completed" },
      { id: 3, user: "Omeny Robert", sender: "John Doe", receiver: "Jane Smith", amount: "$100", status: "Pending" },

    ]);
  }, []);

  return (
    <View style={{ backgroundColor: COLORS.primary2, padding: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Pressable onPress={() => navigation.navigate("Home")} style={{ padding: 5 }}>
            <AntDesign name="arrowleft" size={32} color="black" />
          </Pressable>
        </View>
        <View style={{ marginRight: 10 }}>
          <Text style={gstyles.gtitle}>Transaction</Text>

        </View>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => navigation.navigate("TransactionDetailsScreen", { transaction: item })}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>

                <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{item.sender}</Text>
                <Text style={{ color: COLORS.gray }}>Sender</Text>
              </View>

              <View>

                <Text style={{ fontWeight: 'bold', fontSize: 17 }}>{item.receiver}</Text>
                <Text style={{ color: COLORS.gray }}>Receiver</Text>
              </View>

            </View>
            <View style={{ flexDirection: 'row', marginTop: 15, paddingTop: 15, borderTopColor: '#e1e1e1', borderTopWidth: 1, justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row' }}>
                <Avatar.Text size={40} label={item.sender[0]} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ color: COLORS.gray, fontSize: 16 }}>{item.user}</Text>
                  <Text>12-10-2025</Text>
                </View>

              </View>
              <View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontWeight: 'bold', color: COLORS.primary, fontSize: 17 }}>{item.amount}</Text>
                  <Ionicons name="arrow-forward-sharp" style={{ marginLeft: 5 }} size={24} color="black" />
                </View>
                <Text style={{ fontSize: 12, color: 'orange' }}>Pending</Text>
              </View>

            </View>





          </Card>
        )}
      />
    </View>

  );
};

export default AllOrders

const styles = StyleSheet.create({

  card: {
    margin: 10,
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#fff'
  },
  detailsContainer: {
    padding: 16,
    flex: 1,
  },
  detailsCard: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  amount: {
    fontSize: 22,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
});