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
  Alert,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../theme";
import BtnPrimary from "../components/BtnPrimary";
import { AuthContext } from "../context/AuthContext";
import gstyles from "../styles";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { generateAxiosInstance } from "../shared/constants";

const Collections = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingCollection, setCreatingCollection] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedCurrencyId, setSelectedCurrencyId] = useState(null);
  const [currencies, setCurrencies] = useState([]);
  // NEW STATES FOR MEMBER SELECTION
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  // Helper function to fetch currencies, reused from OrderDetails.jsx logic
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

  // NEW: Helper function to fetch members, reused from OrderDetails.jsx
  const fetchMembers = async () => {
    try {
      setLoading(true); // Can share this loading state with initial collections fetch if desired
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
      // setLoading(false); // Do not set false here if sharing with collections fetch
    }
  };

  const getCurrencyInfo = (currencyId) => {
    if (!currencyId) return { name: "N/A", symbol: "", code: "" };
    const currency = currencies.find(
      (curr) => curr.id && curr.id.toString() === currencyId.toString()
    );
    return currency ? currency : { name: "N/A", symbol: "", code: "" };
  };

  const formatCurrencyDisplay = (currencyId) => {
    const currency = getCurrencyInfo(currencyId);
    if (currency.symbol) {
      return `${currency.name} (${currency.symbol})`;
    } else if (currency.code) {
      return `${currency.name} (${currency.code})`;
    }
    return currency.name;
  };

  const formatCurrency = (amountValue, currencyId) => {
    if (!amountValue) return "0";
    const currency = getCurrencyInfo(currencyId);
    const formattedAmount = parseFloat(amountValue).toLocaleString();
    return `${formattedAmount} ${currency.symbol || currency.code || currency.name}`;
  };

  // Function to fetch collections for the current user
  const fetchCollections = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      // Assuming user.id is available from AuthContext for memberId
      let res = await axiosInstance.get(`/collections/member/${user?.id}`);
      if (res.data.status) {
        setCollections(res.data.payload);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      Alert.alert("Error", "Failed to fetch collections.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "green";
      case "rejected":
        return "red";
      case "pending":
      default:
        return "orange";
    }
  };

  // Function to handle creating a new collection
  const handleCreateCollection = async () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }
    if (!selectedCurrencyId) {
      Alert.alert("Error", "Please select a currency.");
      return;
    }
    // VALIDATION FOR SELECTED MEMBER ID
    if (!selectedMemberId) {
      Alert.alert("Error", "Please select a member to assign the collection to.");
      return;
    }

    try {
      setCreatingCollection(true);
      const axiosInstance = await generateAxiosInstance(true);
      const response = await axiosInstance.post("/collections", {
        amount: parseFloat(amount),
        userId: selectedMemberId, // *** NOW USING selectedMemberId ***
        currencyId: selectedCurrencyId,
      });

      const data = response.data;
      if (data.status) {
        Alert.alert("Success", "Collection created successfully!");
        setAmount(""); // Clear input field
        setSelectedCurrencyId(null); // Reset currency picker
        setSelectedMemberId(null); // Reset member picker
        fetchCollections(); // Refresh the list of collections
      } else {
        Alert.alert("Error", data.payload || "Failed to create collection.");
      }
    } catch (error) {
      console.error("Error creating collection:", error);
      Alert.alert("Error", "Failed to create collection.");
    } finally {
      setCreatingCollection(false);
    }
  };

  useEffect(() => {
    fetchCollections();
    fetchCurrencies();
    fetchMembers(); // NEW: Fetch members on component mount
  }, []);

  const renderCollectionItem = ({ item }) => {
    return (
      <View key={item.id} style={styles.card}>
        <View style={styles.collectionRow}>
          <Text style={styles.collectionId}>#{item?.id}</Text>
          <Text style={styles.collectionDate}>{formatDate(item?.createdAt || item?.created_at)}</Text>
        </View>
        <View style={styles.collectionRow}>
          <Text style={styles.collectionAmount}>
            Amount: {formatCurrency(item?.amount, item?.currencyId)}
          </Text>
          <Text style={[styles.collectionStatus, { color: getStatusColor(item?.status) }]}>
            Status: {item?.status || "N/A"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Pressable onPress={() => navigation.navigate("Home")} style={{ padding: 5 }}>
            <AntDesign name="arrowleft" size={32} color="black" />
          </Pressable>
        </View>
        <View>
          <Text style={gstyles.gtitle}>Collections</Text>
        </View>
      </View>

      {/* Section to create a new collection */}
      <View style={styles.createCollectionSection}>
        <Text style={styles.sectionTitle}>Create New Collection</Text>
        <TextInput
          style={gstyles.input}
          placeholder="Enter Amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedCurrencyId}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedCurrencyId(itemValue)}
          >
            <Picker.Item label="Select Currency" value={null} />
            {currencies.map((currency) => (
              <Picker.Item
                key={currency.id}
                label={formatCurrencyDisplay(currency.id)}
                value={currency.id}
              />
            ))}
          </Picker>
        </View>
        {/* NEW: Member Selection Picker */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMemberId}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedMemberId(itemValue)}
          >
            <Picker.Item label="Assign to Member" value={null} />
            {members.map((member) => (
              <Picker.Item
                key={member.id}
                label={member.full_name || member.email || `Member ID: ${member.id}`}
                value={member.id}
              />
            ))}
          </Picker>
        </View>

        <TouchableOpacity
          style={[
            styles.createButton,
            { opacity: amount && selectedCurrencyId && selectedMemberId && !creatingCollection ? 1 : 0.5 },
          ]}
          onPress={handleCreateCollection}
          disabled={!amount || !selectedCurrencyId || !selectedMemberId || creatingCollection}
        >
          <Text style={styles.createButtonText}>
            {creatingCollection ? "Creating..." : "Create Collection"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Your Collections</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading collections...</Text>
        </View>
      ) : collections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="inbox" size={48} color={COLORS.gray} />
          <Text style={styles.emptyText}>No collections found</Text>
        </View>
      ) : (
        <FlatList
          data={collections}
          renderItem={renderCollectionItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
        />
      )}
    </ScrollView>
  );
};

export default Collections;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: COLORS.primary2,
    flex: 1,
  },
  card: {
    marginVertical: 8,
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  collectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  collectionId: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#333",
  },
  collectionDate: {
    fontSize: 14,
    color: COLORS.gray,
  },
  collectionAmount: {
    fontWeight: "bold",
    fontSize: 15,
    color: COLORS.primary,
  },
  collectionStatus: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    marginTop: 10,
    color: COLORS.gray,
    fontSize: 16,
  },
  createCollectionSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  pickerContainer: {
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});