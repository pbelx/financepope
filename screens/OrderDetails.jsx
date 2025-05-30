import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Picker,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme";
import { useNavigation } from "@react-navigation/native";
import BtnSecondary from "../components/BtnSecondary";
import gstyles from "../styles";
import { generateAxiosInstance } from "../shared/constants";

const OrderDetails = ({ route }) => {
  // Get the order data from navigation params with error handling
  const order = route?.params?.order || null;
  
  // If no order is provided, show error or navigate back
  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No order data found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  const [status, setStatus] = useState(order?.status || "pending");
  const [message, setMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [places, setPlaces] = useState([]);
  const [allBanks, setAllBanks] = useState([]);
  const [currencies, setCurrencies] = useState([]); // Add currencies state
  const [selectedMemberId, setSelectedMemberId] = useState(
    order?.member?.id || null
  );
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const [currentOrder, setCurrentOrder] = useState(order);

  // Fetch all required data on component mount
  useEffect(() => {
    fetchMembers();
    fetchPlaces();
    fetchCurrencies(); // Add currency fetching
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      const response = await axiosInstance.get("/users/members");
      const data = response.data;

      if (data.status && data.payload) {
        setMembers(data.payload);
      } else {
        Alert.alert("Error", "Failed to fetch members");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
      Alert.alert("Error", "Failed to fetch members");
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
      } else {
        console.error("Failed to fetch currencies");
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
      }
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  // Helper function to get bank name by ID
  const getBankName = (bankId) => {
    if (!bankId) return 'N/A';
    const bank = allBanks.find(bank => bank.id && bank.id.toString() === bankId.toString());
    return bank ? bank.name : 'N/A';
  };

  // Helper function to get place name by ID
  const getPlaceName = (placeId) => {
    if (!placeId) return 'N/A';
    const place = places.find(place => place.id && place.id.toString() === placeId.toString());
    return place ? place.name : 'N/A';
  };

  // Helper function to get currency info by ID
  const getCurrencyInfo = (currencyId) => {
    if (!currencyId) return { name: 'N/A', symbol: '', code: '' };
    const currency = currencies.find(curr => curr.id && curr.id.toString() === currencyId.toString());
    return currency ? currency : { name: 'N/A', symbol: '', code: '' };
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
    
    return `${convertedAmount.toFixed(2)} ${toCurrency.symbol || toCurrency.code || toCurrency.name}`;
  };

  // Handle member assignment
  const handleAssignMember = async () => {
    if (!selectedMemberId) {
      Alert.alert("Error", "Please select a member to assign");
      return;
    }

    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      const response = await axiosInstance.put("/order/assign-member", {
        orderId: order.id,
        memberId: selectedMemberId,
      });

      const data = response.data;

      if (data.status) {
        // Update the local order state with the response data
        if (data.payload) {
          setCurrentOrder(data.payload);
        } else {
          // If the API doesn't return the updated order, update manually
          const selectedMember = members.find(
            (member) => member.id === selectedMemberId
          );
          setCurrentOrder((prev) => ({
            ...prev,
            member: selectedMember,
          }));
        }

        Alert.alert("Success", "Member assigned successfully");
        // Don't navigate back immediately - let user see the updated UI
        // navigation.goBack(); // Remove or comment this out
      } else {
        Alert.alert("Error", data.payload || "Failed to assign member");
      }
    } catch (error) {
      console.error("Error assigning member:", error);
      Alert.alert("Error", "Failed to assign member");
    } finally {
      setLoading(false);
    }
  };
  // Format date helper function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Format currency helper function
  const formatCurrency = (amount, currencyId) => {
    if (!amount) return "0";
    const currency = getCurrencyInfo(currencyId);
    const formattedAmount = amount.toLocaleString();
    return `${formattedAmount} ${currency.symbol || currency.code || currency.name}`;
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "green";
      case "approved":
        return "blue";
      case "cancelled":
        return "red";
      case "pending":
      default:
        return "orange";
    }
  };

  // Render member item
  const renderMemberItem = ({ item }) => (
    <TouchableOpacity
      style={styles.memberItem}
      onPress={() => setSelectedMemberId(item.id)}
    >
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.full_name}</Text>
        <Text style={styles.memberEmail}>{item.email}</Text>
        <Text style={styles.memberPhone}>{item.phone_number}</Text>
      </View>
      <View style={styles.checkbox}>
        <Ionicons
          name={selectedMemberId === item.id ? "checkbox" : "checkbox-outline"}
          size={24}
          color={selectedMemberId === item.id ? COLORS.primary : "#ccc"}
        />
      </View>
    </TouchableOpacity>
  );

  // Prepare data for FlatList including all sections
  const flatListData = [
    { type: "header" },
    { type: "messages" },
    { type: "status" },
    { type: "members" },
    { type: "info" },
  ];

  // Render different sections based on type
  const renderSection = ({ item }) => {
    switch (item.type) {
      case "header":
        return (
          <View style={styles.card}>
            <Pressable
              style={{ paddingVertical: 5 }}
              onPress={() => navigation.navigate("Home")}
            >
              <Ionicons
                name="arrow-back-sharp"
                style={{ marginLeft: 5 }}
                size={24}
                color="black"
              />
            </Pressable>

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ fontWeight: "bold", fontSize: 17 }}>Sender</Text>
                <Text style={styles.detail}>
                  Name: {order?.senderName || "N/A"}
                </Text>
                <Text style={styles.detail}>
                  Phone: {order?.senderPhone || "N/A"}
                </Text>
                <Text style={styles.detail}>
                  Address: {order?.senderAddress || "N/A"}
                </Text>
                <Text style={styles.detail}>
                  Relationship: {order?.relationship || "N/A"}
                </Text>
                <Text style={{ color: COLORS.gray, marginTop: 5 }}>
                  Sender Details
                </Text>
              </View>

              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontWeight: "bold", fontSize: 17 }}>
                  Receiver
                </Text>
                <Text style={styles.detail}>
                  Name: {order?.receiverName || "N/A"}
                </Text>
                <Text style={styles.detail}>
                  Phone: {order?.receiverPhone || "N/A"}
                </Text>
                <Text style={styles.detail}>
                  Address: {order?.receiverAddress || "N/A"}
                </Text>
                <Text style={styles.detail}>
                  Location: {getPlaceName(order?.placeId || order?.receiverPlace) || "N/A"}
                </Text>
                <Text style={styles.detail}>
                  Bank: {getBankName(order?.bankId || order?.bank) || "N/A"}
                </Text>
                <Text style={{ color: COLORS.gray, marginTop: 5 }}>
                  Receiver Details
                </Text>
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                marginTop: 15,
                paddingTop: 15,
                borderTopColor: "#e1e1e1",
                borderTopWidth: 1,
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <View style={{ marginLeft: 10 }}>
                  <Text style={{ color: COLORS.gray, fontSize: 16 }}>
                    {currentOrder?.member?.full_name || "Unassigned"}
                  </Text>
                  <Text>{formatDate(order?.createdAt)}</Text>
                </View>
              </View>
              <View>
                <View style={{ flexDirection: "row" }}>
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: COLORS.primary,
                      fontSize: 17,
                    }}
                  >
                    {formatCurrency(order?.amount, order?.fromCurrency)}
                  </Text>
                </View>
                <Text style={styles.conversionText}>
                  → {calculateConversion(order?.amount, order?.fromCurrency, order?.receiverCurrency)}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: getStatusColor(order?.status),
                    textTransform: "capitalize",
                  }}
                >
                  {order?.status || "pending"}
                </Text>
              </View>
            </View>
          </View>
        );

      case "messages":
        return (
          <View style={styles.card}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Messages</Text>
            {messages.map((message) => {
              return (
                <View
                  key={message.id}
                  style={{
                    padding: 10,
                    backgroundColor: COLORS.primary,
                    margin: 10,
                    width: "70%",
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ color: "#fff" }}>{message.message}</Text>
                </View>
              );
            })}

            <View
              style={{
                padding: 10,
                backgroundColor: COLORS.primary2,
                width: "70%",
                marginLeft: "30%",
                marginTop: 10,
                marginRight: 10,
                marginBottom: 10,
                borderRadius: 10,
              }}
            ></View>
            <View style={{ flexDirection: "row" }}>
              <View style={{ width: "90%" }}>
                <TextInput
                  style={styles.input}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Enter message"
                />
              </View>
              {posting ? (
                <ActivityIndicator />
              ) : (
                <Pressable onPress={postmessages} style={{ marginLeft: 10 }}>
                  <Ionicons
                    name="send"
                    size={24}
                    style={{ color: COLORS.primary }}
                  />
                </Pressable>
              )}
            </View>
          </View>
        );

      case "status":
        return (
          <View style={styles.card}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Change Status
            </Text>
            <View
              style={{
                flexDirection: "row",
                marginTop: 20,
                justifyContent: "space-between",
              }}
            >
              <View>
                <Pressable
                  style={[
                    styles.actionBtn,
                    status === "approved" && {
                      backgroundColor: "green",
                      opacity: 0.7,
                    },
                  ]}
                  disabled={status === "completed"}
                >
                  <Text
                    style={{ color: status === "approved" ? "white" : "green" }}
                  >
                    Approve
                  </Text>
                </Pressable>
              </View>
              <View>
                <Pressable
                  style={[
                    styles.actionBtn,
                    status === "cancelled" && {
                      backgroundColor: "red",
                      opacity: 0.7,
                    },
                  ]}
                  disabled={status === "completed"}
                >
                  <Text
                    style={{ color: status === "cancelled" ? "white" : "red" }}
                  >
                    Reject
                  </Text>
                </Pressable>
              </View>
              <View>
                <Pressable
                  style={[
                    styles.actionBtn,
                    status === "completed" && {
                      backgroundColor: COLORS.primary,
                      opacity: 0.7,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: status === "completed" ? "white" : COLORS.primary,
                    }}
                  >
                    Complete
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        );

      case "members":
        return (
          <View style={styles.card}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}
            >
              Assign Member
            </Text>
            <Text
              style={{ fontSize: 16, color: COLORS.gray, marginBottom: 15 }}
            >
              Current Member:{" "}
              {currentOrder?.member
                ? `${currentOrder.member.full_name} `
                : "Not Assigned"}
            </Text>

            {loading ? (
              <Text style={{ textAlign: "center", color: COLORS.gray }}>
                Loading members...
              </Text>
            ) : (
              <>
                <Text
                  style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}
                >
                  Select Member:
                </Text>
                {members.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    style={styles.memberItem}
                    onPress={() => setSelectedMemberId(member.id)}
                  >
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.full_name}</Text>
                      <Text style={styles.memberEmail}>{member.email}</Text>
                      <Text style={styles.memberPhone}>
                        {member.phone_number}
                      </Text>
                    </View>
                    <View style={styles.checkbox}>
                      <Ionicons
                        name={
                          selectedMemberId === member.id
                            ? "checkbox"
                            : "checkbox-outline"
                        }
                        size={24}
                        color={
                          selectedMemberId === member.id
                            ? COLORS.primary
                            : "#ccc"
                        }
                      />
                    </View>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={[
                    styles.assignButton,
                    { opacity: selectedMemberId ? 1 : 0.5 },
                  ]}
                  onPress={handleAssignMember}
                  disabled={!selectedMemberId || loading}
                >
                  <Text style={styles.assignButtonText}>
                    {loading ? "Assigning..." : "Assign Selected Member"}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        );

      case "info":
        return (
          <View style={styles.card}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Order Information
            </Text>
            <View style={{ marginTop: 10 }}>
              <Text style={styles.infoRow}>
                Order ID: #{order?.id || "N/A"}
              </Text>
              <Text style={styles.infoRow}>
                From Currency: {formatCurrencyDisplay(order?.fromCurrency)}
              </Text>
              <Text style={styles.infoRow}>
                To Currency: {formatCurrencyDisplay(order?.receiverCurrency)}
              </Text>
              <Text style={styles.infoRow}>
                Amount: {formatCurrency(order?.amount, order?.fromCurrency)}
              </Text>
              <Text style={styles.infoRow}>
                Converted Amount: {calculateConversion(order?.amount, order?.fromCurrency, order?.receiverCurrency)}
              </Text>
              <Text style={styles.infoRow}>
                Created: {formatDate(order?.createdAt)}
              </Text>
              <Text style={styles.infoRow}>
                Customer: {order?.user ? `${order.receiverName}` : "N/A"}
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const [messages, setmessages] = useState([]);

  const fetchmessages = async () => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      let res = await axiosInstance.get(`/messages/${order.id}`);
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
  const [posting, setPosting] = useState(false);
  const postmessages = async () => {
    try {
      setPosting(true);
      const axiosInstance = await generateAxiosInstance(true);
      let formdata = {
        orderId: order.id,
        message: message,
      };
      let res = await axiosInstance.post("messages", formdata);
      // console.log("res", formdata);
      if (res.data.status) {
        setPosting(false);
        setMessage("");
        fetchmessages();
      }
    } catch (error) {
      console.log(error);
      setPosting(false);
    }
  };

  return (
    <FlatList
      data={flatListData}
      renderItem={renderSection}
      keyExtractor={(item, index) => `${item.type}_${index}`}
      style={styles.detailsContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default OrderDetails;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  actionBtn: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  detail: {
    fontSize: 14,
    padding: 8,
    backgroundColor: "#f5f5f5",
    marginTop: 3,
    borderRadius: 4,
  },
  infoRow: {
    fontSize: 15,
    paddingVertical: 3,
    color: "#333",
  },
  card: {
    margin: 5,
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#fff",
  },
  detailsContainer: {
    padding: 16,
    flex: 1,
    backgroundColor: COLORS.primary2,
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
  conversionText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
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
  membersList: {
    maxHeight: 200,
    marginBottom: 15,
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  memberEmail: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  memberPhone: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 1,
  },
  checkbox: {
    marginLeft: 10,
  },
  assignButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  assignButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});