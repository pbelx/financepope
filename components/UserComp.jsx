import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Pressable,
} from "react-native";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";
import { generateAxiosInstance } from "../shared/constants";
import AdminHome from "../components/AdminHome";
import { COLORS } from "../theme";
import { useNavigation } from "@react-navigation/native";

const statusColors = {
  pending: "#FFD700",
  completed: "#4CAF50",
  failed: "#F44336",
};



const UserComp = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      const res = await axiosInstance.post("/order/user-orders", {
        id: user?.id,
        type: user?.is_member ? "Member" : user?.is_admin ? "Admin" : "User",
      });
      if (res.data.status) {
        setOrders(res.data.payload);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };


  return (
    <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>

      <ScrollView
        style={{ paddingHorizontal: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >

        <View>

        </View>
        {/* <Text style={styles.greeting}>
          {user.is_member
            ? "."
            : user.is_admin
            ? "."
            : "."}
        </Text> */}
        
        {/* New Order Button */}
        {/* <Pressable 
          style={styles.newOrderButton} 
          onPress={() => navigation.navigate("RequestTransactionScreen")}
        >
          <Text style={styles.newOrderButtonText}>+ New Order</Text>
        </Pressable> */}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>Your Orders</Text>
          <Pressable 
            style={styles.newOrderButton} 
            onPress={() => navigation.navigate("RequestTransactionScreen")}
          >
            <Text style={styles.newOrderButtonText}>+ New Order</Text>
          </Pressable>
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#2a52be" style={{ marginTop: 30 }} />
        ) : orders.length === 0 ? (
          <Text style={styles.emptyText}>No orders found.</Text>
        ) : (
          orders.map((order) => <View style={styles.card} key={order.id}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Order #{order.id}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColors[order.status] || "#bbb" },
                ]}
              >
                <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.amount}>
              Amount: <Text style={{ fontWeight: "bold" }}>{order.amount}</Text>
            </Text>
            <Text style={styles.detail}>
              Sender: <Text style={{ fontWeight: "bold" }}>{order.senderName}</Text>
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <Text style={styles.detail}>
                  Receiver: <Text style={{ fontWeight: "bold" }}>{order.receiverName}</Text>
                </Text>
                <Text style={styles.detail}>
                  Bank: <Text style={{ fontWeight: "bold" }}>{order.bank}</Text>
                </Text>
              </View>
              {/* <View style={{ width: '40%' }}>
                <Pressable style={{ backgroundColor: COLORS.primary3, width: 50, borderRadius: 20, padding: 2, marginLeft: '70%' }} onPress={() => navigation.navigate("OrderDetails",{order})}>
                  <Text style={{ color: COLORS.primary, textAlign: 'center' }}>View</Text>
                </Pressable>
                <Text style={styles.date}>
                  {new Date(order.createdAt).toLocaleString()}
                </Text>
              </View> */}
            </View>

          </View>)
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 10,
    color: "#222",
  },
  newOrderButton: {
    backgroundColor: "#2a52be",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2a52be",
    marginTop: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 10,
  },
  amount: {
    fontSize: 16,
    marginBottom: 4,
    color: "#2a52be",
  },
  detail: {
    fontSize: 14,
    color: "#444",
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: "#888",
    marginTop: 8,
    textAlign: "right",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
    fontSize: 16,
  },
});

export default UserComp;