import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { generateAxiosInstance } from "../shared/constants";

const FloatScreen = () => {
  const route = useRoute();
  const { userId } = route.params;
  const { token, user } = useContext(AuthContext);
  
  const [pendingCollections, setPendingCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [error, setError] = useState(null);

  // Fetch pending collections for the user
  const fetchPendingCollections = async () => {
    try {
      setError(null);
      const axiosInstance = await generateAxiosInstance(true);
      const response = await axiosInstance.get(`/collections/member/${userId}`);

      const data = response.data;
      
      // Handle the consistent API response structure: {status: boolean, payload: array}
      if (data.status && data.payload) {
        // Filter only pending collections
        const pending = data.payload.filter(collection => collection.status === 'pending');
        setPendingCollections(pending);
      } else {
        throw new Error('Failed to fetch collections - invalid response');
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      setError('Failed to load collections. Please try again.');
      Alert.alert('Error', 'Network error occurred while fetching collections');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch user balance
  const fetchBalance = async () => {
    try {
      const axiosInstance = await generateAxiosInstance(true);
      const response = await axiosInstance.get(`/collections/balance/${userId}`);

      const data = response.data;
      
      if (data.status && data.payload) {
        setBalance(data.payload.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      // Don't show alert for balance fetch errors as it's secondary functionality
    }
  };

  // Accept/Confirm collection
  const handleAcceptFloat = async (collectionId) => {
    setProcessingId(collectionId);
    
    try {
      const axiosInstance = await generateAxiosInstance(true);
      const response = await axiosInstance.put(`/collections/${collectionId}/confirm`, {
        userId
      });

      const data = response.data;
      
      if (data.status) {
        Alert.alert('Success', 'Float accepted successfully!', [
          { text: 'OK', onPress: () => {
            fetchPendingCollections(); // Refresh the list
            fetchBalance(); // Update balance
          }}
        ]);
      } else {
        throw new Error('Failed to accept float');
      }
    } catch (error) {
      console.error('Error accepting float:', error);
      Alert.alert('Error', error.message || 'Failed to accept float');
    } finally {
      setProcessingId(null);
    }
  };

  // Reject collection
  const handleRejectFloat = async (collectionId) => {
    Alert.alert(
      'Confirm Rejection',
      'Are you sure you want to reject this float?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingId(collectionId);
            
            try {
              const axiosInstance = await generateAxiosInstance(true);
              const response = await axiosInstance.put(`/collections/${collectionId}/reject`, {
                userId
              });

              const data = response.data;
              
              if (data.status) {
                Alert.alert('Success', 'Float rejected successfully!', [
                  { text: 'OK', onPress: () => fetchPendingCollections() }
                ]);
              } else {
                throw new Error('Failed to reject float');
              }
            } catch (error) {
              console.error('Error rejecting float:', error);
              Alert.alert('Error', error.message || 'Failed to reject float');
            } finally {
              setProcessingId(null);
            }
          },
        },
      ]
    );
  };

  // Refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingCollections();
    fetchBalance();
  };

  // Focus effect to refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (token && userId) {
        fetchPendingCollections();
        fetchBalance();
      }
    }, [userId, token])
  );

  // Format currency display
  const formatCurrency = (amount, currency) => {
    if (!currency) return `${amount.toFixed(2)}`;
    
    // Handle different currency symbols properly
    const symbol = currency.symbol || currency.code || '';
    return `${symbol} ${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Render individual float item
  const renderFloatItem = ({ item }) => (
    <View style={styles.floatItem}>
      <View style={styles.floatHeader}>
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>{item.currency?.symbol || item.currency?.code || ''
              }</Text>
          <Text style={styles.amount}>{item.amount.toLocaleString(undefined, { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}</Text>
        </View>
        <Text style={styles.currency}>{item.currency?.name || 'Unknown Currency'}</Text>
      </View>
      
      <View style={styles.floatDetails}>
        <Text style={styles.detailText}>
          Currency: {item.currency?.code || 'N/A'}
        </Text>
        <Text style={styles.detailText}>
          Rate per USD: {item.currency?.rate_per_dollar ? `${item.currency.rate_per_dollar.toLocaleString()}` : 'N/A'}
        </Text>
        <Text style={styles.detailText}>
          Date: {new Date(item.created_at).toLocaleDateString()}
        </Text>
        <Text style={styles.detailText}>
          Time: {new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.button, styles.acceptButton]}
          onPress={() => handleAcceptFloat(item.id)}
          disabled={processingId === item.id}
        >
          {processingId === item.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.acceptButtonText}>Accept</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.rejectButton]}
          onPress={() => handleRejectFloat(item.id)}
          disabled={processingId === item.id}
        >
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Balance Modal
  const BalanceModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showBalanceModal}
      onRequestClose={() => setShowBalanceModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Current Balance</Text>
          <Text style={styles.balanceAmount}>
            ${balance?.toFixed(2) || '0.00'}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowBalanceModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading || !token) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading floats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Float Management</Text>
        <TouchableOpacity
          style={styles.balanceButton}
          onPress={() => setShowBalanceModal(true)}
        >
          <Text style={styles.balanceButtonText}>View Balance</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => {
            setError(null);
            fetchPendingCollections();
          }}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {pendingCollections.length === 0 && !error ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No pending floats</Text>
          <Text style={styles.emptySubtext}>
            You have no floats waiting for approval
          </Text>
        </View>
      ) : (
        <FlatList
          data={pendingCollections}
          renderItem={renderFloatItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <BalanceModal />
    </SafeAreaView>
  );
};

export default FloatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  balanceButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  balanceButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 20,
  },
  floatItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  floatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  currency: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  floatDetails: {
    marginBottom: 20,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  acceptButton: {
    backgroundColor: '#28a745',
    marginRight: 10,
  },
  rejectButton: {
    backgroundColor: '#dc3545',
    marginLeft: 10,
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 250,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});