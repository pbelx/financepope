import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
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

const OrderScreenMember = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params;
  const { user } = useContext(AuthContext);

  // State for lookup data
  const [places, setPlaces] = useState([]);
  const [allBanks, setAllBanks] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch all required data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchPlaces(), fetchCurrencies()]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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
  const fetchPlaces = async () => {
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

  // Helper function to get bank name by ID
  const getBankName = (bankId) => {
    if (!bankId) return "N/A";
    const bank = allBanks.find(
      (bank) => bank.id && bank.id.toString() === bankId.toString()
    );
    return bank ? bank.name : "N/A";
  };

  // Helper function to get place name by ID
  const getPlaceName = (placeId) => {
    if (!placeId) return "N/A";
    const place = places.find(
      (place) => place.id && place.id.toString() === placeId.toString()
    );
    return place ? place.name : "N/A";
  };

  // Helper function to get currency info by ID
  const getCurrencyInfo = (currencyId) => {
    if (!currencyId) return { name: "N/A", symbol: "", code: "" };
    const currency = currencies.find(
      (curr) => curr.id && curr.id.toString() === currencyId.toString()
    );
    return currency ? currency : { name: "N/A", symbol: "", code: "" };
  };

  // Format currency with symbol/code
  const formatCurrencyDisplay = (currencyId) => {
    const currency = getCurrencyInfo(currencyId);
    if (currency.symbol) {
      return `${currency.name} (${currency.symbol})`;
    } else if (currency.code) {
      return `${currency.name} (${currency.code})`;
    }
    return currency.name;
  };

  // Enhanced conversion calculation using actual rates
  const calculateConversion = (amount, fromCurrencyId, toCurrencyId) => {
    const fromCurrency = getCurrencyInfo(fromCurrencyId);
    const toCurrency = getCurrencyInfo(toCurrencyId);

    if (!fromCurrency.rate_per_dollar || !toCurrency.rate_per_dollar) {
      return "Rate not available";
    }

    // Convert to USD first, then to target currency
    const usdAmount = amount / fromCurrency.rate_per_dollar;
    const convertedAmount = usdAmount * toCurrency.rate_per_dollar;

    return `${convertedAmount.toFixed(2)} ${
      toCurrency.symbol || toCurrency.code || toCurrency.name
    }`;
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

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdating(true);
      const axiosInstance = await generateAxiosInstance(true);
      const res = await axiosInstance.put("/order/update", {
        id: orderId,
        status,
      });
      if (res.data.status) {
        Alert.alert(
          "Success",
          `Order ${status} successfully`,
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const showUpdateConfirmation = (status) => {
    const statusText = status === "completed" ? "complete" : status;
    Alert.alert(
      "Confirm Action",
      `Are you sure you want to ${statusText} this order?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => updateOrderStatus(order.id, status),
        },
      ]
    );
  };

  const DetailRow = ({ label, value, isHighlight = false }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={[styles.detailValue, isHighlight && styles.highlightValue]}>
        {value || "N/A"}
      </Text>
    </View>
  );

  const SectionHeader = ({ title }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.primary || "#2a52be"}
          />
          <Text style={styles.loadingText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Order Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.orderNumber}>Order #{order.id}</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColors[order.status] || "#bbb" },
              ]}
            >
              <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.orderDate}>
            Created: {new Date(order.createdAt).toLocaleString()}
          </Text>
          {order.updatedAt && order.updatedAt !== order.createdAt && (
            <Text style={styles.orderDate}>
              Updated: {new Date(order.updatedAt).toLocaleString()}
            </Text>
          )}
        </View>

        {/* Transaction Details */}
        <View style={styles.card}>
          <SectionHeader title="Transaction Details" />
          <DetailRow
            label="Amount"
            value={formatCurrency(order.amount, order.fromCurrency)}
            isHighlight={true}
          />
          <DetailRow
            label="From Currency"
            value={formatCurrencyDisplay(order.fromCurrency)}
          />
          <DetailRow
            label="To Currency"
            value={formatCurrencyDisplay(order.receiverCurrency)}
          />
          <DetailRow
            label="Converted Amount"
            value={calculateConversion(
              order.amount,
              order.fromCurrency,
              order.receiverCurrency
            )}
            isHighlight={true}
          />
          <DetailRow
            label="Receiver Place"
            value={getPlaceName(order.receiverPlace)}
          />
          <DetailRow label="Bank" value={getBankName(order.bank)} />
          <DetailRow label="Relationship" value={order.relationship} />
        </View>

        {/* Sender Information */}
        <View style={styles.card}>
          <SectionHeader title="Sender Information" />
          <DetailRow label="Name" value={order.senderName} />
          <DetailRow label="Phone" value={order.senderPhone} />
          <DetailRow label="Address" value={order.senderAddress} />
        </View>

        {/* Receiver Information */}
        <View style={styles.card}>
          <SectionHeader title="Receiver Information" />
          <DetailRow label="Name" value={order.receiverName} />
          <DetailRow label="Phone" value={order.receiverPhone} />
          <DetailRow label="Address" value={order.receiverAddress} />
        </View>

        {/* User Information (if available) */}
        {order.user && (
          <View style={styles.card}>
            <SectionHeader title="Customer Information" />
            <DetailRow label="Full Name" value={order.user.full_name} />
            <DetailRow label="Email" value={order.user.email} />
            <DetailRow label="Phone" value={order.user.phone_number} />
            <DetailRow label="Address" value={order.user.address} />
            <DetailRow
              label="Account Type"
              value={
                order.user.is_admin
                  ? "Admin"
                  : order.user.is_member
                  ? "Member"
                  : "User"
              }
            />
          </View>
        )}

        {/* Member Information (if different from current user) */}
        {order.member && order.member.id !== user?.id && (
          <View style={styles.card}>
            <SectionHeader title="Assigned Member" />
            <DetailRow label="Full Name" value={order.member.full_name} />
            <DetailRow label="Email" value={order.member.email} />
            <DetailRow label="Phone" value={order.member.phone_number} />
            <DetailRow label="Address" value={order.member.address} />
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Action Buttons - Only show if order is pending */}
      {order.status === "pending" && (
        <View style={styles.actionContainer}>
          <View style={styles.actionButtons}>
            <Pressable
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => showUpdateConfirmation("completed")}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.completeButtonText}>Complete Order</Text>
              )}
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.failButton]}
              onPress={() => showUpdateConfirmation("failed")}
              disabled={updating}
            >
              <Text style={styles.failButtonText}>Mark as Failed</Text>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f6fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: "#2a52be",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statusCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 2,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2a52be",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1, // Allow text to wrap
  },
  highlightValue: {
    color: COLORS.primary || "#2a52be",
    fontWeight: "bold",
    fontSize: 15,
  },
  actionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  completeButton: {
    backgroundColor: COLORS.primary || "#2a52be",
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  failButton: {
    backgroundColor: "#f44336",
  },
  failButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default OrderScreenMember;