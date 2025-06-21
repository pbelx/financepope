<template>
  <v-container fluid class="admin-messages-page-vuetify" style="height: calc(100vh - 100px);">
    <v-row style="height: 100%;">
      <!-- Section 1: Conversation List -->
      <v-col cols="12" md="4" class="conversation-list-col">
        <v-card class="fill-height d-flex flex-column">
          <v-card-title class="text-h5">Conversations</v-card-title>
          <v-divider></v-divider>
          <v-card-text class="flex-grow-1 overflow-y-auto pa-0">
            <div v-if="loadingConversations" class="d-flex justify-center align-center fill-height">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </div>
            <v-alert v-else-if="conversations.length === 0" type="info" class="ma-3">
              No active conversations with unread messages.
            </v-alert>
            <v-list v-else two-line>
              <template v-for="(convo, index) in conversations" :key="convo.id">
                <v-list-item
                  @click="selectConversation(convo)"
                  :class="{ 'blue lighten-4': selectedConversation && selectedConversation.id === convo.id }"
                  link
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      <span v-if="convo.isDirectChat">Direct Chat with {{ convo.user.name }}</span>
                      <span v-else-if="convo.order">Order ID: {{ convo.order.id }}</span>
                      <span v-else>Conversation</span> <!-- Fallback -->
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ convo.user.name }} ({{ convo.user.email }})
                    </v-list-item-subtitle>
                    <v-list-item-subtitle class="text--secondary text-truncate">
                      {{ convo.lastMessage.snippet }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-list-item-action-text>
                      {{ formatTimestamp(convo.lastMessage.timestamp) }}
                    </v-list-item-action-text>
                     <v-badge
                        v-if="convo.unreadCount > 0"
                        color="red"
                        :content="convo.unreadCount"
                        inline
                        class="mt-1"
                      ></v-badge>
                  </v-list-item-action>
                </v-list-item>
                <v-divider :key="'divider-' + convo.id" v-if="index < conversations.length - 1"></v-divider>
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Section 2: Chat Detail View -->
      <v-col cols="12" md="8" class="chat-detail-col">
        <v-card class="fill-height d-flex flex-column">
          <div v-if="!selectedConversation" class="d-flex justify-center align-center fill-height">
            <v-alert type="info" class="ma-3">
              Select a conversation to view messages.
            </v-alert>
          </div>
          <template v-else>
            <v-card-title class="text-h6">
              <span v-if="selectedConversation.isDirectChat">Chat with {{ selectedConversation.user.name }}</span>
              <span v-else-if="selectedConversation.order">Chat with {{ selectedConversation.user.name }} (Order: {{ selectedConversation.order.id }})</span>
              <span v-else>Chat with {{ selectedConversation.user.name }}</span> <!-- Fallback if somehow order is null but not direct -->
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="flex-grow-1 overflow-y-auto pa-3 chat-history-vuetify">
              <div v-if="loadingChatHistory" class="d-flex justify-center align-center fill-height">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </div>
              <div v-else>
                <div
                  v-for="message in chatHistory"
                  :key="message.id"
                  class="message-container my-2"
                  :class="message.sender_type === 'ADMIN' ? 'd-flex justify-end' : 'd-flex justify-start'"
                >
                  <v-sheet
                    rounded="lg"
                    class="pa-2 message-bubble"
                    :color="message.sender_type === 'ADMIN' ? 'light-blue lighten-4' : 'grey lighten-3'"
                    max-width="80%"
                  >
                    <p class="font-weight-bold mb-1 text--primary">{{ message.sender_name }}:</p>
                    <p class="mb-1 text--primary">{{ message.message }}</p>
                    <p class="text-caption text--secondary text-right mb-0">
                      {{ formatTimestamp(message.created_at) }}
                    </p>
                  </v-sheet>
                </div>
              </div>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions class="pa-3">
              <v-textarea
                v-model="replyMessage"
                outlined
                rows="2"
                dense
                hide-details
                placeholder="Type your reply..."
                class="mr-2"
                no-resize
              ></v-textarea>
              <v-btn
                color="primary"
                @click="sendReply"
                :disabled="sendingReply || !replyMessage.trim()"
                :loading="sendingReply"
                large
              >
                Send
                <v-icon right>mdi-send</v-icon>
              </v-btn>
            </v-card-actions>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'AdminMessagesPage',
  data() {
    return {
      loadingConversations: false,
      conversations: [], // Stores grouped conversations with unread messages
      selectedConversation: null, // Stores the currently selected conversation object
      loadingChatHistory: false,
      chatHistory: [], // Stores messages for the selected conversation
      replyMessage: '',
      sendingReply: false,
      // Admin user ID from auth state
      adminUserId: null,
      rawInitialMessages: [],
    };
  },
  methods: {
async fetchConversations() {
    this.loadingConversations = true;
    this.rawInitialMessages = [];
    try {
      const response = await this.$api.get('/messages');
      if (response.data && response.data.status) {
        const messagesPayload = response.data.payload || [];
        this.rawInitialMessages = messagesPayload;
        this.processAndGroupMessages(messagesPayload);
      } else {
        console.error('Failed to fetch conversations: API returned unsuccessful status', response.data);
        this.$toast.error('Failed to load conversations. ' + (response.data?.payload || 'Unknown API error.'));
        this.conversations = [];
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        this.$toast.error(`Failed to fetch conversations: ${error.response.data?.payload || error.message}`);
      } else {
        this.$toast.error('Failed to fetch conversations: ' + error.message);
      }
      this.conversations = [];
    } finally {
      this.loadingConversations = false;
    }
  },

 processAndGroupMessages(messages) {
    const groups = messages.reduce((acc, message) => {
      let conversationKey;
      
      if (message.order && message.order.id) {
        // Order-based conversation
        conversationKey = `order-${message.order.id}`;
      } else {
        // Direct chat - backend uses uppercase enum values: USER, ADMIN, SYSTEM
        if (message.sender_type === 'USER') {
          if (!message.sender || !message.sender.id) {
            console.error('Skipping message due to missing sender ID for direct user message:', message);
            return acc;
          }
          conversationKey = `user-${message.sender.id}`;
        } else if (message.sender_type === 'ADMIN') {
          if (!message.recipient || !message.recipient.id) {
            console.error('Skipping message due to missing recipient ID for direct admin message:', message);
            return acc;
          }
          conversationKey = `user-${message.recipient.id}`;
        } else {
          console.error('Skipping message due to unknown sender_type:', message.sender_type, message);
          return acc;
        }
      }

      if (!acc[conversationKey]) {
        acc[conversationKey] = [];
      }
      acc[conversationKey].push(message);
      return acc;
    }, {});

    const processedConversations = Object.entries(groups).map(([key, groupMessages]) => {
      groupMessages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      const lastMessageInGroup = groupMessages[0];
      const isDirect = !lastMessageInGroup.order;

      let memberUser = { id: null, name: 'Unknown User', email: 'N/A' };

      if (lastMessageInGroup.order && lastMessageInGroup.order.user) {
        // For order conversations, use the order.user (the person who created the order)
        memberUser = {
          id: lastMessageInGroup.order.user.id,
          name: lastMessageInGroup.order.user.full_name || lastMessageInGroup.order.user.name || 'Unknown User',
          email: lastMessageInGroup.order.user.email || 'N/A',
        };
      } else if (isDirect) {
        // For direct chats, determine the non-admin user
        if (lastMessageInGroup.sender_type === 'USER' && lastMessageInGroup.sender) {
          memberUser = {
            id: lastMessageInGroup.sender.id,
            name: lastMessageInGroup.sender.full_name || lastMessageInGroup.sender.name || 'Unknown User',
            email: lastMessageInGroup.sender.email || 'N/A',
          };
        } else if (lastMessageInGroup.sender_type === 'ADMIN' && lastMessageInGroup.recipient) {
          memberUser = {
            id: lastMessageInGroup.recipient.id,
            name: lastMessageInGroup.recipient.full_name || lastMessageInGroup.recipient.name || 'Unknown User',
            email: lastMessageInGroup.recipient.email || 'N/A',
          };
        }
      }

      return {
        id: key,
        order: lastMessageInGroup.order,
        isDirectChat: isDirect,
        user: memberUser,
        lastMessage: {
          id: lastMessageInGroup.id,
          snippet: lastMessageInGroup.message.substring(0, 50) + (lastMessageInGroup.message.length > 50 ? '...' : ''),
          timestamp: lastMessageInGroup.created_at,
          sender_type: lastMessageInGroup.sender_type,
          sender_name: lastMessageInGroup.sender_name,
          recipient_name: lastMessageInGroup.recipient_name,
        },
        unreadCount: this.calculateUnreadCount(groupMessages),
        // Additional metadata for better display
        orderAmount: lastMessageInGroup.order?.amount,
        orderStatus: lastMessageInGroup.order?.status,
      };
    });

    // Sort conversations by the timestamp of their last message in descending order
    processedConversations.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));

    this.conversations = processedConversations;
    console.log('Processed conversations:', this.conversations);
  },
  calculateUnreadCount(groupMessages) {
    const currentAdminUserId = this.adminUserId;
    if (!currentAdminUserId) {
      console.warn("Admin user ID not available, unread count may not be accurate");
      return 0;
    }
    
    return groupMessages.filter(msg => 
      !msg.is_read && 
      msg.recipient && 
      msg.recipient.id === currentAdminUserId
    ).length;
  },


 async selectConversation(conversation) {
    console.log('Selected conversation:', conversation);
    this.selectedConversation = conversation;
    this.chatHistory = [];
    this.loadingChatHistory = true;

    try {
      if (conversation.isDirectChat) {
        if (!conversation.user || !conversation.user.id) {
          console.error('Cannot fetch direct chat: Member ID is missing.', conversation);
          this.$toast.error('Cannot load direct chat: User details are incomplete.');
          this.chatHistory = [];
          return;
        }
        
        console.log(`Fetching full history for direct chat with user ${conversation.user.id}`);
        const response = await this.$api.get(`/messages/user/${conversation.user.id}`);
        
        if (response.data && response.data.status) {
          this.chatHistory = (response.data.payload || []).sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
          );
        } else {
          console.error('Failed to fetch direct chat history:', response.data);
          this.$toast.error('Failed to load direct chat history. ' + (response.data?.payload || 'Unknown API error.'));
          this.chatHistory = [];
        }
      } else if (conversation.order && conversation.order.id) {
        // For order chats, call the existing fetchChatHistory method
        console.log(`Fetching order chat history for order ${conversation.order.id}`);
        await this.fetchChatHistory(conversation.order.id);
        return; // fetchChatHistory handles its own loading state
      } else {
        console.warn('Invalid conversation selected:', conversation);
        this.$toast.error('Cannot load conversation: Invalid conversation data.');
        this.chatHistory = [];
      }
    } catch (error) {
      console.error('Error in selectConversation:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        this.$toast.error(`Failed to load conversation: ${error.response.data?.message || error.response.data?.payload || error.message}`);
      } else {
        this.$toast.error('Failed to load conversation: ' + error.message);
      }
      this.chatHistory = [];
    } finally {
      this.loadingChatHistory = false;
    }
  },

   // Helper method to get conversation display name
  getConversationDisplayName(conversation) {
    if (conversation.isDirectChat) {
      return conversation.user.name;
    } else if (conversation.order) {
      return `Order #${conversation.order.id} - ${conversation.user.name}`;
    }
    return 'Unknown Conversation';
  },

  // Helper method to get conversation display info
  getConversationDisplayInfo(conversation) {
    if (conversation.isDirectChat) {
      return 'Direct Message';
    } else if (conversation.order) {
      return `${conversation.orderAmount ? '$' + conversation.orderAmount : 'Order'} - ${conversation.orderStatus || 'pending'}`;
    }
    return '';
  },

    async fetchChatHistory(orderId) {
      this.loadingChatHistory = true;
      try {
        const response = await this.$api.get(`/messages/${orderId}`);
        if (response.data && response.data.status) {
          // Messages should be sorted by created_at ascending (chat order)
          this.chatHistory = (response.data.payload || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          // Auto-mark messages as read when viewing
          await this.markOrderMessagesAsRead(orderId);
        } else {
          console.error(`Failed to fetch chat history for order ${orderId}: API returned unsuccessful status`, response.data);
          this.$toast.error(`Failed to load chat history. ${response.data?.payload || 'Unknown API error.'}`);
          this.chatHistory = [];
        }
      } catch (error) {
        console.error(`Error fetching chat history for order ${orderId}:`, error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          this.$toast.error(`Failed to fetch chat history: ${error.response.data?.payload || error.message}`);
        } else {
          this.$toast.error('Failed to fetch chat history: ' + error.message);
        }
        this.chatHistory = [];
      } finally {
        this.loadingChatHistory = false;
      }
    },

    async markOrderMessagesAsRead(orderId) {
      try {
        await this.$api.patch(`/messages/read/${orderId}`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    },

    async markDirectMessagesAsRead(targetUserId) {
      try {
        await this.$api.patch(`/messages/read/user/${targetUserId}`);
      } catch (error) {
        console.error('Error marking direct messages as read:', error);
      }
    },
    async sendReply() {
      if (!this.replyMessage.trim()) {
        this.$toast.error('Please enter a message.');
        return;
      }
      if (!this.selectedConversation || !this.selectedConversation.user) {
        console.error('No selected conversation or user to send reply to.');
        this.$toast.error('Cannot send reply: No active conversation or user selected.');
        return;
      }

      const recipientId = this.selectedConversation.user?.id;

      if (!recipientId) {
        this.$toast.error('Cannot send reply: Recipient user ID is missing.');
        return;
      }

      this.sendingReply = true;
      
      try {
        let response;
        
        if (this.selectedConversation.isDirectChat) {
          // For direct messages, use the direct message endpoint
          const payload = {
            message: this.replyMessage.trim(),
            recipientId: recipientId,
          };
          response = await this.$api.post('/messages/direct', payload);
        } else {
          // For order messages, use the admin message endpoint
          const payload = {
            message: this.replyMessage.trim(),
            orderId: this.selectedConversation.order.id,
            recipientId: recipientId,
          };
          response = await this.$api.post('/messages/admin', payload);
        }

        if (response.data && response.data.status) {
          console.log('Reply sent successfully.');
          
          // Store the message content before clearing
          const messageText = this.replyMessage.trim();
          this.replyMessage = '';
          
          // Add the message to chat history immediately for better UX
          const newSentMessage = {
            id: Date.now(), // Temporary ID
            created_at: new Date().toISOString(),
            message: messageText,
            sender_name: 'Admin', // Or get from auth state
            recipient_name: this.selectedConversation.user.name,
            sender_type: 'ADMIN',
            is_read: true,
            order: this.selectedConversation.order || null,
            sender: null, // Will be populated by backend response
            recipient: {
              id: recipientId,
              name: this.selectedConversation.user.name,
              email: this.selectedConversation.user.email
            }
          };
          this.chatHistory.push(newSentMessage);

          // Refresh the conversation to get updated message
          if (this.selectedConversation.isDirectChat) {
            // Mark direct messages as read
            await this.markDirectMessagesAsRead(recipientId);
            // Refresh direct chat history
            await this.selectConversation(this.selectedConversation);
          } else {
            // Refresh order chat history
            await this.fetchChatHistory(this.selectedConversation.order.id);
          }
          
          // Refresh conversations list to update last message
          await this.fetchConversations();

        } else {
          console.error('Failed to send reply: API returned unsuccessful status', response.data);
          this.$toast.error(`Failed to send reply. ${response.data?.payload || 'Unknown API error.'}`);
        }
      } catch (error) {
        console.error('Error sending reply:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          this.$toast.error(`Failed to send reply: ${error.response.data?.payload || error.message}`);
        } else {
          this.$toast.error('Failed to send reply: ' + error.message);
        }
      } finally {
        this.sendingReply = false;
      }
    },
    // Removed markMessagesAsRead(orderId) method
    formatTimestamp(timestamp) {
      if (!timestamp) return '';
      return new Date(timestamp).toLocaleString();
    }
  },
  created() {
    // Set adminUserId from auth state if available
    if (process.client) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          this.adminUserId = user.id;
        }
      } catch (error) {
        console.error('Error getting user from localStorage:', error);
      }
    }
  },
  mounted() {
    this.fetchConversations();
  },
};
</script>

<style scoped>
.admin-messages-page-vuetify {
  font-family: Arial, sans-serif; /* Or your preferred Vuetify font */
}

.conversation-list-col, .chat-detail-col {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.fill-height {
  height: 100%;
}

.overflow-y-auto {
  overflow-y: auto;
}

.chat-history-vuetify {
  /* Add any specific styling for chat history area if needed */
  /* Example: background-color: #f5f5f5; */
}

.message-container {
  display: flex; /* This will be controlled by justify-end or justify-start */
  width: 100%;
}

.message-bubble {
  word-wrap: break-word; /* Ensure long words break */
  white-space: pre-wrap; /* Preserve line breaks and spaces */
  /* font-size: 0.9rem; /* Adjust font size if needed */
}

/* Keeping these for reference or minor adjustments if v-sheet colors are not enough */
/* .user-message .message-bubble {
  background-color: #e1f5fe; // Example: Vuetify blue lighten-5
}
.admin-message .message-bubble {
  background-color: #dcf8c6; // Example: Vuetify green lighten-5
} */

/* Specificity for sender name if needed */
.message-bubble .font-weight-bold {
  /* color: #0277bd; /* Example for user sender name */
}
/* .admin-message .message-bubble .font-weight-bold {
  color: #4caf50; /* Example for admin sender name */
/*}*/

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Ensure v-textarea in reply doesn't grow indefinitely if content is huge */
.v-textarea {
  max-height: 150px; /* Or as desired */
  overflow-y: auto;
}
</style>
