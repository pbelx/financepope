// ChatScreen.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { generateAxiosInstance } from "../shared/constants";
import { COLORS } from "../theme";
import gstyles from "../styles";

const ChatScreen = () => {
  const route = useRoute();
  // orderId is now an optional parameter.
  const { orderId, targetUserId, targetUserName, isOrderChat } = route.params; // Get orderId, target user info, and chat type
  const { user } = useContext(AuthContext); // Current authenticated user
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchChatMessages();
  }, [orderId, targetUserId]); // Re-fetch if orderId or targetUserId changes

  const fetchChatMessages = async () => {
    setLoading(true);
    try {
      const axiosInstance = await generateAxiosInstance(true);
      let res;
      if (isOrderChat && orderId) {
        // Fetch messages specific to an order
        res = await axiosInstance.get(`/messages/order/${orderId}`); // Existing route
      } else {
        // Fetch messages between two users (for general chat)
        res = await axiosInstance.get(`/messages/chat/${targetUserId}`); // New direct chat route
      }

      if (res.data.status) {
        setMessages(res.data.payload); // Messages are already ordered ASC from backend
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const axiosInstance = await generateAxiosInstance(true);
      const payload = {
        message: newMessage,
        receiverId: targetUserId, // Always send to the target user
      };

      if (isOrderChat && orderId) {
        payload.orderId = orderId; // Include orderId if it's an order-specific chat
      }

      const res = await axiosInstance.post("/messages", payload); // Use the general message creation route
      if (res.data.status) {
        setNewMessage("");
        // Optimistically add the message to the UI
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            id: res.data.payload.id,
            message: newMessage,
            created_at: new Date().toISOString(),
            sender: { id: user.id, full_name: user.full_name },
            receiver: { id: targetUserId, full_name: targetUserName },
            order: isOrderChat ? { id: orderId } : undefined, // Include order info if applicable
          },
        ]);
        if (flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: true });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender.id === user.id;
    return (
      <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}>
        {!isMyMessage && <Text style={styles.senderName}>{item.sender.full_name}</Text>}
        <Text style={isMyMessage ? styles.myMessageText : styles.theirMessageText}>{item.message}</Text>
        <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Adjust as needed
    >
      <Text style={gstyles.gtitle}>
        {isOrderChat ? `Order ${orderId} Chat with ${targetUserName}` : `Chat with ${targetUserName || "User"}`}
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current.scrollToEnd({ animated: true })}
        />
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton} disabled={sending}>
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 15,
    marginBottom: 8,
    maxWidth: "80%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e0e0e0",
    borderBottomLeftRadius: 2,
  },
  myMessageText: {
    color: "#fff",
  },
  theirMessageText: {
    color: "#333",
  },
  senderName: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 3,
  },
  timestamp: {
    fontSize: 10,
    color: "#ccc",
    marginTop: 5,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100, // Limit height for multiline input
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatScreen;