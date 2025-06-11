import React, { useState, useEffect, useContext, useRef } from "react";
// import { Ionicons } from "@expo/vector-icons";
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
  Modal,
  Alert,
  SafeAreaView,
  RefreshControl,
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

const statusColors = {
  pending: "#FFD700",
  completed: "#4CAF50",
  failed: "#F44336",
  approved: "#2196F3",
  cancelled: "#F44336",
};

const MemberComp = () => {
  const [orders, setorders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [places, setPlaces] = useState([]);
  const [allBanks, setAllBanks] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const navigation = useNavigation();
  const [componentLoading, setComponentLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useContext(AuthContext);
  const [balance, setBalance] = useState(0);

  // Helper function to get currency info by ID
  const getCurrencyInfo = (currencyId) => {
    if (!currencyId) return { name: "N/A", symbol: "", code: "" };
    const currency = currencies.find(
      (curr) => curr.id && curr.id.toString() === currencyId.toString()
    );
    return currency ? currency : { name: "N/A", symbol: "", code: "" };
  };

  // Helper function to get bank name by ID
  const getBankName = (bankId) => {
    if (!bankId) return "N/A";
    const bank = allBanks.find(
      (bank) => bank.id && bank.id.toString() === bankId.toString()
    );
    return bank ? bank.name : "N/A";
  };

  // Format currency helper function
  const formatCurrency = (amount, currencyId) => {
    if (!amount) return "0";
    const currency = getCurrencyInfo(currencyId);
    if (currency.code) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    }
    const formattedAmount = amount.toLocaleString();
    return `${formattedAmount} ${
      currency.symbol || currency.code || currency.name
    }`;
  };

  // Fetch all required data on component mount
  const fetchAllData = async () => {
    try {
      setComponentLoading(true);
      await Promise.all([fetchPlacesData(), fetchCurrencies()]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setComponentLoading(false);
    }
  };

  // Fetch currencies
  const fetchCurrencies = async () => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      const response = await axiosInstance.get("/currency/all");
      const data = response.data;

      if (data.status && data.payload) {
        setCurrencies(data.payload);
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  // Fetch places and extract banks
  const fetchPlacesData = async () => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      const response = await axiosInstance.get("/places");
      const data = response.data;

      if (data.status && data.payload) {
        setPlaces(data.payload);

        // Extract all banks from all places
        const banksFromPlaces = [];
        data.payload.forEach((place) => {
          if (place.banks && place.banks.length > 0) {
            place.banks.forEach((bank) => {
              if (!banksFromPlaces.find((b) => b.id === bank.id)) {
                banksFromPlaces.push({
                  ...bank,
                  placeName: place.name,
                });
              }
            });
          }
        });
        setAllBanks(banksFromPlaces);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  const fetchorders = async () => {
    try {
      setComponentLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      let res = await axiosInstance.get("/order/all");
      if (res.data.status) {
        setorders(res.data.payload);

        const userOrders = res.data.payload.filter((order) => {
          const belongsToUser =
            order.user?.id === user?.id || order.member?.id === user?.id;
          const isPending = order.status === "pending";
          return belongsToUser && isPending;
        });

        setFilteredOrders(userOrders);
        setComponentLoading(false);
        setRefreshing(false);
      }
    } catch (error) {
      console.log(error);
      setComponentLoading(false);
      setRefreshing(false);
    }
  };

  const fetchbalance = async () => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      let res = await axiosInstance.post(`/collections/${user?.id}`);
      if (res.data.status) {
        setBalance(res.data.payload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchorders();
    // fetchbalance();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchorders();
    fetchbalance();
  };

  const handleCardPress = (order) => {
    navigation.navigate("OrderScreenMember", { order });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <ScrollView
        style={{ paddingHorizontal: 10 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: "#fff",
            padding: 15,
            borderRadius: 12,
            marginBottom: 15,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View>
              <Text style={[gstyles.gtitle, { color: COLORS.primary }]}>
                Member Portal
              </Text>
              <Text style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
                Welcome back, {user?.full_name}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              {/* <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 24,
                  color: COLORS.primary,
                }}
              >
                {balance?.toLocaleString()}
              </Text> */}
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 10,
                }}
                onPress={() => navigation.navigate("FloatScreen" ,{ userId:user?.id })}
              >
                <Ionicons name="cash" size={20} color={COLORS.primary} />
                <Text
                  style={{ color: COLORS.primary, fontSize: 16, marginLeft: 5 }}
                >
                  My Float
                </Text>
              </TouchableOpacity>

              <Text style={{ color: "#666", fontSize: 12 }}>Float</Text>
            </View>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <Text style={styles.sectionTitle}>My Pending Orders</Text>
          <Text style={{ color: COLORS.gray, fontSize: 14 }}>
            {filteredOrders.length} order
            {filteredOrders.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {componentLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="inbox" size={48} color={COLORS.gray} />
            <Text style={styles.emptyText}>No pending orders found</Text>
            <Text style={styles.emptySubText}>
              Orders assigned to you will appear here
            </Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
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
                  <Text style={styles.statusText}>
                    {order.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <Text style={styles.amount}>
                Amount:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {formatCurrency(order.amount, order.fromCurrency)}
                </Text>
              </Text>

              <View style={styles.detailsRow}>
                <View style={styles.detailsColumn}>
                  <Text style={styles.detail}>
                    Sender:{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      {order.senderName}
                    </Text>
                  </Text>
                  <Text style={styles.detail}>
                    Receiver:{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      {order.receiverName}
                    </Text>
                  </Text>
                  <Text style={styles.detail}>
                    Bank:{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      {getBankName(order.bank)}
                    </Text>
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
    </SafeAreaView>
  );
};

export default MemberComp;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2a52be",
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.gray,
    fontSize: 16,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    color: COLORS.gray,
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubText: {
    marginTop: 5,
    color: COLORS.gray,
    fontSize: 14,
    textAlign: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  detailsColumn: {
    flex: 1,
  },
  rightColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
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
});
