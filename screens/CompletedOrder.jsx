import React, { useState, useEffect, useContext } from "react";
import { View, Text, TextInput, Button, Picker, StyleSheet, FlatList, TouchableOpacity, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../theme";
import BtnPrimary from "../components/BtnPrimary";
import { AuthContext } from "../context/AuthContext";
import gstyles from "../styles";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { generateAxiosInstance } from "../shared/constants";
const CompletedOrder = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [orders, setorders] = useState([])
   const [loading, setLoading] = useState(false);
  const fetchorders = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      let res = await axiosInstance.get(`/order/${user?.id}`);
      console.log("orders", res.data.payload);
      if (res.data.status) {
        // console.log("orders", res.data.payload);
        setorders(res.data.payload)
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };
 const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  useEffect(() => {
    fetchorders();
  }, []);
  return (
    <View style={{ padding: 20 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Pressable onPress={() => navigation.navigate("Home")} style={{ padding: 5 }}>
            <AntDesign name="arrowleft" size={32} color="black" />
          </Pressable>

        </View>
        <View>
          <Text style={gstyles.gtitle}>Completed Order</Text>
        
        </View>
      </View>

      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: '20%' }}>
          <TextInput placeholder="4" style={gstyles.input} />
        </View>
        <View style={{ width: '30%', marginLeft: 20 }}>
          <BtnPrimary title="Generate" />
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: COLORS.gray }}>Loading orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
          <MaterialIcons name="inbox" size={48} color={COLORS.gray} />
          <Text style={{ marginTop: 10, color: COLORS.gray, fontSize: 16 }}>No pending orders found</Text>
        </View>
      ) : (
        orders.map((item) => {
          return (
            <ScrollView
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              key={item.id}
            >
              <View style={styles.card}>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ width: 40, padding: 5 }}>
                    <Text style={{ fontWeight: 'bold', marginTop: 10 }}>#{item?.id}</Text>
                  </View>
                  <View style={{ width: 100, padding: 5 }}>
                    <Text style={{ fontWeight: 'bold', marginTop: 10 }}>
                      {formatDate(item?.createdAt)}
                    </Text>
                  </View>
                  <View style={{ width: 100, padding: 5 }}>
                    <Text style={{ fontWeight: 'bold', marginTop: 10 }}>
                      {item?.amount?.toLocaleString()}
                    </Text>
                  </View>
                  <View style={{ width: 120, padding: 5 }}>
                    <Text style={{ fontWeight: 'bold' }}>{item?.senderName}</Text>
                    <Text style={{ color: COLORS.gray }}>From</Text>
                  </View>
                  <View style={{ width: 150, padding: 5 }}>
                    <Text style={{ fontWeight: 'bold' }}>{item?.senderPhone}</Text>
                    <Text style={{ color: COLORS.gray }}>From Phone</Text>
                  </View>
                  <View style={{ width: 120, padding: 5 }}>
                    <Text style={{ fontWeight: 'bold' }}>{item?.receiverName}</Text>
                    <Text style={{ color: COLORS.gray }}>Receiver</Text>
                  </View>
                  <View style={{ width: 150, padding: 5 }}>
                    <Text style={{ fontWeight: 'bold' }}>{item?.receiverPhone}</Text>
                    <Text style={{ color: COLORS.gray }}>Receiver Phone</Text>
                  </View>
                  <View style={{ width: 180, padding: 5 }}>
                    <Text style={{ fontWeight: 'bold' }}>{item?.receiverAddress}</Text>
                    <Text style={{ color: COLORS.gray }}>Receiver Address</Text>
                  </View>
                  <View style={{ width: 150, padding: 5 }}>
                    <Text style={{ fontWeight: 'bold' }}>{item?.bank}</Text>
                    <Text style={{ color: COLORS.gray }}>Receiver Bank</Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          )
        })
      )}
    </View>
  )
}

export default CompletedOrder

const styles = StyleSheet.create({

  card: {
    margin: 5,
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#fff',
    width: 1100,
  },
  iconBox: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: '30%'
  },
  actionText: {
    color: COLORS.primary,
    textAlign: 'center',
    fontSize: 12
  },
  memberActions: {
    backgroundColor: COLORS.primary3,
    width: '30%',
    paddingHorizontal: 8,
    paddingVertical: 15,
    margin: 5,
    borderRadius: 10,
  },
  changeStatus: {
    paddingHorizontal: 8, borderRadius: 5, backgroundColor: COLORS.primary3,
    paddingVertical: 2, margin: 1,
  },
  memberActions2: {
    backgroundColor: COLORS.primary,
    width: '30%',
    padding: 10,
    margin: 5,
    borderRadius: 10
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