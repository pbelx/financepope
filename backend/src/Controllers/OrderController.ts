import { Request, Response } from "express";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getUserOrders,
  getOrders,
  changeOrderStatus,
  OrderItem,
  OrderStatus,
  isValidOrderStatus,
  // getOrdersByUserId,
  getOrdersByUserId, // Add this import
  getMemberCompletedOrder,
  asignMember, // Add this import
  getAllCompletedOrders,
  getUserCompletedOrders,
  getMemberCompletedOrders,
  getCompletedOrdersByDateRange,
  getCompletedOrdersCount,
  getCompletedOrdersPaginated,
  //Pete edits 
  getAllPendingOrders,
  getPendingOrdersPaginated,
  getPendingOrdersCount,
  getPendingOrdersByDateRange,
  //end Pete edits
  
} from "../Entities/Order";
import { customPayloadResponse } from "../Helpers/Helpers";

export const handleCreateOrder = async (req: Request, res: Response) => {
  try {
    console.log("Called");

    const {
      userId,
      amount,
      memberId,
      fromCurrency,
      receiverPlace,
      receiverCurrency,
      senderName,
      senderPhone,
      senderAddress,
      relationship,
      receiverName,
      receiverPhone,
      receiverAddress,
      bank,
    } = req.body;

    console.log(receiverCurrency);
    console.log("fromCurrency: ", fromCurrency);

    if (!userId) {
      return res
        .status(400) // Bad request for missing input
        .json(customPayloadResponse(false, "User Id is required"));
    }

    const newOrder = await createOrder(
      userId,
      amount,
      memberId,
      fromCurrency,
      receiverPlace,
      receiverCurrency,
      senderName,
      senderPhone,
      senderAddress,
      relationship,
      receiverName,
      receiverPhone,
      receiverAddress,
      bank
    );

    return res.status(200).json(customPayloadResponse(true, newOrder));
  } catch (error) {
    console.error(error);
    return res
      .status(500) // Internal server error
      .json(customPayloadResponse(false, error));
  }
};

export const handleChangeOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id, status } = req.body;

    if (!id || !status) {
      return res
        .status(200)
        .json(customPayloadResponse(false, "Order ID and status are required"))
        .end();
    }

    if (!isValidOrderStatus(status)) {
      return res
        .status(200) // Bad request for missing input
        .json(customPayloadResponse(false, "invalid status"));
    }

    const order = await getOrderById(id);
    if (!order) {
      return res
        .status(200)
        .json(customPayloadResponse(false, "Order not found"))
        .end();
    }

    if (order.status === "completed") {
      return res
        .status(200)
        .json(customPayloadResponse(false, "Order already completed"))
        .end();
    }

    await changeOrderStatus(order, status);
    await order.save();

    return res.status(200).json(customPayloadResponse(true, order)).end();
  } catch (error) {
    console.error("Error updating order status:", error);
    return res
      .status(500)
      .json(customPayloadResponse(false, "Internal server error"))
      .end();
  }
};

// Add the new assign member handler
export const handleAssignMember = async (req: Request, res: Response) => {
  try {
    const { orderId, memberId } = req.body;

    if (!orderId || !memberId) {
      return res
        .status(400)
        .json(customPayloadResponse(false, "Order ID and Member ID are required"))
        .end();
    }

    const updatedOrder = await asignMember(parseInt(orderId), parseInt(memberId));
    
    return res.status(200).json(customPayloadResponse(true, updatedOrder)).end();
  } catch (error) {
    console.error("Error assigning member to order:", error);
    return res
      .status(500)
      .json(customPayloadResponse(false, error || "Internal server error"))
      .end();
  }
};

const handleResponse = (
  res: Response,
  success: boolean,
  data: any,
  status = 200
) => {
  return res.status(status).json(customPayloadResponse(success, data)).end();
};

export const handleGetOrders = async (req: Request, res: Response) => {
  try {
    const orders = await getOrders();
    return handleResponse(res, true, orders);
  } catch (error) {
    console.error(error);
    return handleResponse(res, false, "An error occurred", 500);
  }
};


export const handleGetUserOrders = async (req: Request, res: Response) => {
  try {
    const { id, type } = req.body;
    if (!id) {
      return handleResponse(res, false, "User ID is required", 400);
    }
    if (!type) {
      return handleResponse(res, false, "User Type is required", 400);
    }
    const orders = await getOrdersByUserId(id);

    return handleResponse(res, true, orders);
  } catch (error) {
    console.error(error);
    return handleResponse(res, false, "An error occurred", 500);
  }
};

export const handleGetOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .json(customPayloadResponse(false, "Id Required"))
        .status(200)
        .end();
    }

    const order = await getOrderById(parseInt(id));

    if (!order) {
      return res
        .json(customPayloadResponse(false, "Orders Not Found"))
        .status(200)
        .end();
    }

    return res.json(customPayloadResponse(true, order)).status(200).end();
  } catch (error) {
    return res
      .json(customPayloadResponse(false, "An Error Occured"))
      .status(200)
      .end();
  }
};

export const handleGetMemberCompletedOrder = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    if (!memberId) {
      return res
        .json(customPayloadResponse(false, "memberId Required"))
        .status(200)
        .end();
    }

    const order = await getMemberCompletedOrder(parseInt(memberId));

    if (!order) {
      return res
        .json(customPayloadResponse(false, "Orders Not Found"))
        .status(200)
        .end();
    }

    return res.json(customPayloadResponse(true, order)).status(200).end();
  } catch (error) {
    return res
      .json(customPayloadResponse(false, "An Error Occured"))
      .status(200)
      .end();
  }
};

export const handleGetAllCompletedOrders = async (req: Request, res: Response) => {
  try {
    const orders = await getAllCompletedOrders();
    return res.status(200).json(customPayloadResponse(true, orders)).end();
  } catch (error) {
    console.error("Error fetching completed orders:", error);
    return res
      .status(500)
      .json(customPayloadResponse(false, "Internal server error"))
      .end();
  }
};

// Get completed orders for a specific user
export const handleGetUserCompletedOrders = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res
        .status(400)
        .json(customPayloadResponse(false, "User ID is required"))
        .end();
    }
    
    const orders = await getUserCompletedOrders(parseInt(userId));
    return res.status(200).json(customPayloadResponse(true, orders)).end();
  } catch (error) {
    console.error("Error fetching user completed orders:", error);
    return res
      .status(500)
      .json(customPayloadResponse(false, "Internal server error"))
      .end();
  }
};

// Get completed orders for a specific member (updated version of existing function)
export const handleGetMemberCompletedOrders = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    
    if (!memberId) {
      return res
        .status(400)
        .json(customPayloadResponse(false, "Member ID is required"))
        .end();
    }
    
    const orders = await getMemberCompletedOrders(parseInt(memberId));
    return res.status(200).json(customPayloadResponse(true, orders)).end();
  } catch (error) {
    console.error("Error fetching member completed orders:", error);
    return res
      .status(500)
      .json(customPayloadResponse(false, "Internal server error"))
      .end();
  }
};

// Get completed orders with date range filter
export const handleGetCompletedOrdersByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json(customPayloadResponse(false, "Start date and end date are required"))
        .end();
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json(customPayloadResponse(false, "Invalid date format"))
        .end();
    }
    
    const orders = await getCompletedOrdersByDateRange(start, end);
    return res.status(200).json(customPayloadResponse(true, orders)).end();
  } catch (error) {
    console.error("Error fetching completed orders by date range:", error);
    return res
      .status(500)
      .json(customPayloadResponse(false, "Internal server error"))
      .end();
  }
};

// Get completed orders count
export const handleGetCompletedOrdersCount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    
    const userIdNum = userId ? parseInt(userId as string) : undefined;
    const count = await getCompletedOrdersCount(userIdNum);
    
    return res.status(200).json(customPayloadResponse(true, { count })).end();
  } catch (error) {
    console.error("Error fetching completed orders count:", error);
    return res
      .status(500)
      .json(customPayloadResponse(false, "Internal server error"))
      .end();
  }
};

// Get completed orders with pagination
export const handleGetCompletedOrdersPaginated = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, userId } = req.query;
    
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const userIdNum = userId ? parseInt(userId as string) : undefined;
    
    if (pageNum < 1 || limitNum < 1) {
      return res
        .status(400)
        .json(customPayloadResponse(false, "Page and limit must be positive numbers"))
        .end();
    }
    
    const result = await getCompletedOrdersPaginated(pageNum, limitNum, userIdNum);
    return res.status(200).json(customPayloadResponse(true, result)).end();
  } catch (error) {
    console.error("Error fetching paginated completed orders:", error);
    return res
      .status(500)
      .json(customPayloadResponse(false, "Internal server error"))
      .end();
  }
};

export const handleDeleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res
        .json(customPayloadResponse(false, "Product Id Required"))
        .status(200)
        .end();
    }
    await deleteOrder(parseInt(id));
    return res
      .json(customPayloadResponse(true, "Store Product Deleted Successfully"))
      .status(200)
      .end();
  } catch (error) {
    console.log(error);
    return res
      .json(customPayloadResponse(false, "An Error Occured"))
      .status(200)
      .end();
  }
};

// Get all pending orders (admin only)
export const handleGetAllPendingOrders = async (req: Request, res: Response) => {
  try {
    const orders = await getAllPendingOrders();
    return res.status(200).json(customPayloadResponse(true, orders)).end();
  } catch (error) {
    console.error("Error fetching pending orders:", error);
    return res
      .status(500)
      .json(customPayloadResponse(false, "Internal server error"))
      .end();
  }
};

// Get pending orders with pagination (admin only)
export const handleGetPendingOrdersPaginated = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    
    if (pageNum < 1 || limitNum < 1) {
      return res
        .status(400)
        .json(customPayloadResponse(false, "Page and limit must be positive numbers"))
        .end();
    }
    
    const result = await getPendingOrdersPaginated(pageNum, limitNum);
    return res.status(200).json(customPayloadResponse(true, result)).end();
  } catch (error) {
    console.error("Error fetching paginated pending orders:", error);
    return res
      .status(500)
      .json(customPayloadResponse(false, "Internal server error"))
      .end();
  }
};

// Get pending orders count (admin only)
export const handleGetPendingOrdersCount = async (req: Request, res: Response) => {
  try {
    const count = await getPendingOrdersCount();
    return res.status(200).json(customPayloadResponse(true, { count })).end();
  } catch (error) {
    console.error("Error fetching pending orders count:", error);
    return res
      .status(500)
      .json(customPayloadResponse(false, "Internal server error"))
      .end();
  }
};

// Get pending orders with date range filter (admin only)
export const handleGetPendingOrdersByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json(customPayloadResponse(false, "Start date and end date are required"))
        .end();
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res
        .status(400)
        .json(customPayloadResponse(false, "Invalid date format"))
        .end();
    }
    
    const orders = await getPendingOrdersByDateRange(start, end);
    return res.status(200).json(customPayloadResponse(true, orders)).end();
  } catch (error) {
    console.error("Error fetching pending orders by date range:", error);
    return res
      .status(500)
      .json(customPayloadResponse(false, "Internal server error"))
      .end();
  }
};
