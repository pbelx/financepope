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
// import {Header} from "../components/backHeader.jsx"

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
  const [senderCurName, setSenderCurName] = useState("");

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
        setSenderCur(res.data.payload);
        console.log(res.data.payload);
        
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
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
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
    fetchCurrencies();
  }, []);

  // Filter Currencies and Banks based on Place
  useEffect(() => {
    if (place) {
      const selectedPlace = places.find((p) => p.id == place);
      if (selectedPlace) {
        console.log(
          "Available Currencies for Selected Place:",
          selectedPlace.currencys
        );
        console.log("Available Banks for Selected Place:", selectedPlace.banks);
        setCurrPlaces(selectedPlace.currencys);
        setCurrBanks(selectedPlace.banks);
      } else {
        setCurrPlaces([]);
        setCurrBanks([]);
      }
    } else {
      setCurrPlaces([]);
      setCurrBanks([]);
    }
  }, [place, places]);

  // Get Currency Name by ID
  const getCurrencyNameById = (id) => {
    const currency = currencys.find((c) => c.id == id);
    return currency ? currency.name : "";
  };

  // Get Currency Symbol by ID
  const getCurrencySymbolById = (id) => {
    const currency = currencys.find((c) => c.id == id);
    return currency ? currency.symbol : "";
  };

  // Conversion Calculation
  const calculate = async () => {
    if (!amount || !senderCur || !receiverCur) {
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
        setAmountToReceive(res.data.payload.receiverAmount.toFixed(2));
        setConversionRate(res.data.payload.conversionRate);
      } else {
        setAmountToReceive("");
        setConversionRate(null);
      }
    } catch (error) {
      console.error("Conversion error", error);
      setAmountToReceive("");
      setConversionRate(null);
    } finally {
      setCalculatingConversion(false);
    }
  };

  useEffect(() => {
    calculate();
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
      !receiverAddress
    ) {
      Alert.alert("Error", "Please fill all required fields");
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
        senderName,
        senderPhone,
        senderAddress,
        relationship,
        receiverName,
        receiverPhone,
        receiverAddress,
        receiverAccountNumber,
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
      Alert.alert("Error", "Failed to create transaction. Please try again.");
    } finally {
      setPosting(false);
    }
  };

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
          Amount
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
          Sender Currency
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
                label={currency.name}
                value={currency.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={{ fontWeight: "500", color: "#555", marginBottom: 4 }}>
          Receiver's Country
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
          Receiver's Currency
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
          >
            <Picker.Item label="Select Currency" value="" />
            {currPlaces.map((currency) => (
              <Picker.Item
                key={currency.id}
                label={currency.name}
                value={currency.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={{ fontWeight: "500", color: "#555", marginBottom: 4 }}>
          Bank
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
          >
            <Picker.Item label="Select Bank" value={''} />
            {currBanks.map((bank) => (
              <Picker.Item key={bank.id} label={bank.name} value={bank.id} />
            ))}
          </Picker>
        </View>
        
        {/* Conversion and Amount To Receive Section */}
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
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: "#2a52be" }}>
                Receiver will get:
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#05944F", marginLeft: 8 }}>
                {amountToReceive ? `${getCurrencySymbolById(receiverCur)} ${amountToReceive}` : "---"}
              </Text>
            </View>
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
        <TextInput
          style={inputStyle}
          value={senderName}
          onChangeText={setSenderName}
          placeholder="Enter sender name"
          placeholderTextColor="#888888"
        />
        <TextInput
          style={inputStyle}
          value={senderPhone}
          onChangeText={setSenderPhone}
          placeholder="Enter sender phone"
          placeholderTextColor="#888888"
        />
        <TextInput
          style={inputStyle}
          value={senderAddress}
          onChangeText={setSenderAddress}
          placeholder="Enter sender address"
          placeholderTextColor="#888888"
        />
        <TextInput
          style={inputStyle}
          value={relationship}
          onChangeText={setRelationship}
          placeholder="Enter relationship"
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
        <TextInput
          style={inputStyle}
          value={receiverName}
          onChangeText={setReceiverName}
          placeholder="Enter receiver name"
          placeholderTextColor="#888888"
        />
        <TextInput
          style={inputStyle}
          value={receiverPhone}
          onChangeText={setReceiverPhone}
          placeholder="Enter receiver phone"
          placeholderTextColor="#888888"
        />
        <TextInput
          style={inputStyle}
          value={receiverAddress}
          onChangeText={setReceiverAddress}
          placeholder="Enter receiver address"
          placeholderTextColor="#888888"
        />
        <TextInput
          style={inputStyle}
          value={receiverAccountNumber}
          onChangeText={setReceiverAccountNumber}
          placeholder="Enter receiver account number"
          placeholderTextColor="#888888"
        />
      </View>

      <BtnPrimary
        loading={posting}
        onPress={postOrder}
        title="Create Transaction"
        style={{
          marginTop: 10,
          borderRadius: 10,
          backgroundColor: "#2a52be",
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