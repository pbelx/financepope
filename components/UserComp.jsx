import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Pressable,
  TouchableOpacity,
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

  const handleCardPress = (order) => {
    navigation.navigate("OrderDetailsUser", { order });
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
          orders.map((order) => (
            <TouchableOpacity 
              key={order.id}
              style={styles.card}
              onPress={() => handleCardPress(order)}
              activeOpacity={0.8}
            >
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
              
              <View style={styles.detailsRow}>
                <View style={styles.detailsColumn}>
                  <Text style={styles.detail}>
                    Sender: <Text style={{ fontWeight: "bold" }}>{order.senderName}</Text>
                  </Text>
                  <Text style={styles.detail}>
                    Receiver: <Text style={{ fontWeight: "bold" }}>{order.receiverName}</Text>
                  </Text>
                  <Text style={styles.detail}>
                    Bank: <Text style={{ fontWeight: "bold" }}>{order.bank}</Text>
                  </Text>
                </View>
                
                <View style={styles.rightColumn}>
                  <View style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </View>
                  <Text style={styles.date}>
                    {new Date(order.createdAt).toLocaleString()}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
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
    marginBottom: 8,
    color: "#2a52be",
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailsColumn: {
    flex: 1,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 60,
  },
  detail: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },
  viewButton: {
    backgroundColor: COLORS?.primary3 || "#e3f2fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewButtonText: {
    color: COLORS?.primary || "#2a52be",
    fontSize: 12,
    fontWeight: "600",
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