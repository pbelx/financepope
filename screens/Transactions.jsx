import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl, Button } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { generateAxiosInstance } from "../shared/constants";
import { Card } from "../components/ui/card";
import Header from "../components/backHeader"; // Assuming you have this component
import Modal from 'react-native-modal'; // Import react-native-modal

const statusColors = {
    pending: "#FFC107",
    completed: "#4CAF50",
    failed: "#F44336",
    assigned: "#2196F3",
};

const Transactions = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [members, setMembers] = useState([ // Placeholder for members list
        { id: 'member1', name: 'John Doe' },
        { id: 'member2', name: 'Jane Smith' },
        { id: 'member3', name: 'Alice Brown' },
        { id: 'member4', name: 'Alice Brown' },
        { id: 'member6', name: 'Steve Anderson' },
    ]);

    const fetchOrders = async () => {
        try {
            const axiosInstance = await generateAxiosInstance(true);
            const response = await axiosInstance.get("/order/all");
            if (response.data.status) {
                setOrders(response.data.payload);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Fetch members (placeholder - implement actual API call)
    const fetchMembers = async () => {
        console.log("Fetched members (placeholder)");
        // In a real app, fetch members from your API.
    };

    useEffect(() => {
        fetchOrders();
        fetchMembers();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchOrders();
    }, []);

    const handleOpenAssignModal = (orderId) => {
        setSelectedOrderId(orderId);
        setIsModalVisible(true);
        console.log("Opening assign modal for order ID:", orderId);
    };

    const handleCloseAssignModal = () => {
        setIsModalVisible(false);
        setSelectedOrderId(null);
    };

    const handleAssignMemberToOrder = async (memberId) => {
        if (!selectedOrderId || !memberId) return;
        console.log(`Assigning member ${memberId} to order ${selectedOrderId}`);

        // --- Actual API call to assign member ---
        // try {
        //   setLoading(true); // Or a specific loading state for assignment
        //   const axiosInstance = await generateAxiosInstance(true);
        //   const response = await axiosInstance.post(`/order/assign-member`, {
        //     orderId: selectedOrderId,
        //     memberId: memberId,
        //   });
        //   if (response.data.status) {
        //     console.log("Member assigned successfully");
        //     fetchOrders(); // Refresh orders to show the change
        //     handleCloseAssignModal();
        //   } else {
        //     console.error("Failed to assign member:", response.data.message);
        //     // Show an error message to the user
        //   }
        // } catch (error) {
        //   console.error("Error assigning member:", error);
        //   // Show an error message to the user
        // } finally {
        //   setLoading(false);
        // }

        // For now, just close the modal and simulate refresh
        handleCloseAssignModal();
        setTimeout(() => {
            const updatedOrders = orders.map(order =>
                order.id === selectedOrderId ? { ...order, member: members.find(m => m.id === memberId) } : order
            );
            setOrders(updatedOrders);
        }, 500);
    };

    const renderOrderItem = ({ item }) => (
        <Card style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Order #{item.id}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColors[item.status.toLowerCase()] || '#808080' }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>
            {/* ... other detail rows ... */}
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>{item.amount}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>From Currency ID:</Text>
                <Text style={styles.detailValue}>{item.fromCurrency}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Sender:</Text>
                <Text style={styles.detailValue}>{item.senderName}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Receiver:</Text>
                <Text style={styles.detailValue}>{item.receiverName}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bank ID/Name:</Text>
                <Text style={styles.detailValue}>{item.bank}</Text>
            </View>
            <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Created:</Text>
                <Text style={styles.detailValue}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            {item.member && item.member.name ? (
                <View style={styles.assignedMemberContainer}>
                    <Text style={styles.assignedMemberText}>Assigned to: {item.member.name}</Text>
                </View>
            ) : (
                <TouchableOpacity
                    style={styles.assignButton}
                    onPress={() => handleOpenAssignModal(item.id)}
                >
                    <Text style={styles.assignButtonText}>Assign Member</Text>
                </TouchableOpacity>
            )}
        </Card>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2a52be" />
                <Text>Loading Transactions...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container1}>
            <Header title="Transactions" canGoBack={true} />
            <View style={styles.container}>
                {orders.length === 0 && !loading ? (
                    <View style={styles.centered}>
                        <Text style={styles.noTransactionsText}>No transactions found.</Text>
                        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
                            <Text style={styles.refreshButtonText}>Tap to Refresh</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={orders}
                        renderItem={renderOrderItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.listContentContainer}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2a52be"]} />
                        }
                    />
                )}
            </View>

            <Modal
                isVisible={isModalVisible}
                onBackdropPress={handleCloseAssignModal}
                onBackButtonPress={handleCloseAssignModal} // For Android back button
                style={styles.bottomSheetModal} // Styles the modal to appear at the bottom
                swipeDirection={['down']} // Optional: allow swipe down to close
                onSwipeComplete={handleCloseAssignModal} // Optional
                useNativeDriverForBackdrop // Recommended for performance
            >
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Assign Member to Order #{selectedOrderId}</Text>
                    {members.length > 0 ? (
                        <FlatList
                            data={members}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item: member }) => (
                                <TouchableOpacity
                                    style={styles.memberItem}
                                    onPress={() => handleAssignMemberToOrder(member.id)}
                                >
                                    <Text style={styles.memberName}>{member.name}</Text>
                                </TouchableOpacity>
                            )}
                            style={{ maxHeight: 200 }} // Limit height if many members
                        />
                    ) : (
                        <Text>No members available to assign.</Text>
                    )}
                    <Button title="Cancel" onPress={handleCloseAssignModal} color="#F44336" />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    // ... your existing styles ...
    container1: {
        flex: 1,
        backgroundColor: '#f4f6fb',
    },
    container: {
        flex: 1,
        backgroundColor: '#f4f6fb',
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    noTransactionsText: {
        fontSize: 18,
        color: '#6c757d',
        marginBottom: 10,
        textAlign: 'center',
    },
    refreshButton: {
        backgroundColor: '#2a52be',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    listContentContainer: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 8,
    },
    orderId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 15,
    },
    statusText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    detailLabel: {
        fontSize: 14,
        color: '#555',
        fontWeight: '500',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: 'bold',
        textAlign: 'right',
        flexShrink: 1,
    },
    assignButton: {
        backgroundColor: '#0033A1',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    assignButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    assignedMemberContainer: {
        marginTop: 12,
        padding: 8,
        backgroundColor: '#e9ecef',
        borderRadius: 6,
    },
    assignedMemberText: {
        fontSize: 14,
        color: '#495057',
        textAlign: 'center',
    },
    // Modal Styles
    bottomSheetModal: { // Style for react-native-modal to appear at bottom
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    memberItem: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        width: '100%',
    },
    memberName: {
        fontSize: 16,
        textAlign: 'center',
    }
});


export default Transactions;