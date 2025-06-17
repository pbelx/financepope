import { Response, Request } from "express";
import { 
  createCollection, 
  getBalance, 
  getCollections, 
  getMemberCollections, 
  updateCollection,
  confirmCollection,
  rejectCollection,
  getPendingCollections,
  getCollectionsByStatus,
  CollectionStatus
} from "../Entities/Collection";
import { customPayloadResponse } from "../Helpers/Helpers";

const handleResponse = (
  res: Response,
  success: boolean,
  data: any,
  status = 200
) => {
  return res.status(status).json(customPayloadResponse(success, data));
};

export const handleGetCollections = async (req: Request, res: Response) => {
  try {
    const collections = await getCollections();
    return handleResponse(res, true, collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return handleResponse(res, false, "Failed to fetch collections", 500);
  }
};

export const handleCreateCollection = async (req: Request, res: Response) => {
  try {
    const { amount, userId, currencyId } = req.body;

    // Validate required fields
    if (!amount || !userId || !currencyId) {
      return handleResponse(res, false, "Amount, userId, and currencyId are required", 400);
    }

    // Validate amount is a number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return handleResponse(res, false, "Amount must be a positive number", 400);
    }

    const collection = await createCollection(numericAmount, userId, currencyId);
    return handleResponse(res, true, collection, 201);
  } catch (error) {
    console.error("Error creating collection:", error);
    return handleResponse(res, false, error || "Failed to create collection", 500);
  }
};

export const handleUpdateCollection = async (req: Request, res: Response) => {
  try {
    const { id, amount, currencyId } = req.body;

    if (!id || !amount) {
      return handleResponse(res, false, "Collection ID and amount are required", 400);
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return handleResponse(res, false, "Amount must be a positive number", 400);
    }

    const collection = await updateCollection(Number(id), numericAmount, currencyId);
    return handleResponse(res, true, collection);
  } catch (error) {
    console.error("Error updating collection:", error);
    return handleResponse(res, false, error || "Failed to update collection", 500);
  }
};

export const handleGetBalance = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { currencyId } = req.query;

    if (!userId) {
      return handleResponse(res, false, "userId is required", 400);
    }

    const balance = await getBalance(
      Number(userId), 
      currencyId ? Number(currencyId) : undefined
    );
    return handleResponse(res, true, { balance });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return handleResponse(res, false, error || "Failed to fetch balance", 500);
  }
};

export const handleGetMemberCollections = async (req: Request, res: Response) => {
  try {
    const { memberId } = req.params;
    
    if (!memberId) {
      return handleResponse(res, false, "memberId is required", 400);
    }

    const collections = await getMemberCollections(Number(memberId));
    return handleResponse(res, true, collections);
  } catch (error) {
    console.error("Error fetching member collections:", error);
    return handleResponse(res, false, error || "Failed to fetch member collections", 500);
  }
};

export const handleConfirmCollection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!id || !userId) {
      return handleResponse(res, false, "Collection ID and userId are required", 400);
    }

    const collection = await confirmCollection(Number(id), userId);
    return handleResponse(res, true, collection);
  } catch (error) {
    console.error("Error confirming collection:", error);
    return handleResponse(res, false, error || "Failed to confirm collection", 500);
  }
};

export const handleRejectCollection = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!id || !userId) {
      return handleResponse(res, false, "Collection ID and userId are required", 400);
    }

    const collection = await rejectCollection(Number(id), userId);
    return handleResponse(res, true, collection);
  } catch (error) {
    console.error("Error rejecting collection:", error);
    return handleResponse(res, false, error || "Failed to reject collection", 500);
  }
};