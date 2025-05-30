import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Picker,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Card, Avatar, IconButton } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import BtnPrimary from "./BtnPrimary";
import BtnSecondary from "./BtnSecondary";
import gstyles from "../styles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { COLORS } from "../theme";
import { generateAxiosInstance } from "../shared/constants";
import { AuthContext } from "../context/AuthContext";

const MemberComp = () => {
  const [orders, setorders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [places, setPlaces] = useState([]); // Add places state to get bank data
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  // Function to get bank name by ID
  const getBankNameById = (bankId) => {
    if (!bankId || !places.length) return "N/A";

    // Search through all places to find the bank with matching ID
    for (const place of places) {
      const bank = place.banks?.find((b) => b.id == bankId);
      if (bank) {
        return bank.name;
      }
    }
    return `Bank ID: ${bankId}`; // Fallback if bank not found
  };

  // Fetch places to get bank data
  const fetchPlaces = async () => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      const res = await axiosInstance.get("/places");
      if (res.data.status) {
        setPlaces(res.data.payload);
      }
    } catch (error) {
      console.log("Error fetching places:", error);
    }
  };

  const fetchorders = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      let res = await axiosInstance.get("/order/all");
      // console.log("order", res.data.payload);
      if (res.data.status) {
        console.log("orders", res.data.payload);
        setorders(res.data.payload);

        // Filter orders for current user with pending status
        const userOrders = res.data.payload.filter((order) => {
          // Check if the order belongs to the current user (either as user or member)
          const belongsToUser =
            order.user?.id === user?.id || order.member?.id === user?.id;
          const isPending = order.status === "pending";
          return belongsToUser && isPending;
        });

        setFilteredOrders(userOrders);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces(); // Fetch places first to get bank data
    fetchorders();
  }, [user]);

  const [balance, setBalance] = useState(0);
  const fetchbalance = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      let res = await axiosInstance.post(`/collections/${user?.id}`);
      console.log("balance", res.data.payload);
      if (res.data.status) {
        // console.log("orders", res.data.payload);
        setBalance(res.data.payload);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchbalance();
  }, []);
  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  //update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      const res = await axiosInstance.put("/order/update", {
        id: orderId,
        status,
      });
      if (res.data.status) {
        // Update the orders state with the new status
        const updatedOrders = orders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        );
        setorders(updatedOrders);

        // Update the filtered orders state
        const updatedFilteredOrders = updatedOrders.filter((order) => {
          const belongsToUser =
            order.user?.id === user?.id || order.member?.id === user?.id;
          const isPending = order.status === "pending";
          return belongsToUser && isPending;
        });
        setFilteredOrders(updatedFilteredOrders);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={{ backgroundColor: "#fff", padding: 5 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text style={gstyles.gtitle}>Member Portal</Text>
        </View>
        <View>
          <Text
            style={{ fontWeight: "bold", fontSize: 28, color: COLORS.primary }}
          >
            {balance?.toLocaleString()}
          </Text>
          <Text>Available Balance</Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          marginTop: 10,
          justifyContent: "space-between",
        }}
      >
        <Pressable
          onPress={() => navigation.navigate("Balances")}
          style={styles.memberActions}
        >
          <View style={styles.iconBox}>
            <MaterialIcons
              name="attach-money"
              size={24}
              style={{ color: "#fff" }}
            />
          </View>
          <Text style={styles.actionText}>Balances</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Collections")}
          style={styles.memberActions}
        >
          <View style={styles.iconBox}>
            <FontAwesome6 name="money-bill-transfer" size={16} color="white" />
          </View>
          <Text style={styles.actionText}>Collections</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Distributed")}
          style={styles.memberActions}
        >
          <View style={styles.iconBox}>
            <MaterialIcons name="send-to-mobile" size={16} color="white" />
          </View>
          <Text style={styles.actionText}>Distributions</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Pressable
          onPress={() => navigation.navigate("Commissions")}
          style={styles.memberActions}
        >
          <View style={styles.iconBox}>
            <FontAwesome6 name="money-bill-trend-up" size={16} color="white" />
          </View>
          <Text style={styles.actionText}>Commissions</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("CompletedOrder")}
          style={styles.memberActions}
        >
          <View style={styles.iconBox}>
            <MaterialIcons
              name="check-circle"
              size={16}
              style={{ color: "#fff" }}
            />
          </View>
          <Text style={styles.actionText}>Completed</Text>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Reports")}
          style={styles.memberActions}
        >
          <View style={styles.iconBox}>
            <MaterialIcons
              name="auto-graph"
              size={16}
              style={{ color: "#fff" }}
            />
          </View>
          <Text style={styles.actionText}>Reports</Text>
        </Pressable>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
        }}
      >
        <Text style={gstyles.gtitle}>My Pending Orders</Text>
        <Text style={{ color: COLORS.gray, fontSize: 14 }}>
          {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {loading ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 50,
          }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: COLORS.gray }}>
            Loading orders...
          </Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginTop: 50,
          }}
        >
          <MaterialIcons name="inbox" size={48} color={COLORS.gray} />
          <Text style={{ marginTop: 10, color: COLORS.gray, fontSize: 16 }}>
            No pending orders found
          </Text>
        </View>
      ) : (
        filteredOrders.map((item) => {
          return (
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              key={item.id}
            >
              <View style={styles.card}>
                <View style={{ flexDirection: "row" }}>
                  <View style={{ width: 40, padding: 5 }}>
                    <Text style={{ fontWeight: "bold", marginTop: 10 }}>
                      #{item?.id}
                    </Text>
                  </View>
                  <View style={{ width: 100, padding: 5 }}>
                    <Text style={{ fontWeight: "bold", marginTop: 10 }}>
                      {formatDate(item?.createdAt)}
                    </Text>
                  </View>
                  <View style={{ width: 100, padding: 5 }}>
                    <Text style={{ fontWeight: "bold", marginTop: 10 }}>
                      ${item?.amount?.toLocaleString()}
                    </Text>
                  </View>
                  <View style={{ width: 120, padding: 5 }}>
                    <Text style={{ fontWeight: "bold" }}>
                      {item?.senderName}
                    </Text>
                    <Text style={{ color: COLORS.gray }}>From</Text>
                  </View>
                  <View style={{ width: 150, padding: 5 }}>
                    <Text style={{ fontWeight: "bold" }}>
                      {item?.senderPhone}
                    </Text>
                    <Text style={{ color: COLORS.gray }}>From Phone</Text>
                  </View>
                  <View style={{ width: 120, padding: 5 }}>
                    <Text style={{ fontWeight: "bold" }}>
                      {item?.receiverName}
                    </Text>
                    <Text style={{ color: COLORS.gray }}>Receiver</Text>
                  </View>
                  <View style={{ width: 150, padding: 5 }}>
                    <Text style={{ fontWeight: "bold" }}>
                      {item?.receiverPhone}
                    </Text>
                    <Text style={{ color: COLORS.gray }}>Receiver Phone</Text>
                  </View>
                  <View style={{ width: 180, padding: 5 }}>
                    <Text style={{ fontWeight: "bold" }}>
                      {item?.receiverAddress}
                    </Text>
                    <Text style={{ color: COLORS.gray }}>Receiver Address</Text>
                  </View>
                  <View style={{ width: 150, padding: 5 }}>
                    <Text style={{ fontWeight: "bold" }}>
                      {getBankNameById(item?.bank)}
                    </Text>
                    <Text style={{ color: COLORS.gray }}>Receiver Bank</Text>
                  </View>
                  <View
                    style={{
                      width: 100,
                      padding: 5,
                      flexDirection: "row",
                      flexWrap: "wrap",
                    }}
                  >
                    <Pressable
                      style={styles.changeStatus}
                      onPress={() => updateOrderStatus(item.id, "completed")}
                    >
                      <Text style={{ fontSize: 15, color: "green" }}>
                        Complete
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable>
                    <View style={{ width: 50, padding: 5 }}>
                      <Text style={{ color: COLORS.gray }}>Copy</Text>
                    </View>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          );
        })
      )}
    </View>
  );
};

export default MemberComp;

const styles = StyleSheet.create({
  card: {
    margin: 5,
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#f5f5f5",
    width: 1300,
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  iconBox: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    marginLeft: "30%",
  },
  actionText: {
    color: COLORS.primary,
    textAlign: "center",
    fontSize: 12,
  },
  memberActions: {
    backgroundColor: COLORS.primary3,
    width: "30%",
    paddingHorizontal: 8,
    paddingVertical: 15,
    margin: 5,
    borderRadius: 10,
  },
  changeStatus: {
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: COLORS.primary3,
    paddingVertical: 2,
    margin: 1,
  },
  memberActions2: {
    backgroundColor: COLORS.primary,
    width: "30%",
    padding: 10,
    margin: 5,
    borderRadius: 10,
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
