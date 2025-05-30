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
  Modal,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/Header";
import { AuthContext } from "../context/AuthContext";
import { generateAxiosInstance } from "../shared/constants";
import { COLORS } from "../theme";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";


const statusColors = {
  pending: "#FFD700",
  approved: "#2196F3",
  completed: "#4CAF50",
  cancelled: "#F44336",
};

const AdminPendingOrder = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [members, setMembers] = useState([]);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [assigningMember, setAssigningMember] = useState(false);

  const ITEMS_PER_PAGE = 10;

  // Fetch members from API
  const fetchMembers = async () => {
    try {
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
    }
  };

  // Fetch pending orders count
  const fetchOrdersCount = async () => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      const res = await axiosInstance.get("/order/pending/count");
      if (res.data.status) {
        setTotalCount(res.data.payload.count);
      }
    } catch (error) {
      console.error("Failed to fetch orders count:", error);
    }
  };

  // Fetch pending orders with pagination
  const fetchOrders = async (page = 1, append = false) => {
    try {
      if (!append) setLoading(true);
      else setLoadingMore(true);

      const axiosInstance = await generateAxiosInstance(true);
      const res = await axiosInstance.get(
        `/order/pending/paginated?page=${page}&limit=${ITEMS_PER_PAGE}`
      );

      if (res.data.status) {
        const newOrders = res.data.payload.orders;
        if (append) {
          setOrders((prev) => [...prev, ...newOrders]);
        } else {
          setOrders(newOrders);
        }
        setTotalCount(res.data.payload.total);
      }
    } catch (error) {
      console.error("Failed to fetch pending orders:", error);
      Alert.alert("Error", "Failed to fetch pending orders. Please try again.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const axiosInstance = await generateAxiosInstance(true);
      const res = await axiosInstance.put("/order/update", {
        id: orderId,
        status: newStatus,
      });

      if (res.data.status) {
        // Remove the order from pending list if status changed from pending
        if (newStatus !== "pending") {
          setOrders((prev) => prev.filter((order) => order.id !== orderId));
          setTotalCount((prev) => prev - 1);
        }
        Alert.alert(
          "Success",
          `Order #${orderId} status updated to ${newStatus}`
        );
      } else {
        Alert.alert(
          "Error",
          res.data.payload || "Failed to update order status"
        );
      }
    } catch (error) {
      console.error("Failed to update order status:", error);
      Alert.alert("Error", "Failed to update order status. Please try again.");
    } finally {
      setUpdatingStatus(false);
      setStatusModalVisible(false);
      setSelectedOrder(null);
    }
  };

  // Handle member assignment
  const handleAssignMember = async () => {
    if (!selectedMemberId) {
      Alert.alert("Error", "Please select a member to assign");
      return;
    }

    try {
      setAssigningMember(true);
      const axiosInstance = await generateAxiosInstance(true);
      const response = await axiosInstance.put("/order/assign-member", {
        orderId: selectedOrder.id,
        memberId: selectedMemberId,
      });

      const data = response.data;

      if (data.status) {
        // Update the local order state
        const selectedMember = members.find(
          (member) => member.id === selectedMemberId
        );
        setOrders((prev) =>
          prev.map((order) =>
            order.id === selectedOrder.id
              ? { ...order, member: selectedMember }
              : order
          )
        );

        Alert.alert("Success", "Member assigned successfully");
        setAssignModalVisible(false);
        setSelectedOrder(null);
        setSelectedMemberId(null);
      } else {
        Alert.alert("Error", data.payload || "Failed to assign member");
      }
    } catch (error) {
      console.error("Error assigning member:", error);
      Alert.alert("Error", "Failed to assign member");
    } finally {
      setAssigningMember(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchOrdersCount();
    fetchMembers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    fetchOrders(1, false);
  };

  const loadMoreOrders = () => {
    if (!loadingMore && orders.length < totalCount) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchOrders(nextPage, true);
    }
  };

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order);
    setStatusModalVisible(true);
  };

  const handleMemberAssignment = (order) => {
    setSelectedOrder(order);
    setSelectedMemberId(order.member?.id || null);
    setAssignModalVisible(true);
  };

  const renderStatusModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={statusModalVisible}
      onRequestClose={() => setStatusModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Update Order Status</Text>
          <Text style={styles.modalSubtitle}>Order #{selectedOrder?.id}</Text>

          <View style={styles.statusButtonsContainer}>
            {["approved", "cancelled"].map((status) => (
              <Pressable
                key={status}
                style={[
                  styles.statusButton,
                  { backgroundColor: statusColors[status] },
                ]}
                onPress={() => updateOrderStatus(selectedOrder.id, status)}
                disabled={updatingStatus}
              >
                <Text style={styles.statusButtonText}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.cancelButton}
            onPress={() => setStatusModalVisible(false)}
            disabled={updatingStatus}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>

          {updatingStatus && (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={{ marginTop: 10 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  const renderAssignModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={assignModalVisible}
      onRequestClose={() => setAssignModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Assign Member</Text>
          <Text style={styles.modalSubtitle}>Order #{selectedOrder?.id}</Text>

          <Text style={styles.currentMemberText}>
            Current: {selectedOrder?.member?.full_name || "Not Assigned"}
          </Text>

          <ScrollView
            style={styles.membersScrollView}
            showsVerticalScrollIndicator={false}
          >
            {members.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.memberItem}
                onPress={() => setSelectedMemberId(member.id)}
              >
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.full_name}</Text>
                  <Text style={styles.memberEmail}>{member.email}</Text>
                  <Text style={styles.memberPhone}>{member.phone_number}</Text>
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
                      selectedMemberId === member.id ? COLORS.primary : "#ccc"
                    }
                  />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.modalButtonsContainer}>
            <Pressable
              style={[
                styles.assignButton,
                { opacity: selectedMemberId ? 1 : 0.5 },
              ]}
              onPress={handleAssignMember}
              disabled={!selectedMemberId || assigningMember}
            >
              <Text style={styles.assignButtonText}>
                {assigningMember ? "Assigning..." : "Assign Member"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.cancelButton}
              onPress={() => {
                setAssignModalVisible(false);
                setSelectedOrder(null);
                setSelectedMemberId(null);
              }}
              disabled={assigningMember}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>

          {assigningMember && (
            <ActivityIndicator
              size="small"
              color={COLORS.primary}
              style={{ marginTop: 10 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  const formatCurrency = (amount, currencyCode) => {
    return `${amount} ${
      currencyCode === 1 ? "USD" : currencyCode === 2 ? "UGX" : ""
    }`;
  };

  return (
    <View style={styles.container}>
      <Header title="Pending Orders" />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingTop: 10,
        }}
      >
        <Pressable onPress={() => navigation.navigate("Home")}>
          <AntDesign name="arrowleft" size={28} color="black" />
        </Pressable>
        <Text style={{ fontSize: 18, marginLeft: 10, fontWeight: "bold" }}>
          Pending Orders
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalCount}</Text>
          <Text style={styles.statLabel}>Pending Orders</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isNearBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 20;
          if (isNearBottom) {
            loadMoreOrders();
          }
        }}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading pending orders...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>🎉 No pending orders!</Text>
            <Text style={styles.emptySubtext}>
              All orders have been processed.
            </Text>
          </View>
        ) : (
          <>
            {orders.map((order) => (
              <View style={styles.card} key={order.id}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Order #{order.id}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: statusColors[order.status] },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {order.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.amountContainer}>
                  <Text style={styles.amount}>
                    {formatCurrency(order.amount, order.fromCurrency)}
                  </Text>
                  <Text style={styles.conversionText}>
                    →{" "}
                    {formatCurrency(
                      order.amount *
                        (order.receiverCurrency === 1 ? 0.00027 : 3700),
                      order.receiverCurrency
                    )}
                  </Text>
                </View>

                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>From:</Text>
                    <Text style={styles.detailValue}>{order.senderName}</Text>
                  </View>
                  <Text style={styles.detailSubValue}>{order.senderPhone}</Text>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>To:</Text>
                    <Text style={styles.detailValue}>{order.receiverName}</Text>
                  </View>
                  <Text style={styles.detailSubValue}>
                    {order.receiverPhone}
                  </Text>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Bank:</Text>
                    <Text style={styles.detailValue}>{order.bank}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Assigned:</Text>
                    <Text style={styles.detailValue}>
                      {order.member?.full_name || "Not Assigned"}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location:</Text>
                    <Text style={styles.detailValue}>
                      {order.receiverPlace}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.date}>
                    {new Date(order.createdAt).toLocaleDateString()} at{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </Text>

                  <View style={styles.actionButtons}>
                    <Pressable
                      style={styles.viewButton}
                      onPress={() =>
                        navigation.navigate("OrderDetails", { order })
                      }
                    >
                      <Text style={styles.viewButtonText}>Details</Text>
                    </Pressable>

                    <Pressable
                      style={styles.assignButton}
                      onPress={() => handleMemberAssignment(order)}
                    >
                      <Text style={styles.assignButtonText}>Assign</Text>
                    </Pressable>

                    <Pressable
                      style={styles.updateButton}
                      onPress={() => handleStatusUpdate(order)}
                    >
                      <Text style={styles.updateButtonText}>Update</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}

            {loadingMore && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadMoreText}>Loading more orders...</Text>
              </View>
            )}

            {orders.length >= totalCount && totalCount > 0 && (
              <Text style={styles.endText}>No more orders to load</Text>
            )}
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {renderStatusModal()}
      {renderAssignModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  statsContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  statCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
    marginTop: 5,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  loadingContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  emptyText: {
    fontSize: 24,
    color: "#666",
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: "#999",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#222",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 12,
  },
  amountContainer: {
    marginBottom: 15,
  },
  amount: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  conversionText: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  detailsContainer: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    width: 70,
  },
  detailValue: {
    fontSize: 14,
    color: "#222",
    fontWeight: "500",
    flex: 1,
  },
  detailSubValue: {
    fontSize: 12,
    color: "#888",
    marginLeft: 70,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  date: {
    fontSize: 12,
    color: "#888",
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  viewButton: {
    backgroundColor: COLORS.primary3,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewButtonText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "500",
  },
  assignButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  assignButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
  },
  updateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "500",
  },
  loadMoreContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  loadMoreText: {
    marginLeft: 10,
    color: "#666",
  },
  endText: {
    textAlign: "center",
    color: "#888",
    paddingVertical: 20,
    fontStyle: "italic",
  },
  bottomSpacing: {
    height: 30,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "90%",
    maxHeight: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  currentMemberText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    textAlign: "center",
  },
  statusButtonsContainer: {
    width: "100%",
    marginBottom: 20,
  },
  statusButton: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  statusButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
  membersScrollView: {
    width: "100%",
    maxHeight: 300,
    marginBottom: 20,
  },
  memberItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
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
    color: "#666",
    marginTop: 2,
  },
  memberPhone: {
    fontSize: 12,
    color: "#666",
    marginTop: 1,
  },
  checkbox: {
    marginLeft: 10,
  },
  modalButtonsContainer: {
    width: "100%",
    gap: 10,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    width: "100%",
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
  },
});

export default AdminPendingOrder;
