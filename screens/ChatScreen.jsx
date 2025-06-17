import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { generateAxiosInstance } from "../shared/constants";
import { COLORS } from "../theme";
import gstyles from "../styles";

const ChatScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId, targetUserId, targetUserName, isOrderChat, chatType } = route.params || {};
  const { user } = useContext(AuthContext);
  
  // State management
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showAdminSelector, setShowAdminSelector] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null); // This is the key state
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const flatListRef = useRef(null);

  // --- MODIFICATION START ---

  // Determine current chat target - prioritize selectedAdmin if available, then route params
  const currentTargetUserId = selectedAdmin?.id || targetUserId;
  const currentTargetUserName = selectedAdmin?.full_name || selectedAdmin?.email || targetUserName;

  // Initialize based on chat type and route params
  useEffect(() => {
    // For logging initial parameters for order chats
    if (isOrderChat && orderId) {
      console.log('[ChatScreen] Initializing for ORDER CHAT. Route Params:',
        JSON.parse(JSON.stringify({ orderId, targetUserId, targetUserName, isOrderChat, chatType }))
      );
    }

    // If chatType is 'admin_select' or no targetUserId is provided for a direct chat,
    // explicitly show the admin selector and fetch admins.
    if (chatType === 'admin_select' || (!targetUserId && !isOrderChat)) {
      console.log('[ChatScreen] Showing admin selector, fetching admins...');
      setShowAdminSelector(true);
      fetchAdmins();
    } else if (targetUserId) {
      // If targetUserId is provided, set it as the initially selected admin
      const initialAdmin = { id: targetUserId, full_name: targetUserName || 'N/A' };
      console.log('[ChatScreen] Setting selected admin from targetUserId:', JSON.parse(JSON.stringify(initialAdmin)));
      setSelectedAdmin(initialAdmin);
      setShowAdminSelector(false);
      // Fetch messages immediately for this initial target
      fetchChatMessages(targetUserId); 
    }
  }, [chatType, targetUserId, orderId, isOrderChat, targetUserName]); // Added orderId, targetUserName to dependencies for completeness of logging and initial setup.

  // Fetch messages when selectedAdmin changes (or other relevant chat parameters)
  // This useEffect replaces the previous one that depended on currentTargetUserId directly,
  // ensuring it reacts to selection changes.
  useEffect(() => {
    if (selectedAdmin?.id && !showAdminSelector) { // Only fetch if an admin is selected AND selector is not shown
      //console.log('Selected admin changed or screen focused, fetching messages for:', selectedAdmin.id);
      fetchChatMessages(selectedAdmin.id); 
    } else if (!selectedAdmin?.id && !targetUserId && !isOrderChat && !showAdminSelector) {
        // This handles cases where no admin is selected and it's not an order chat,
        // and we aren't showing the admin selector (meaning it should have been chosen).
        // This might indicate a navigation issue or a state where no chat partner is defined.
        // You might want to navigate back or show an error here.
        console.log('No admin selected and not an order chat, no messages to fetch.');
        setMessages([]);
    }
  }, [selectedAdmin, orderId, isOrderChat, showAdminSelector]);

  // Refresh on screen focus - ensure it uses the *currently selected* admin
  useFocusEffect(
    useCallback(() => {
      // Only refresh if an admin is selected and we're not in the selector view
      if (selectedAdmin?.id && !showAdminSelector) {
      //  console.log('Screen focused, refreshing messages for:', selectedAdmin.id);
        fetchChatMessages(selectedAdmin.id);
      }
    }, [selectedAdmin, showAdminSelector]) // Dependency on selectedAdmin
  );

  // --- MODIFICATION END ---


  const fetchAdmins = async () => {
    console.log('Fetching admins...');
    setLoadingAdmins(true);
    try {
      const axiosInstance = await generateAxiosInstance(true);
      
      // First try to get admins specifically
      try {
        const res = await axiosInstance.get("/users/admins");
      //  console.log('Admin endpoint response:', res.data);
        if (res.data.status && res.data.payload) {
          // Filter out current user from admin list
          const filteredAdmins = res.data.payload.filter(admin => admin.id !== user.id);
         // console.log('Filtered admins:', filteredAdmins);
          setAdmins(filteredAdmins);
          return;
        }
      } catch (adminError) {
       // console.log("Admin endpoint error:", adminError);
        console.log("Admin endpoint not available, trying members...");
      }

      // Fallback: get all members and filter for admins
      try {
        const res = await axiosInstance.get("/users/members");
     //   console.log('Members endpoint response:', res.data);
        if (res.data.status && res.data.payload) {
          // Filter for admins and exclude current user
          const adminUsers = res.data.payload.filter(u => {
            const isAdmin = u.role === 'admin' || 
                           u.is_admin === true || 
                           u.user_type === 'admin';
            const isNotCurrentUser = u.id !== user.id;
            return isAdmin && isNotCurrentUser;
          });
         // console.log('Filtered admin users:', adminUsers);
          setAdmins(adminUsers);
        }
      } catch (membersError) {
      //  console.error("Members endpoint error:", membersError);
        throw membersError;
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      Alert.alert("Error", "Failed to load admins. Please try again.");
      setAdmins([]); // Set empty array on error
    } finally {
      setLoadingAdmins(false);
    }
  };

  const fetchChatMessages = async (explicitTargetUserId) => {
    // Always use the explicitTargetUserId passed to this function.
    // This makes the function more predictable and decouples it from direct state changes.
    const targetId = explicitTargetUserId;
    
    if (!targetId) {
      console.log('No target user ID for fetching messages');
      setMessages([]); // Clear messages if no target
      return;
    }
    
    // console.log('Fetching chat messages for:', { 
    //   targetId, 
    //   orderId, 
    //   isOrderChat,
    //   // For logging, use selectedAdmin if available, for context
    //   selectedAdminId: selectedAdmin?.id, 
    //   selectedAdminName: selectedAdmin?.full_name || selectedAdmin?.email
    // });
    
    setLoading(true);
    try {
      const axiosInstance = await generateAxiosInstance(true);
      let res;
      let filteredMessages = [];
      
      if (isOrderChat && orderId) {
        // Order-specific chat - client-side filtering is necessary
      //  console.log('Fetching order chat messages for order:', orderId);
        res = await axiosInstance.get(`/messages/chat/${orderId}`);
        
        if (res.data.status && res.data.payload) {
          console.log('[ChatScreen] Raw order messages before new filtering:', res.data.payload.length, 'for order ID:', orderId);
          filteredMessages = res.data.payload.filter(message => {
            const isFromCurrentUser = message.sender?.id === user.id;
            
            // Check if the message is from an admin and directed to the current user.
            // Assumes message.sender_type is reliably 'ADMIN' for admin messages.
            // And message.recipient.id is correctly set for admin replies to the user.
            const isFromAdminToCurrentUser = message.sender_type === 'ADMIN' && message.recipient?.id === user.id;

            // Include the message if:
            // 1. It's from the current user (they should see all their messages for this order context).
            // 2. It's from an admin to the current user.
            const shouldInclude = isFromCurrentUser || isFromAdminToCurrentUser;
            
            if (!shouldInclude && message.sender_type === 'ADMIN') {
                console.log('[ChatScreen] Admin message NOT included (recipient not current user):',
                    JSON.parse(JSON.stringify({
                        messageId: message.id,
                        senderId: message.sender?.id,
                        senderType: message.sender_type,
                        recipientId: message.recipient?.id,
                        currentUserId: user.id
                    }))
                );
            }

            return shouldInclude;
          });
          console.log('[ChatScreen] Filtered order messages (new logic - any admin to user):', filteredMessages.length);
        }
      } else {
        // Direct user chat - this should already be filtered by the backend
        console.log('Fetching direct chat messages with user (using /messages/user/):', targetId);
        res = await axiosInstance.get(`/messages/user/${targetId}`);
        
        if (res.data.status && res.data.payload) {
          console.log('Raw direct messages from backend (assuming pre-filtered):', res.data.payload.length);
          // Keeping this client-side filter as a robustness check, though backend should handle it.
          filteredMessages = res.data.payload.filter(message => {
            const isFromCurrentUser = message.sender?.id === user.id;
            const isToCurrentUser = message.recipient?.id === user.id;
            const isFromSelectedAdmin = message.sender?.id === targetId; // Use targetId here
            const isToSelectedAdmin = message.recipient?.id === targetId; // Use targetId here
            
            const shouldInclude = (isFromCurrentUser && isToSelectedAdmin) || 
                                 (isFromSelectedAdmin && isToCurrentUser);
            
            return shouldInclude;
          });
          // If you are confident in your backend's direct chat filtering:
          // filteredMessages = res.data.payload;
          console.log('Filtered direct messages:', filteredMessages.length);
        }
      }

      console.log('Final filtered messages for target', targetId, ':', filteredMessages.length);
      setMessages(filteredMessages);
      
      // Mark messages as read
      if (!isOrderChat) { // Only for direct chats
        markMessagesAsRead(targetId);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
      // Don't show alert for every fetch error, just log it
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async (targetId) => {
    const readTargetId = targetId || currentTargetUserId; // Use targetId if provided, else currentTarget
    if (!readTargetId) return; // Guard against no target ID

    try {
      const axiosInstance = await generateAxiosInstance(true);
      if (isOrderChat && orderId) {
        await axiosInstance.patch(`/messages/read/${orderId}`);
      } else if (readTargetId) {
        await axiosInstance.patch(`/messages/read/user/${readTargetId}`);
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentTargetUserId) {
      console.log('Cannot send message:', { 
        hasMessage: !!newMessage.trim(), 
        hasTarget: !!currentTargetUserId 
      });
      return;
    }

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    console.log('Sending message:', { messageText, currentTargetUserId, isOrderChat, orderId });

    try {
      const axiosInstance = await generateAxiosInstance(true);
      const payload = {
        message: messageText,
        recipientId: currentTargetUserId,
      };

      if (isOrderChat && orderId) {
        payload.orderId = orderId;
      }

      // Use appropriate endpoint based on chat type
      const endpoint = isOrderChat ? "/messages" : "/messages/direct";
      console.log('Using endpoint:', endpoint, 'with payload:', payload);
      
      const res = await axiosInstance.post(endpoint, payload);
      console.log('Send message response:', res.data);

      if (res.data.status) {
        // Add message optimistically to UI
        const optimisticMessage = {
          id: Date.now(), // temporary ID
          message: messageText,
          created_at: new Date().toISOString(),
          sender: { 
            id: user.id, 
            full_name: user.full_name || user.email 
          },
          recipient: { 
            id: currentTargetUserId, 
            full_name: currentTargetUserName 
          },
          is_read: false,
          sender_type: 'USER'
        };

        setMessages(prev => [...prev, optimisticMessage]);
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        console.log('Failed to send message:', res.data);
        Alert.alert("Error", res.data.message || "Failed to send message. Please try again.");
        setNewMessage(messageText);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
      // Restore message text on error
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const selectAdmin = (admin) => {
    console.log('[ChatScreen] Admin selected via selectAdmin function:', JSON.parse(JSON.stringify(admin)), '. Is this an order chat?', isOrderChat);
    // console.log('Selecting admin:', admin); // Original log, can be kept or removed
    // console.log('Previous admin:', selectedAdmin); // Original log, can be kept or removed
    
    // Clear messages immediately
    setMessages([]);
    setLoading(true); // Show loading while switching
    
    // Update selected admin and hide selector
    setSelectedAdmin(admin);
    setShowAdminSelector(false);
    
    // No need for a setTimeout here. The useEffect that watches `selectedAdmin`
    // will now correctly trigger `fetchChatMessages` when `selectedAdmin` updates.
    // The previous `fetchChatMessages(admin.id)` was a good attempt, but the `useEffect`
    // is the more React-idiomatic way to handle state-driven side effects.
  };

  const showAdminList = () => {
    console.log('Showing admin list');
    setShowAdminSelector(true);
    if (admins.length === 0) {
      fetchAdmins(); // Refetch if empty
    }
  };

  const renderMessage = ({ item }) => {
    if (!item.sender) {
      console.log('Message missing sender:', item);
      return null;
    }
    
    const isMyMessage = item.sender.id === user.id;
    const senderName = item.sender.full_name || item.sender.email || 'Unknown';
    
    return (
      <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
        {!isMyMessage && (
          <Text style={styles.senderName}>{senderName}</Text>
        )}
        <Text style={isMyMessage ? styles.myMessageText : styles.theirMessageText}>
          {item.message}
        </Text>
        <Text style={[styles.timestamp, isMyMessage ? styles.myTimestamp : styles.theirTimestamp]}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    );
  };

  const renderAdminItem = ({ item }) => {
    console.log('Rendering admin item:', item);
    const isCurrentlySelected = selectedAdmin?.id === item.id;
    
    return (
      <TouchableOpacity
        style={[
          styles.adminItem,
          isCurrentlySelected && styles.selectedAdminItem
        ]}
        onPress={() => selectAdmin(item)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.adminAvatar,
          isCurrentlySelected && styles.selectedAdminAvatar
        ]}>
          <Text style={[
            styles.adminAvatarText,
            isCurrentlySelected && styles.selectedAdminAvatarText
          ]}>
            {(item.full_name || item.email || 'A').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.adminInfo}>
          <Text style={[
            styles.adminName,
            isCurrentlySelected && styles.selectedAdminName
          ]}>
            {item.full_name || item.email}
          </Text>
          <Text style={styles.adminEmail}>{item.email}</Text>
          {item.role && <Text style={styles.adminRole}>{item.role}</Text>}
          {item.is_admin && <Text style={styles.adminRole}>Admin</Text>}
          {isCurrentlySelected && (
            <Text style={styles.currentlyChattingText}>Currently chatting</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.gray} />
      </TouchableOpacity>
    );
  };

  // Admin Selection Screen
  if (showAdminSelector) {
    console.log('Rendering admin selector with admins:', admins);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <Text style={[gstyles.gtitle, { flex: 1 }]}>Select Admin</Text>
        </View>
        
        <View style={styles.adminSelectorContainer}>
          {loadingAdmins ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading admins...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.selectorTitle}>Choose an admin to chat with:</Text>
              <FlatList
                data={admins}
                renderItem={renderAdminItem}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.adminsList}
                showsVerticalScrollIndicator={false}
              />
              {admins.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="people-outline" size={64} color={COLORS.gray} />
                  <Text style={styles.noAdminsText}>No admins available</Text>
                  <Text style={styles.noAdminsSubtext}>Please contact support if you need assistance</Text>
                  <TouchableOpacity 
                    onPress={fetchAdmins} 
                    style={styles.retryButton}
                  >
                    <Text style={styles.retryButtonText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Main Chat Interface
  console.log('Rendering main chat interface with target:', currentTargetUserName);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        
          <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {isOrderChat ? `Order #${orderId}` : 'Chat'}
          </Text>
          {currentTargetUserName ? (
            <View style={styles.adminIndicator}>
              <View style={styles.adminStatusDot} />
              <Text style={styles.headerSubtitle} numberOfLines={1}>
                {currentTargetUserName}
              </Text>
            </View>
          ) : (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              Select an admin to chat
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={showAdminList} style={styles.headerButton}>
          <Ionicons name="people" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Ionicons name="chatbubbles-outline" size={64} color={COLORS.gray} />
                <Text style={styles.emptyChatText}>Start a conversation</Text>
                <Text style={styles.emptyChatSubtext}>Send a message to begin chatting</Text>
              </View>
            }
          />
        )}
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type your message..."
            multiline
            maxLength={1000}
            editable={!sending && !!currentTargetUserId} // Disable input if no target
          />
          <TouchableOpacity 
            onPress={sendMessage} 
            style={[
              styles.sendButton, 
              (!newMessage.trim() || sending || !currentTargetUserId) && styles.sendButtonDisabled
            ]} 
            disabled={!newMessage.trim() || sending || !currentTargetUserId}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 2,
  },
  adminIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  adminStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#28a745",
    marginRight: 6,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  chatContainer: {
    flex: 1,
  },
  adminSelectorContainer: {
    flex: 1,
    padding: 20,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    color: "#1a1a1a",
  },
  adminsList: {
    paddingBottom: 20,
  },
  adminItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  adminAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  adminAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  adminInfo: {
    flex: 1,
  },
  adminName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  adminEmail: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 2,
  },
  adminRole: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
    textTransform: "capitalize",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  noAdminsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6c757d",
    marginTop: 16,
  },
  noAdminsSubtext: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexGrow: 1,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: "85%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  myMessageText: {
    color: "#fff",
    fontSize: 16,
  },
  theirMessageText: {
    color: "#1a1a1a",
    fontSize: 16,
  },
  senderName: {
    fontSize: 12,
    color: "#6c757d",
    marginBottom: 4,
    fontWeight: "500",
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
  },
  myTimestamp: {
    color: "rgba(255,255,255,0.7)",
    alignSelf: "flex-end",
  },
  theirTimestamp: {
    color: "#6c757d",
    alignSelf: "flex-start",
  },
  emptyChat: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyChatText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6c757d",
    marginTop: 16,
  },
  emptyChatSubtext: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e1e5e9",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e1e5e9",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    maxHeight: 100,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  // Selection styles
  selectedAdminItem: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: "#f0f8ff",
  },
  selectedAdminAvatar: {
    backgroundColor: COLORS.primary,
    transform: [{ scale: 1.1 }],
  },
  selectedAdminAvatarText: {
    fontWeight: "700",
  },
  selectedAdminName: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  currentlyChattingText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: "600",
    marginTop: 4,
    fontStyle: "italic",
  },
});

export default ChatScreen;