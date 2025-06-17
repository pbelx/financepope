import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AntDesign from "@expo/vector-icons/AntDesign";
import BtnPrimary from "../components/BtnPrimary";
import styles from "../styles";
import { generateAxiosInstance } from "../shared/constants";
import { AuthContext } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

const AddOrder = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);
  const [currencys, setCurrencys] = useState([]);
  const [banks, setBanks] = useState([]);
  const [place, setPlace] = useState("");
  const [senderCur, setSenderCur] = useState("");
  const [receiverCur, setReceiverCur] = useState("");
  const [currPlaces, setCurrPlaces] = useState([]);
  const [currBanks, setCurrBanks] = useState([]);
  const [amount, setAmount] = useState("");
  const [amountToReceive, setAmountToReceive] = useState("");
  const [conversionRate, setConversionRate] = useState(null);
  const [calculatingConversion, setCalculatingConversion] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [relationship, setRelationship] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverAccountNumber, setReceiverAccountNumber] = useState("");
  const [bankId, setBankId] = useState("");
  const [posting, setPosting] = useState(false);

  // Define input style with dark text
  const inputStyle = {
    ...styles.input,
    backgroundColor: "#f0f4fa",
    borderRadius: 8,
    marginBottom: 12,
    color: "#333333", // Dark text color for better visibility
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  };

  // Fetch Currencies
  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      const res = await axiosInstance.get("/currency/all");
      if (res.data.status) {
        setCurrencys(res.data.payload);
        console.log("Currencies loaded:", res.data.payload);
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
      Alert.alert("Error", "Failed to load currencies");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Places
  const fetchPlaces = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      const res = await axiosInstance.get("/places");
      if (res.data.status) {
        setPlaces(res.data.payload);
        console.log("Places loaded:", res.data.payload);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
      Alert.alert("Error", "Failed to load places");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
    fetchCurrencies();
  }, []);

  // Filter Currencies and Banks based on Place
  useEffect(() => {
    if (place && places.length > 0) {
      const selectedPlace = places.find((p) => p.id == place);
      if (selectedPlace) {
        console.log("Selected place:", selectedPlace);
        console.log("Available Currencies for Selected Place:", selectedPlace.currencys);
        console.log("Available Banks for Selected Place:", selectedPlace.banks);
        setCurrPlaces(selectedPlace.currencys || []);
        setCurrBanks(selectedPlace.banks || []);
        
        // Reset receiver currency and bank when place changes
        setReceiverCur("");
        setBankId("");
      } else {
        setCurrPlaces([]);
        setCurrBanks([]);
      }
    } else {
      setCurrPlaces([]);
      setCurrBanks([]);
      setReceiverCur("");
      setBankId("");
    }
  }, [place, places]);

  // Get Currency Name by ID
  const getCurrencyNameById = (id) => {
    if (!id) return "";
    const currency = currencys.find((c) => c.id == id);
    return currency ? currency.name : "";
  };

  // Get Currency Symbol by ID
  const getCurrencySymbolById = (id) => {
    if (!id) return "";
    const currency = currencys.find((c) => c.id == id);
    return currency ? currency.symbol : "";
  };

  // Conversion Calculation
  const calculate = async () => {
    if (!amount || !senderCur || !receiverCur || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setAmountToReceive("");
      setConversionRate(null);
      return;
    }
    
    try {
      setCalculatingConversion(true);
      const axiosInstance = await generateAxiosInstance(true);
      const res = await axiosInstance.post("/currency/convert", {
        senderAmount: parseFloat(amount),
        senderCurrencyId: parseInt(senderCur),
        receiverCurrencyId: parseInt(receiverCur),
      });

      if (res.data.status) {
        setAmountToReceive(res.data.payload.receiverAmount.toString());
        setConversionRate(res.data.payload.conversionRate);
        console.log("Conversion result:", res.data.payload);
      } else {
        console.error("Conversion failed:", res.data.message);
        setAmountToReceive("");
        setConversionRate(null);
        Alert.alert("Conversion Error", res.data.message || "Failed to calculate conversion");
      }
    } catch (error) {
      console.error("Conversion error:", error);
      setAmountToReceive("");
      setConversionRate(null);
      Alert.alert("Error", "Failed to calculate conversion rate");
    } finally {
      setCalculatingConversion(false);
    }
  };

  // Debounced calculation effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      calculate();
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [amount, senderCur, receiverCur]);

  // Post Order
  const postOrder = async () => {
    // Validate required fields before submitting
    if (
      !amount ||
      !senderCur ||
      !place ||
      !receiverCur ||
      !senderName ||
      !receiverName ||
      !senderPhone ||
      !senderAddress ||
      !receiverPhone ||
      !receiverAddress ||
      !amountToReceive
    ) {
      Alert.alert("Error", "Please fill all required fields and ensure conversion is calculated");
      return;
    }

    // Validate amount
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      setPosting(true);

      const formData = {
        userId: user?.id,
        amount: parseFloat(amount),
        memberId: null,
        fromCurrency: parseInt(senderCur),
        receiverPlace: parseInt(place),
        receiverCurrency: parseInt(receiverCur),
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        senderAddress: senderAddress.trim(),
        relationship: relationship.trim(),
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        receiverAddress: receiverAddress.trim(),
        receiverAccountNumber: receiverAccountNumber.trim(),
        bank: bankId ? parseInt(bankId) : null,
        amountToReceive: parseFloat(amountToReceive),
      };

      console.log("Form Data being sent:", formData);

      const axiosInstance = await generateAxiosInstance(true);
      const res = await axiosInstance.post("/order/create", formData);

      console.log("API Response received:", res.data);

      if (res.data.status) {
        Alert.alert(
          "Success",
          "Transaction created successfully",
          [
            {
              text: "OK",
              onPress: () => {
                // Reset form
                setAmount("");
                setAmountToReceive("");
                setConversionRate(null);
                setSenderName("");
                setSenderPhone("");
                setSenderAddress("");
                setRelationship("");
                setReceiverName("");
                setReceiverPhone("");
                setReceiverAddress("");
                setReceiverAccountNumber("");
                setPlace("");
                setSenderCur("");
                setReceiverCur("");
                setBankId("");
                
                setTimeout(() => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }],
                  });
                }, 500);
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", res.data.message || "Failed to create transaction");
      }
    } catch (error) {
      console.error("Order creation error:", error.response?.data || error.message || error);
      Alert.alert("Error", error.response?.data?.message || "Failed to create transaction. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  if (loading && (places.length === 0 || currencys.length === 0)) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2a52be" />
        <Text style={{ marginTop: 10, color: "#666" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ padding: 20, backgroundColor: "#f4f6fb" }}>
      {/* Back Button and Header */}
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        marginTop: 10,
      }}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={{
            padding: 8,
            borderRadius: 20,
            backgroundColor: "#fff",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
            marginRight: 15,
          }}
        >
          <AntDesign name="arrowleft" size={20} color="#000" />
        </Pressable>
        
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: "#2a52be",
            flex: 1,
            textAlign: "center",
            letterSpacing: 1,
            marginRight: 43, // To center the text accounting for back button width
          }}
        >
          Create Transaction
        </Text>
      </View>

      {/* Transaction Details Card */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 18,
          marginBottom: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#2a52be",
            marginBottom: 12,
          }}
        >
          Transaction Details
        </Text>

        <Text style={{ fontWeight: "500", color: "#555", marginBottom: 4 }}>
          Amount *
        </Text>
        <TextInput
          style={inputStyle}
          value={amount}
          onChangeText={setAmount}
          placeholder="Enter amount"
          placeholderTextColor="#888888"
          keyboardType="numeric"
        />

        <Text style={{ fontWeight: "500", color: "#555", marginBottom: 4 }}>
          Sender Currency *
        </Text>
        <View
          style={{
            backgroundColor: "#f0f4fa",
            borderRadius: 8,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#e0e6ed",
          }}
        >
          <Picker
            selectedValue={senderCur}
            onValueChange={(value) => setSenderCur(value)}
            style={{ color: "#333333" }}
          >
            <Picker.Item label="Select Currency" value="" />
            {currencys.map((currency) => (
              <Picker.Item
                key={currency.id}
                label={`${currency.name} `}
                value={currency.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={{ fontWeight: "500", color: "#555", marginBottom: 4 }}>
          Receiver's Country *
        </Text>
        <View
          style={{
            backgroundColor: "#f0f4fa",
            borderRadius: 8,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#e0e6ed",
          }}
        >
          <Picker
            selectedValue={place}
            onValueChange={(value) => setPlace(value)}
            style={{ color: "#333333" }}
          >
            <Picker.Item label="Select Place" value="" />
            {places.map((place) => (
              <Picker.Item key={place.id} label={place.name} value={place.id} />
            ))}
          </Picker>
        </View>

        <Text style={{ fontWeight: "500", color: "#555", marginBottom: 4 }}>
          Receiver's Currency *
        </Text>
        <View
          style={{
            backgroundColor: "#f0f4fa",
            borderRadius: 8,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#e0e6ed",
          }}
        >
          <Picker
            selectedValue={receiverCur}
            onValueChange={(value) => setReceiverCur(value)}
            style={{ color: "#333333" }}
            enabled={currPlaces.length > 0}
          >
            <Picker.Item label={currPlaces.length > 0 ? "Select Currency" : "Select country first"} value="" />
            {currPlaces.map((currency) => (
              <Picker.Item
                key={currency.id}
                label={`${currency.name} `}
                value={currency.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={{ fontWeight: "500", color: "#555", marginBottom: 4 }}>
          Bank (Optional)
        </Text>
        <View
          style={{
            backgroundColor: "#f0f4fa",
            borderRadius: 8,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#e0e6ed",
          }}
        >
          <Picker
            selectedValue={bankId}
            onValueChange={(value) => setBankId(value)}
            style={{ color: "#333333" }}
            enabled={currBanks.length > 0}
          >
            <Picker.Item label={currBanks.length > 0 ? "Select Bank (Optional)" : "Select country first"} value={''} />
            {currBanks.map((bank) => (
              <Picker.Item key={bank.id} label={bank.name} value={bank.id} />
            ))}
          </Picker>
        </View>
        
        {/* Conversion and Amount To Receive Section */}
        {/* <View
          style={{
            backgroundColor: "#eef3fd",
            borderRadius: 8,
            padding: 16,
            marginTop: 8,
            borderWidth: 1,
            borderColor: "#d1defc",
          }}
        >
          <Text
            style={{
              fontSize: 15,
              fontWeight: "500",
              color: "#2a52be",
              marginBottom: 8,
            }}
          >
            Conversion Details
          </Text>
          
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontWeight: "500", color: "#555" }}>
              {getCurrencySymbolById(senderCur)} {amount || "0"} to {getCurrencyNameById(receiverCur)}
            </Text>
            
            {conversionRate && (
              <Text style={{ color: "#666", fontSize: 13 }}>
                Rate: {conversionRate}
              </Text>
            )}
          </View>
          
          {calculatingConversion ? (
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="small" color="#2a52be" />
              <Text style={{ marginLeft: 8, color: "#666" }}>Calculating...</Text>
            </View>
          ) : (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#2a52be" }}>
                Receiver will get:
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#05944F", marginLeft: 8 }}>
                {amountToReceive ? `${getCurrencySymbolById(receiverCur)} ${amountToReceive}` : "---"}
              </Text>
            </View>
          )}
        </View> */}
        <View
  style={{
    backgroundColor: "#eef3fd",
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#d1defc",
  }}
>
  <Text
    style={{
      fontSize: 15,
      fontWeight: "500",
      color: "#2a52be",
      marginBottom: 8,
    }}
  >
    Conversion Details
  </Text>

  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
    <Text style={{ fontWeight: "500", color: "#555" }}>
      {getCurrencySymbolById(senderCur)} {amount || "0"} to {getCurrencyNameById(receiverCur)}
    </Text>

    {conversionRate && (
      <Text style={{ color: "#666", fontSize: 13 }}>
        Rate: {conversionRate}
      </Text>
    )}
  </View>

  {calculatingConversion ? (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="small" color="#2a52be" />
      <Text style={{ marginLeft: 8, color: "#666" }}>Calculating...</Text>
    </View>
  ) : (
    <>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#2a52be" }}>
          Receiver will get:
        </Text>
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#05944F", marginLeft: 8 }}>
          {amountToReceive ? `${getCurrencySymbolById(receiverCur)} ${amountToReceive}` : "---"}
        </Text>
      </View>

      {/* Fee and total with fee display */}
      <View style={{ marginTop: 4 }}>
        <Text style={{ color: "#888", fontSize: 13 }}>
          Fee (2%): {amount ? `${getCurrencySymbolById(senderCur)} ${(amount * 0.02).toFixed(2)}` : "---"}
        </Text>
        <Text style={{ color: "#444", fontSize: 14, fontWeight: "600" }}>
          Total + Fee: {amount ? `${getCurrencySymbolById(senderCur)} ${(amount * 1.02).toFixed(2)}` : "---"}
        </Text>
      </View>
    </>
  )}
</View>

      </View>

      {/* Sender Details Card */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 18,
          marginBottom: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#2a52be",
            marginBottom: 12,
          }}
        >
          Sender Details
        </Text>
        <Text style={{ fontWeight: "500", color: "#555", marginBottom: 4 }}>
          Full Name *
        </Text>
        <TextInput
          style={inputStyle}
          value={senderName}
          onChangeText={setSenderName}
          placeholder="Enter sender name"
          placeholderTextColor="#888888"
        />
        <Text style={{ fontWeight: "500", color: "#555", marginBottom: 4 }}>
          Phone Number *
        </Text>
        <TextInput
          style={inputStyle}
          value={senderPhone}
          onChangeText={setSenderPhone}
          placeholder="Enter sender phone"
          placeholderTextColor="#888888"
          keyboardType="phone-pad"
        />
        <Text style={{ fontWeight: "500", color: "#555", marginBottom: 4 }}>
          Address *
        </Text>
        <TextInput
          style={inputStyle}
          value={senderAddress}
          onChangeText={setSenderAddress}
          placeholder="Enter sender address"
          placeholderTextColor="#888888"
          multiline
        />
        <Text style={{ fontWeight: "500", color: "#555", marginBottom: 4 }}>
          Relationship (Optional)
        </Text>
        <TextInput
          style={inputStyle}
          value={relationship}
          onChangeText={setRelationship}
          placeholder="e.g., Friend, Family, Business"
          placeholderTextColor="#888888"
        />
      </View>

      {/* Receiver Details Card */}
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 18,
          marginBottom: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#2a52be",
            marginBottom: 12,
          }}
        >
          Receiver Details
        </Text>
        <Text style={{ fontWeight: "500", color: "#555", marginBottom: 4 }}>
          Full Name *
        </Text>
        <TextInput
          style={inputStyle}
          value={receiverName}
          onChangeText={setReceiverName}
          placeholder="Enter receiver name"
          placeholderTextColor="#888888"
        />
        <Text style={{ fontWeight: "500", color: "#555", marginBottom: 4 }}>
          Phone Number *
        </Text>
        <TextInput
          style={inputStyle}
          value={receiverPhone}
          onChangeText={setReceiverPhone}
          placeholder="Enter receiver phone"
          placeholderTextColor="#888888"
          keyboardType="phone-pad"
        />
        <Text style={{ fontWeight: "500", color: "#555", marginBottom: 4 }}>
          Address *
        </Text>
        <TextInput
          style={inputStyle}
          value={receiverAddress}
          onChangeText={setReceiverAddress}
          placeholder="Enter receiver address"
          placeholderTextColor="#888888"
          multiline
        />
        <Text style={{ fontWeight: "500", color: "#555", marginBottom: 4 }}>
          Account Number (Optional)
        </Text>
        <TextInput
          style={inputStyle}
          value={receiverAccountNumber}
          onChangeText={setReceiverAccountNumber}
          placeholder="Enter receiver account number"
          placeholderTextColor="#888888"
          keyboardType="numeric"
        />
      </View>

      <BtnPrimary
        loading={posting}
        onPress={postOrder}
        title="Create Transaction"
        disabled={!amountToReceive || calculatingConversion}
        style={{
          marginTop: 10,
          borderRadius: 10,
          backgroundColor: (!amountToReceive || calculatingConversion) ? "#ccc" : "#2a52be",
          paddingVertical: 14,
          fontWeight: "bold",
          fontSize: 18,
        }}
      />

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

export default AddOrder;