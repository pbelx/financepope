import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  SafeAreaView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { COLORS } from "../theme";

const statusColors = {
  pending: "#FFD700",
  completed: "#4CAF50",
  failed: "#F44336",
};

const OrderDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { order } = route.params;

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
        </View>

        {/* Transaction Details */}
        <View style={styles.card}>
          <SectionHeader title="Transaction Details" />
          <DetailRow label="Amount" value={order.amount} isHighlight={true} />
          <DetailRow label="From Currency" value={order.fromCurrency} />
          <DetailRow label="Receiver Currency" value={order.receiverCurrency} />
          <DetailRow label="Receiver Place" value={order.receiverPlace} />
          <DetailRow label="Bank" value={order.bank} />
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
            <SectionHeader title="User Information" />
            <DetailRow label="Full Name" value={order.user.full_name} />
            <DetailRow label="Email" value={order.user.email} />
            <DetailRow label="Phone" value={order.user.phone_number} />
            <DetailRow label="Address" value={order.user.address} />
            <DetailRow 
              label="Account Type" 
              value={order.user.is_admin ? "Admin" : order.user.is_member ? "Member" : "User"} 
            />
          </View>
        )}

        {/* Member Information (if available) */}
        {order.member && (
          <View style={styles.card}>
            <SectionHeader title="Member Information" />
            <DetailRow label="Full Name" value={order.member.full_name} />
            <DetailRow label="Email" value={order.member.email} />
            <DetailRow label="Phone" value={order.member.phone_number} />
            <DetailRow label="Address" value={order.member.address} />
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
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
    paddingBottom: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f0f0f0",
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "400",
    flex: 2,
    textAlign: "right",
  },
  highlightValue: {
    color: "#2a52be",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default OrderDetailsScreen;