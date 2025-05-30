import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Pressable,
  Alert,
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
  processing: "#FF9800",
  cancelled: "#9E9E9E",
};

const AdminAssignPage = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  
  // State variables
  const [orders, setOrders] = useState([]);
  const [places, setPlaces] = useState([]);
  const [allBanks, setAllBanks] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Fetch all required data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchOrders(),
        fetchPlaces(),
        fetchCurrencies(),
        fetchMembers(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      Alert.alert("Error", "Failed to load data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      const res = await axiosInstance.get("/order/all");
      if (res.data.status) {
        setOrders(res.data.payload);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      throw error;
    }
  };

  // Fetch places and extract banks
  const fetchPlaces = async () => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      const response = await axiosInstance.get("/places");
      const data = response.data;

      if (data.status && data.payload) {
        setPlaces(data.payload);
        
        // Extract all banks from all places
        const banksFromPlaces = [];
        data.payload.forEach(place => {
          if (place.banks && place.banks.length > 0) {
            place.banks.forEach(bank => {
              // Only add if not already in the array (avoid duplicates)
              if (!banksFromPlaces.find(b => b.id === bank.id)) {
                banksFromPlaces.push({
                  ...bank,
                  placeName: place.name // Add place name for context if needed
                });
              }
            });
          }
        });
        setAllBanks(banksFromPlaces);
      } else {
        console.error("Failed to fetch places");
        throw new Error("Failed to fetch places");
      }
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
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
      } else {
        console.error("Failed to fetch currencies");
        throw new Error("Failed to fetch currencies");
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
      throw error;
    }
  };

  // Fetch members from API
  const fetchMembers = async () => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      const response = await axiosInstance.get("/users/members");
      const data = response.data;

      if (data.status && data.payload) {
        setMembers(data.payload);
      } else {
        console.error("Failed to fetch members");
        throw new Error("Failed to fetch members");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      throw error;
    }
  };

  // Helper function to get bank name by ID
  const getBankName = (bankId) => {
    if (!bankId) return 'N/A';
    const bank = allBanks.find(bank => bank.id && bank.id.toString() === bankId.toString());
    return bank ? bank.name : `Bank ID: ${bankId}`;
  };

  // Helper function to get currency info by ID
  const getCurrencyInfo = (currencyId) => {
    if (!currencyId) return { name: 'N/A', symbol: '', code: '' };
    const currency = currencies.find(curr => curr.id && curr.id.toString() === currencyId.toString());
    return currency ? currency : { name: `Currency ID: ${currencyId}`, symbol: '', code: '' };
  };

  // Helper function to get place name by ID
  const getPlaceName = (placeId) => {
    if (!placeId) return 'N/A';
    const place = places.find(place => place.id && place.id.toString() === placeId.toString());
    return place ? place.name : `Place ID: ${placeId}`;
  };

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchAllData();
  };

  // Get enhanced order data with related information
  const getEnhancedOrder = (order) => {
    return {
      ...order,
      bankName: getBankName(order.bankId || order.bank),
      currencyInfo: getCurrencyInfo(order.currencyId),
      placeName: getPlaceName(order.placeId),
    };
  };

  return (
    <View style={styles.container}>
  
      
      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {user && (
          <Text style={styles.greeting}>
            Welcome, {user.name || 'Admin'}!
          </Text>
        )}
        
        <Text style={styles.sectionTitle}>All Orders</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2a52be" />
            <Text style={styles.loadingText}>Loading orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <Text style={styles.emptyText}>No orders found.</Text>
        ) : (
          orders.map((order) => {
            const enhancedOrder = getEnhancedOrder(order);
            
            return (
              <View style={styles.card} key={order.id}>
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
                  Amount: <Text style={styles.boldText}>
                    {enhancedOrder.currencyInfo.symbol}{order.amount} {enhancedOrder.currencyInfo.code}
                  </Text>
                </Text>
                
                <Text style={styles.detail}>
                  Sender: <Text style={styles.boldText}>{order.senderName}</Text>
                </Text>

                <View style={styles.orderDetailsRow}>
                  <View style={styles.leftColumn}>
                    <Text style={styles.detail}>
                      Receiver: <Text style={styles.boldText}>{order.receiverName}</Text>
                    </Text>
                    <Text style={styles.detail}>
                      Bank: <Text style={styles.boldText}>{enhancedOrder.bankName}</Text>
                    </Text>
                    {enhancedOrder.placeName !== 'N/A' && (
                      <Text style={styles.detail}>
                        Place: <Text style={styles.boldText}>{enhancedOrder.placeName}</Text>
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.rightColumn}>
                    <Pressable 
                      style={styles.viewButton} 
                      onPress={() => navigation.navigate("OrderDetails", { order: enhancedOrder })}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                    </Pressable>
                    <Text style={styles.date}>
                      {new Date(order.createdAt).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  scrollContainer: {
    paddingHorizontal: 10,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 10,
    color: "#222",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2a52be",
    marginTop: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 14,
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
  boldText: {
    fontWeight: "bold",
  },
  orderDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    width: '40%',
    alignItems: 'flex-end',
  },
  viewButton: {
    backgroundColor: COLORS.primary3,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  viewButtonText: {
    color: COLORS.primary,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: "#888",
    textAlign: "right",
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
    fontSize: 16,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default AdminAssignPage;