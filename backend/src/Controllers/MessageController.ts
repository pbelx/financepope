import { Response, Request, NextFunction } from "express";
import { 
  createMessage, 
  getMessages, 
  getMessagesByOrderId, 
  getChatHistory,
  markMessagesAsRead,
  MessageSender,
  getDirectChatThread,
  createDirectMessage,
  markDirectMessagesAsRead
} from "../Entities/Message";
import { customPayloadResponse } from "../Helpers/Helpers";

const handleResponse = (
  res: Response,
  success: boolean,
  data: any,
  status = 200
): void => {
  res.status(status).json(customPayloadResponse(success, data));
};

export const handleGetMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const msg = await getMessages();
    handleResponse(res, true, msg);
  } catch (error) {
    console.error(error);
    handleResponse(res, false, "An error occurred", 500);
  }
};

export const handleCreateMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, orderId, recipientId, senderType } = req.body;
    const senderId = (req as any).user?.id;

    if (!orderId) {
      handleResponse(res, false, "Order ID is required", 400);
      return;
    }

    if (!message || message.trim() === "") {
      handleResponse(res, false, "Message content is required", 400);
      return;
    }

    const msg = await createMessage(
      message, 
      orderId, 
      senderId, 
      recipientId,
      senderType || MessageSender.USER
    );
    
    handleResponse(res, true, msg);
  } catch (error) {
    console.error(error);
    handleResponse(res, false, "An error occurred", 500);
  }
};

export const handleCreateDirectMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, recipientId } = req.body;
    const senderId = (req as any).user?.id;

    if (!recipientId) {
      handleResponse(res, false, "Recipient ID is required", 400);
      return;
    }

    if (!message || message.trim() === "") {
      handleResponse(res, false, "Message content is required", 400);
      return;
    }

    const msg = await createDirectMessage(
      message, 
      senderId, 
      recipientId
    );
    
    handleResponse(res, true, msg);
  } catch (error) {
    console.error(error);
    handleResponse(res, false, "An error occurred", 500);
  }
};

export const handleGetMessageByOrderId = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      handleResponse(res, false, "OrderId is required", 400);
      return;
    }
    const msg = await getMessagesByOrderId(parseInt(orderId));
    handleResponse(res, true, msg);
  } catch (error) {
    console.error(error);
    handleResponse(res, false, "An error occurred", 500);
  }
};

export const handleGetChatHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).user?.id;

    if (!orderId) {
      handleResponse(res, false, "OrderId is required", 400);
      return;
    }

    const chatHistory = await getChatHistory(parseInt(orderId), userId);
    handleResponse(res, true, chatHistory);
  } catch (error) {
    console.error(error);
    handleResponse(res, false, "An error occurred", 500);
  }
};

export const handleGetDirectChatThread = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const currentUserId = (req as any).user?.id;
    const targetUserIdParam = req.params.targetUserId;

    if (!currentUserId) {
      handleResponse(res, false, "User authentication required.", 401);
      return;
    }
    
    if (!targetUserIdParam) {
      handleResponse(res, false, "Target user ID is required.", 400);
      return;
    }
    
    const targetUserId = parseInt(targetUserIdParam, 10);
    if (isNaN(targetUserId)) {
      handleResponse(res, false, "Valid target user ID must be an integer.", 400);
      return;
    }

    const messages = await getDirectChatThread(currentUserId, targetUserId);
    handleResponse(res, true, messages);

  } catch (error) {
    console.error("Error in handleGetDirectChatThread:", error);
    handleResponse(res, false, "An error occurred while fetching chat history.", 500);
  }
};

export const handleMarkMessagesAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).user?.id;

    if (!orderId) {
      handleResponse(res, false, "OrderId is required", 400);
      return;
    }

    if (!userId) {
      handleResponse(res, false, "User authentication required", 401);
      return;
    }

    await markMessagesAsRead(parseInt(orderId), userId);
    handleResponse(res, true, { message: "Messages marked as read" });
  } catch (error) {
    console.error(error);
    handleResponse(res, false, "An error occurred", 500);
  }
};

export const handleMarkDirectMessagesAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = (req as any).user?.id;

    if (!targetUserId) {
      handleResponse(res, false, "Target user ID is required", 400);
      return;
    }

    if (!currentUserId) {
      handleResponse(res, false, "User authentication required", 401);
      return;
    }

    await markDirectMessagesAsRead(parseInt(targetUserId), currentUserId);
    handleResponse(res, true, { message: "Direct messages marked as read" });
  } catch (error) {
    console.error(error);
    handleResponse(res, false, "An error occurred", 500);
  }
};

export const handleAdminCreateMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { message, orderId, recipientId } = req.body;
    const adminId = (req as any).user?.id;

    if (!orderId || !recipientId) {
      handleResponse(res, false, "Order ID and Recipient ID are required", 400);
      return;
    }

    if (!message || message.trim() === "") {
      handleResponse(res, false, "Message content is required", 400);
      return;
    }

    const msg = await createMessage(
      message, 
      orderId, 
      adminId, 
      recipientId,
      MessageSender.ADMIN
    );
    
    handleResponse(res, true, msg);
  } catch (error) {
    console.error(error);
    handleResponse(res, false, "An error occurred", 500);
  }
};