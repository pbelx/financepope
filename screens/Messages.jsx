// Messages.jsx
import React, { useState, useEffect } from "react";
import { View, Text, Pressable, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import gstyles from "../styles";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useNavigation } from "@react-navigation/native";
import { generateAxiosInstance } from "../shared/constants";
import { COLORS } from "../theme";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Messages = () => {
  const navigation = useNavigation();
  const { user } = useContext(AuthContext); // Get current user to filter messages

  const [messages, setMessages] = useState([]); // Renamed from 'setmessages' for consistency
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const axiosInstance = await generateAxiosInstance(true);
      // Fetch all messages for the current user (sent or received)
      // You might need a new backend endpoint for this or filter on frontend
      // For now, let's assume '/messages' endpoint gives all relevant messages to the user
      // or you can create a new route like '/messages/my-messages'
      let res = await axiosInstance.get(`/messages/my-messages`); // Assuming this new route exists

      if (res.data.status) {
        // Group messages by order or by direct chat participant
        const groupedMessages = groupAndSortMessages(res.data.payload, user.id);
        setMessages(groupedMessages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  // Helper to group messages by conversation (order or direct user chat)
  const groupAndSortMessages = (allMsgs, currentUserId) => {
    const conversations = {};

    allMsgs.forEach(msg => {
      let conversationKey;
      let participantId;
      let participantName;
      let isOrderChat = false;

      if (msg.order) {
        // Order-specific chat
        conversationKey = `order-${msg.order.id}`;
        isOrderChat = true;
        // Identify the other participant in the order chat
        if (msg.sender.id === currentUserId) {
            // I am the sender, the receiver is the other participant
            participantId = msg.receiver?.id;
            participantName = msg.receiver?.full_name;
        } else {
            // I am the receiver, the sender is the other participant
            participantId = msg.sender.id;
            participantName = msg.sender.full_name;
        }
      } else {
        // Direct user-to-user chat
        if (msg.sender.id === currentUserId) {
          conversationKey = `user-${msg.receiver.id}`;
          participantId = msg.receiver.id;
          participantName = msg.receiver.full_name;
        } else {
          conversationKey = `user-${msg.sender.id}`;
          participantId = msg.sender.id;
          participantName = msg.sender.full_name;
        }
      }

      if (!conversations[conversationKey]) {
        conversations[conversationKey] = {
          id: conversationKey,
          lastMessage: null,
          participants: [],
          order: msg.order || null,
          targetUserId: participantId,
          targetUserName: participantName,
          isOrderChat: isOrderChat,
        };
      }
      // Update last message if current message is newer
      if (!conversations[conversationKey].lastMessage || new Date(msg.created_at) > new Date(conversations[conversationKey].lastMessage.created_at)) {
        conversations[conversationKey].lastMessage = msg;
      }
    });

    // Convert to array and sort by last message date
    return Object.values(conversations).sort((a, b) =>
      new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
    );
  };

  const renderConversationItem = ({ item }) => {
    const isOrderChat = item.order !== null;
    const chatTitle = isOrderChat
      ? `Order ${item.order.id} Chat with ${item.targetUserName}`
      : `Chat with ${item.targetUserName}`;

    return (
      <Pressable
        style={styles.conversationItem}
        onPress={() =>
          navigation.navigate("Chat", {
            orderId: item.order?.id,
            targetUserId: item.targetUserId,
            targetUserName: item.targetUserName,
            isOrderChat: isOrderChat,
          })
        }
      >
        <View style={styles.conversationContent}>
          <Text style={styles.conversationTitle}>{chatTitle}</Text>
          {item.lastMessage && (
            <>
              <Text style={styles.lastMessageSender}>
                {item.lastMessage.sender.id === user.id ? "You" : item.lastMessage.sender.full_name}:
                <Text style={styles.lastMessageText}> {item.lastMessage.message}</Text>
              </Text>
              <Text style={styles.lastMessageTime}>
                {new Date(item.lastMessage.created_at).toLocaleString()}
              </Text>
            </>
          )}
        </View>
        <AntDesign name="arrowright" size={20} color={COLORS.primary} />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.navigate("Home")}
          style={{ padding: 5 }}
        >
          <AntDesign name="arrowleft" size={32} color="black" />
        </Pressable>
        <Text style={gstyles.gtitle}>Messages</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />
      ) : messages.length > 0 ? (
        <FlatList
          data={messages}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.conversationList}
        />
      ) : (
        <Text style={styles.noMessagesText}>No conversations yet.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversationList: {
    paddingBottom: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    justifyContent: 'space-between',
  },
  conversationContent: {
    flex: 1,
    marginRight: 10,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  lastMessageSender: {
    fontSize: 14,
    color: COLORS.text,
  },
  lastMessageText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  lastMessageTime: {
    fontSize: 12,
    color: COLORS.lightGray,
    marginTop: 3,
  },
  noMessagesText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: COLORS.gray,
  },
});

export default Messages;