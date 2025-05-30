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

const CompletedOrderAdmin = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async (pageNum = 1, limitNum = 10) => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      
      // Use the new completed orders endpoint with pagination
      let res = await axiosInstance.get(`/order/completed/paginated?page=${pageNum}&limit=${limitNum}`);
      
      console.log("completed orders", res.data.payload);
      
      if (res.data.status) {
        const { orders: fetchedOrders, total, totalPages } = res.data.payload;
        setOrders(fetchedOrders);
        setTotalOrders(total);
        setTotalPages(totalPages);
        setPage(pageNum);
        setLoading(false);
      }
    } catch (error) {
      console.log("Error fetching completed orders:", error);
      setLoading(false);
    }
  };

  // Alternative method to fetch all completed orders (without pagination)
  const fetchAllCompletedOrders = async () => {
    try {
      setLoading(true);
      const axiosInstance = await generateAxiosInstance(true);
      
      // Use the new completed orders endpoint
      let res = await axiosInstance.get(`/order/completed/all`);
      
      console.log("all completed orders", res.data.payload);
      
      if (res.data.status) {
        setOrders(res.data.payload);
        setTotalOrders(res.data.payload.length);
        setLoading(false);
      }
    } catch (error) {
      console.log("Error fetching all completed orders:", error);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleLimitChange = (newLimit) => {
    setLimit(parseInt(newLimit));
    fetchOrders(1, parseInt(newLimit));
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      fetchOrders(page + 1, limit);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      fetchOrders(page - 1, limit);
    }
  };

  useEffect(() => {
    // You can choose between paginated or all orders
    fetchOrders(1, 10); // For paginated results
    // fetchAllCompletedOrders(); // For all results at once
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
          <Text style={gstyles.gtitle}>Completed Orders</Text>
        </View>
      </View>

      {/* Pagination Controls */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ marginRight: 10 }}>Show:</Text>
          <View style={{ width: '20%' }}>
            <TextInput 
              placeholder={limit.toString()} 
              style={gstyles.input}
              keyboardType="numeric"
              onChangeText={(text) => {
                if (text && !isNaN(text)) {
                  handleLimitChange(text);
                }
              }}
            />
          </View>
          <Text style={{ marginLeft: 10 }}>per page</Text>
        </View>
        
        {totalOrders > 0 && (
          <Text style={{ color: COLORS.gray }}>
            Total: {totalOrders} orders
          </Text>
        )}
      </View>

      {/* Pagination Navigation */}
      {totalPages > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <TouchableOpacity 
            onPress={handlePreviousPage}
            disabled={page === 1}
            style={[styles.paginationBtn, { opacity: page === 1 ? 0.5 : 1 }]}
          >
            <Text style={styles.paginationText}>Previous</Text>
          </TouchableOpacity>
          
          <Text style={{ fontWeight: 'bold' }}>
            Page {page} of {totalPages}
          </Text>
          
          <TouchableOpacity 
            onPress={handleNextPage}
            disabled={page === totalPages}
            style={[styles.paginationBtn, { opacity: page === totalPages ? 0.5 : 1 }]}
          >
            <Text style={styles.paginationText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ marginTop: 10, color: COLORS.gray }}>Loading completed orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 }}>
          <MaterialIcons name="check-circle" size={48} color={COLORS.gray} />
          <Text style={{ marginTop: 10, color: COLORS.gray, fontSize: 16 }}>No completed orders found</Text>
        </View>
      ) : (
        <ScrollView style={{ marginTop: 10 }}>
          {orders.map((item) => {
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
                    <View style={{ width: 80, padding: 5 }}>
                      <View style={[styles.statusBadge, { backgroundColor: COLORS.success || '#4CAF50' }]}>
                        <Text style={styles.statusText}>Completed</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )
          })}
        </ScrollView>
      )}
    </View>
  )
}

export default CompletedOrderAdmin

const styles = StyleSheet.create({
  card: {
    margin: 5,
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#fff',
    width: 1180, // Increased width to accommodate status badge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
    paddingHorizontal: 8, 
    borderRadius: 5, 
    backgroundColor: COLORS.primary3,
    paddingVertical: 2, 
    margin: 1,
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
  paginationBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  paginationText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});