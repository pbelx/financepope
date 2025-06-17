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
                  :class="message.sender_type === 'admin' ? 'd-flex justify-end' : 'd-flex justify-start'"
                >
                  <v-sheet
                    rounded="lg"
                    class="pa-2 message-bubble"
                    :color="message.sender_type === 'admin' ? 'light-blue lighten-4' : 'grey lighten-3'"
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
      // Placeholder for admin user ID - this will be needed for marking messages read
      // and potentially for other logic. It should be fetched from auth state.
      adminUserId: null,
      rawInitialMessages: [],
    };
  },
  methods: {
    async fetchConversations() {
      this.loadingConversations = true;
      this.rawInitialMessages = []; // Clear previous raw messages
      try {
        const response = await this.$api.get('/messages');
        if (response.data && response.data.status) {
          const messagesPayload = response.data.payload || [];
          this.rawInitialMessages = messagesPayload; // Store raw messages
          this.processAndGroupMessages(messagesPayload);
        } else {
          console.error('Failed to fetch conversations: API returned unsuccessful status', response.data);
          alert('Failed to load conversations. ' + (response.data?.payload || 'Unknown API error.'));
          this.conversations = [];
          // this.rawInitialMessages is already cleared at the start of try or here explicitly
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          alert(`Failed to fetch conversations: ${error.response.data?.payload || error.message}`);
        } else {
          alert('Failed to fetch conversations: ' + error.message);
        }
        this.conversations = [];
        // this.rawInitialMessages is already cleared at the start of try or here explicitly
      } finally {
        this.loadingConversations = false;
      }
    },
    processAndGroupMessages(messages) {
      const groups = messages.reduce((acc, message) => {
        let conversationKey;
        if (message.order && message.order.id) {
          conversationKey = `order-${message.order.id}`;
        } else {
          // Direct chat
          if (message.sender_type === 'user') {
            if (!message.sender || !message.sender.id) {
              console.error('Skipping message due to missing sender ID for direct user message:', message);
              return acc;
            }
            conversationKey = `user-${message.sender.id}`;
          } else if (message.sender_type === 'admin') {
            if (!message.recipient || !message.recipient.id) {
              console.error('Skipping message due to missing recipient ID for direct admin message:', message);
              return acc;
            }
            conversationKey = `user-${message.recipient.id}`;
          } else {
            console.error('Skipping message due to unknown sender_type or missing ids for direct chat key:', message);
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
          memberUser = {
            id: lastMessageInGroup.order.user.id,
            name: lastMessageInGroup.order.user.full_name || 'Unknown User',
            email: lastMessageInGroup.order.user.email || 'N/A',
          };
        } else if (isDirect) {
          if (lastMessageInGroup.sender_type === 'user' && lastMessageInGroup.sender) {
            memberUser = {
              id: lastMessageInGroup.sender.id,
              name: lastMessageInGroup.sender.full_name || 'Unknown User',
              email: lastMessageInGroup.sender.email || 'N/A',
            };
          } else if (lastMessageInGroup.sender_type === 'admin' && lastMessageInGroup.recipient) {
            memberUser = {
              id: lastMessageInGroup.recipient.id,
              name: lastMessageInGroup.recipient.full_name || 'Unknown User',
              email: lastMessageInGroup.recipient.email || 'N/A',
            };
          }
        }

        return {
          id: key, // This is now conversationKey (e.g., "order-101" or "user-2")
          order: lastMessageInGroup.order,
          isDirectChat: isDirect,
          user: memberUser,
          lastMessage: {
            id: lastMessageInGroup.id,
            snippet: lastMessageInGroup.message.substring(0, 50) + (lastMessageInGroup.message.length > 50 ? '...' : ''),
            timestamp: lastMessageInGroup.created_at,
            sender_type: lastMessageInGroup.sender_type,
          },
          unreadCount: (() => {
            const currentAdminUserId = this.adminUserId;
            if (currentAdminUserId) {
              return groupMessages.filter(
                msg => !msg.is_read && msg.recipient && msg.recipient.id === currentAdminUserId
              ).length;
            }
            console.warn("Admin user ID not available, unread count for conversations may not be accurate for the admin.");
            return 0; // Default to 0 if adminUserId is not available
          })(),
        };
      });

      // Sort conversations by the timestamp of their last message in descending order
      processedConversations.sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));

      this.conversations = processedConversations;
    },
    async selectConversation(conversation) { // Make method async
      console.log('Selected conversation:', conversation);
      this.selectedConversation = conversation;
      this.chatHistory = [];
      this.loadingChatHistory = true;

      try {
        if (conversation.isDirectChat) {
          if (!conversation.user || !conversation.user.id) {
            console.error('Cannot fetch direct chat: Member ID is missing.', conversation);
            alert('Cannot load direct chat: User details are incomplete.');
            this.chatHistory = []; // Ensure chat history is clear
            // this.loadingChatHistory = false; // Will be handled by finally
            return; // Exit early
          }
          console.log(`Fetching full history for direct chat with user ${conversation.user.id}`);
          const response = await this.$api.get(`/messages/direct/${conversation.user.id}`);
          if (response.data && response.data.status) {
            this.chatHistory = response.data.payload || []; // Payload is expected to be sorted array of messages
          } else {
            console.error('Failed to fetch direct chat history: API returned unsuccessful status', response.data);
            alert('Failed to load direct chat history. ' + (response.data?.payload || 'Unknown API error.'));
            this.chatHistory = [];
          }
        } else if (conversation.order && conversation.order.id) {
          // For order chats, call the existing fetchChatHistory method.
          // fetchChatHistory is already async and handles its own loading flags and errors.
          await this.fetchChatHistory(conversation.order.id);
          // loadingChatHistory will be managed by fetchChatHistory's finally block
        } else {
          console.warn('Selected conversation is neither a valid direct chat nor an order chat:', conversation);
          alert('Cannot load conversation: Invalid conversation data.');
          this.chatHistory = [];
        }
      } catch (error) {
        console.error('Error in selectConversation:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          alert(`Failed to load conversation: ${error.response.data?.payload || error.message}`);
        } else {
          alert('Failed to load conversation: ' + error.message);
        }
        this.chatHistory = []; // Ensure chat history is clear on error
      } finally {
        // If fetchChatHistory was called, it handles its own loading flag.
        // If it was a direct chat, or an invalid selection that didn't call fetchChatHistory,
        // or if fetchChatHistory was called but we want a final say:
        if (conversation.isDirectChat || (!conversation.order || !conversation.order.id)) {
             this.loadingChatHistory = false;
        }
        // If fetchChatHistory was awaited, its finally would have run.
        // This ensures it's false if the direct chat path or error path was taken before calling fetchChatHistory.
      }
    },
    async fetchChatHistory(orderId) {
      this.loadingChatHistory = true;
      try {
        const response = await this.$api.get(`/messages/chat/${orderId}`);
        if (response.data && response.data.status) {
          // Messages should be sorted by created_at ascending (chat order)
          this.chatHistory = (response.data.payload || []).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          // this.markMessagesAsRead(orderId); // Removed call
        } else {
          console.error(`Failed to fetch chat history for order ${orderId}: API returned unsuccessful status`, response.data);
          alert(`Failed to load chat history. ${response.data?.payload || 'Unknown API error.'}`);
          this.chatHistory = [];
        }
      } catch (error) {
        console.error(`Error fetching chat history for order ${orderId}:`, error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          alert(`Failed to fetch chat history: ${error.response.data?.payload || error.message}`);
        } else {
          alert('Failed to fetch chat history: ' + error.message);
        }
        this.chatHistory = [];
      } finally {
        this.loadingChatHistory = false;
      }
    },
    async sendReply() {
      if (!this.replyMessage.trim()) {
        alert('Please enter a message.');
        return;
      }
      if (!this.selectedConversation || !this.selectedConversation.user) {
        console.error('No selected conversation or user to send reply to.');
        alert('Cannot send reply: No active conversation or user selected.');
        return;
      }

      let orderIdForPayload = null;
      // If it's not a direct chat, and it's an order with an ID, use that order's ID.
      if (!this.selectedConversation.isDirectChat &&
          this.selectedConversation.order &&
          typeof this.selectedConversation.order.id === 'number') {
        orderIdForPayload = this.selectedConversation.order.id;
      }

      const recipientId = this.selectedConversation.user?.id;

      if (!recipientId) {
        alert('Cannot send reply: Recipient user ID is missing.');
        this.sendingReply = false; // ensure loading state is reset
        return;
      }

      const payload = {
        message: this.replyMessage.trim(), // Ensure message is trimmed
        orderId: orderIdForPayload, // Will be null for direct chats
        recipientId: recipientId,
      };

      console.log('Sending reply with payload:', payload); // For debugging

      this.sendingReply = true;
      try {
        const response = await this.$api.post('/messages/admin', payload);
        if (response.data && response.data.status) {
          console.log('Reply sent successfully.');
          this.replyMessage = '';
          // Refresh chat history. For direct chats, orderIdForPayload will be null.
          // fetchChatHistory is designed to handle null orderId if we were to call it for direct chats,
          // but current selectConversation logic for direct chats loads from rawInitialMessages.
          // For consistency after sending a new message in a direct chat, we might need to re-filter rawInitialMessages or add the new message manually.
          // However, the current implementation of sendReply for direct chats will still attempt to call fetchChatHistory with a null orderId,
          // which fetchChatHistory is NOT currently designed to handle for fetching direct chat history.
          // For now, we'll rely on the existing fetchChatHistory call.
          // If it was an order chat, it fetches history for that order.
          // If it was a direct chat, orderIdForPayload is null. The existing fetchChatHistory will try to fetch for order 'null' which is not ideal.
          // A better approach for direct chats would be to update rawInitialMessages and re-process, or have a dedicated fetchDirectChatHistory.
          // Given the current constraints, if it's a direct chat, we might just re-select the conversation to trigger the existing direct chat display logic.
          if (this.selectedConversation.isDirectChat) {
             // Re-selecting the conversation will trigger the logic to display from rawInitialMessages
             // and ideally, the new message would be part of rawInitialMessages if GET /messages was re-fetched after sending.
             // This is a simplification for now. A robust solution would update rawInitialMessages or add to chatHistory directly.
             // For now, to ensure UI updates for direct chats after sending, we'll clear and let selectConversation re-filter
             // This assumes the new message would appear if we re-fetched the *main* message list.
             // A more immediate update would be to push the sent message to this.chatHistory manually.
             const newSentMessage = {
                id: Date.now(), // Temporary ID
                created_at: new Date().toISOString(),
                message: payload.message,
                sender_name: 'Admin User', // Or a more dynamic admin name
                recipient_name: this.selectedConversation.user.name,
                sender_type: 'admin',
                is_read: true,
                order: this.selectedConversation.order // null for direct chats
             };
             this.chatHistory.push(newSentMessage);
             if(this.selectedConversation.order?.id) { // only call fetchChatHistory if there is an orderId
                await this.fetchChatHistory(this.selectedConversation.order.id);
             } else {
                // For direct chat, re-evaluate if selectConversation needs to be called or if manual push is enough
                // To ensure the conversation list also updates its last message snippet, a full re-fetch of conversations might be better.
                // this.fetchConversations(); // This would be a larger refresh.
             }

          } else if (orderIdForPayload) {
             await this.fetchChatHistory(orderIdForPayload); // Refresh chat history for order chats
          }

        } else {
          console.error('Failed to send reply: API returned unsuccessful status', response.data);
          alert(`Failed to send reply. ${response.data?.payload || 'Unknown API error.'}`);
        }
      } catch (error) {
        console.error('Error sending reply:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          alert(`Failed to send reply: ${error.response.data?.payload || error.message}`);
        } else {
          alert('Failed to send reply: ' + error.message);
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
    // Fetch initial conversations when component is created
    // this.fetchConversations(); // Moved to mounted()

    // Example: Set adminUserId from a global store or auth plugin if available
    // if (this.$auth && this.$auth.user) {
    //   this.adminUserId = this.$auth.user.id;
    // }
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
