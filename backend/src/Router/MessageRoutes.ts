import { Router } from "express";
import { JWTAuthMiddleWare } from "../Middlewares/AuthMiddleware";
import { 
  handleCreateMessage, 
  handleGetMessage, 
  handleGetMessageByOrderId,
  handleGetChatHistory,
  handleMarkMessagesAsRead,
  handleMarkDirectMessagesAsRead,
  handleAdminCreateMessage,
  handleGetDirectChatThread,
  handleCreateDirectMessage
} from "../Controllers/MessageController";

export default (router: Router) => {
  const messagesPrefix = "/messages";

  // Get all messages for admin
  router.get(
    `${messagesPrefix}`,
    JWTAuthMiddleWare,
    handleGetMessage 
  );

  // Get messages by order ID - matches frontend fetchChatMessages for order chats
  router.get(
    `${messagesPrefix}/:orderId`,
    JWTAuthMiddleWare,
    handleGetMessageByOrderId
  );

  // Get direct chat thread with a specific user - matches frontend /messages/user/:targetUserId
  router.get(
    `${messagesPrefix}/user/:targetUserId`,
    JWTAuthMiddleWare,
    handleGetDirectChatThread 
  );

  // Get chat history for a specific order (alternative endpoint)
  router.get(
    `${messagesPrefix}/chat/:orderId`,
    JWTAuthMiddleWare,
    handleGetChatHistory
  );

  // Create a new message for order chats - matches frontend /messages endpoint
  router.post(
    `${messagesPrefix}`,
    JWTAuthMiddleWare,
    handleCreateMessage
  );

  // Create direct message (no order) - matches frontend /messages/direct endpoint
  router.post(
    `${messagesPrefix}/direct`,
    JWTAuthMiddleWare,
    handleCreateDirectMessage
  );

  // Admin endpoint to send messages to users
  router.post(
    `${messagesPrefix}/admin`,
    JWTAuthMiddleWare,
    handleAdminCreateMessage
  );

  // Mark messages as read for a specific order
  router.patch(
    `${messagesPrefix}/read/:orderId`,
    JWTAuthMiddleWare,
    handleMarkMessagesAsRead
  );

  // Mark direct messages as read with a specific user
  router.patch(
    `${messagesPrefix}/read/user/:targetUserId`,
    JWTAuthMiddleWare,
    handleMarkDirectMessagesAsRead
  );
};