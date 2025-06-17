import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  UpdateDateColumn,
} from "typeorm";
import { Order } from "./Order";
import { Currency } from "./Currency";

export enum CollectionStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  REJECTED = "rejected"
}

@Entity()
export class Collection extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column()
  amount: number;

  @Column()
  userId: number;

  @Column()
  currencyId: number;

  @Column({
    type: "enum",
    enum: CollectionStatus,
    default: CollectionStatus.PENDING
  })
  status: CollectionStatus;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: "currencyId" })
  currency: Currency;
}

// Helper function to validate userId
const validateUserId = (userId: number): void => {
  if (!userId || isNaN(userId) || !Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid userId: must be a positive integer");
  }
};

// Helper function to validate currencyId
const validateCurrencyId = (currencyId: number): void => {
  if (!currencyId || isNaN(currencyId) || !Number.isInteger(currencyId) || currencyId <= 0) {
    throw new Error("Invalid currencyId: must be a positive integer");
  }
};

export const createCollection = async (
  amount: number, 
  userId: number, 
  currencyId: number
) => {
  validateUserId(userId);
  validateCurrencyId(currencyId);
  
  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount: must be a positive number");
  }

  const collection = new Collection();
  collection.amount = amount;
  collection.userId = userId;
  collection.currencyId = currencyId;
  await collection.save();
  return collection;
};

export const getCollections = async () => {
  const collections = await Collection.find({
    relations: ["currency"],
    order: {
      created_at: "DESC",
    },
  });

  return collections;
};

export const getMemberCollections = async (userId: number) => {
  validateUserId(userId);
  
  return await Collection.find({
    where: { userId },
    relations: ["currency"],
    order: {
      created_at: "DESC",
    },
  });
};

export const getBalance = async (userId: number, currencyId?: number) => {
  validateUserId(userId);
  
  if (currencyId !== undefined) {
    validateCurrencyId(currencyId);
  }

  let collectionsQuery = Collection.createQueryBuilder("collection")
    .select("SUM(collection.amount)", "sum")
    .where("collection.userId = :userId", { userId })
    .andWhere("collection.status = :status", { status: CollectionStatus.CONFIRMED });

  let ordersQuery = Order.createQueryBuilder("order")
    .select("SUM(order.amount)", "sum")
    .where("order.memberId = :userId", { userId })
    .andWhere("order.status = :status", { status: "completed" });

  // If currencyId is provided, filter by currency
  if (currencyId) {
    collectionsQuery = collectionsQuery.andWhere("collection.currencyId = :currencyId", { currencyId });
    ordersQuery = ordersQuery.andWhere("order.currencyId = :currencyId", { currencyId });
  }

  const totalCollectedResult = await collectionsQuery.getRawOne();
  const totalCompletedResult = await ordersQuery.getRawOne();

  const totalCollected = parseFloat(totalCollectedResult.sum) || 0;
  const totalCompleted = parseFloat(totalCompletedResult.sum) || 0;

  const balance = totalCollected - totalCompleted;

  return balance;
};

// Get balance for all currencies
export const getBalancesByCurrency = async (userId: number) => {
  validateUserId(userId);
  
  const collectionsQuery = await Collection.createQueryBuilder("collection")
    .select("collection.currencyId", "currencyId")
    .addSelect("SUM(collection.amount)", "totalCollected")
    .leftJoin("collection.currency", "currency")
    .addSelect("currency.name", "currencyName")
    .addSelect("currency.code", "currencyCode")
    .addSelect("currency.symbol", "currencySymbol")
    .where("collection.userId = :userId", { userId })
    .andWhere("collection.status = :status", { status: CollectionStatus.CONFIRMED })
    .groupBy("collection.currencyId")
    .addGroupBy("currency.name")
    .addGroupBy("currency.code")
    .addGroupBy("currency.symbol")
    .getRawMany();

  const ordersQuery = await Order.createQueryBuilder("order")
    .select("order.currencyId", "currencyId")
    .addSelect("SUM(order.amount)", "totalCompleted")
    .where("order.memberId = :userId", { userId })
    .andWhere("order.status = :status", { status: "completed" })
    .groupBy("order.currencyId")
    .getRawMany();

  // Combine the results
  const balances = collectionsQuery.map(collection => {
    const totalCollected = parseFloat(collection.totalCollected) || 0;
    const orderData = ordersQuery.find(order => order.currencyId === collection.currencyId);
    const totalCompleted = orderData ? parseFloat(orderData.totalCompleted) || 0 : 0;
    
    return {
      currencyId: collection.currencyId,
      currencyName: collection.currencyName,
      currencyCode: collection.currencyCode,
      currencySymbol: collection.currencySymbol,
      totalCollected,
      totalCompleted,
      balance: totalCollected - totalCompleted
    };
  });

  return balances;
};

export const updateCollection = async (
  id: number,
  amount: number,
  currencyId?: number
) => {
  if (!id || isNaN(id) || !Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid id: must be a positive integer");
  }
  
  if (!amount || isNaN(amount) || amount <= 0) {
    throw new Error("Invalid amount: must be a positive number");
  }
  
  if (currencyId !== undefined) {
    validateCurrencyId(currencyId);
  }

  const collection = await Collection.findOneBy({ id });

  if (!collection) {
    throw new Error("Collection not found");
  }
  
  collection.amount = amount;
  if (currencyId !== undefined) {
    collection.currencyId = currencyId;
  }
  
  await collection.save();

  return collection;
};

// Confirm collection (user accepts)
export const confirmCollection = async (id: number, userId: number) => {
  if (!id || isNaN(id) || !Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid id: must be a positive integer");
  }
  validateUserId(userId);

  const collection = await Collection.findOne({ 
    where: { id, userId },
    relations: ["currency"]
  });

  if (!collection) {
    throw new Error("Collection not found or unauthorized");
  }

  if (collection.status !== CollectionStatus.PENDING) {
    throw new Error("Collection is not in pending status");
  }

  collection.status = CollectionStatus.CONFIRMED;
  await collection.save();

  return collection;
};

// Reject collection (user declines)
export const rejectCollection = async (id: number, userId: number) => {
  if (!id || isNaN(id) || !Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid id: must be a positive integer");
  }
  validateUserId(userId);

  const collection = await Collection.findOne({ 
    where: { id, userId },
    relations: ["currency"]
  });

  if (!collection) {
    throw new Error("Collection not found or unauthorized");
  }

  if (collection.status !== CollectionStatus.PENDING) {
    throw new Error("Collection is not in pending status");
  }

  collection.status = CollectionStatus.REJECTED;
  await collection.save();

  return collection;
};

// Get pending collections for a user
export const getPendingCollections = async (userId: number) => {
  validateUserId(userId);
  
  return await Collection.find({
    where: { 
      userId, 
      status: CollectionStatus.PENDING 
    },
    relations: ["currency"],
    order: {
      created_at: "DESC",
    },
  });
};

// Get collections by status
export const getCollectionsByStatus = async (userId?: number, status?: CollectionStatus) => {
  const whereClause: any = {};
  
  if (userId !== undefined) {
    validateUserId(userId);
    whereClause.userId = userId;
  }
  
  if (status) {
    whereClause.status = status;
  }

  return await Collection.find({
    where: whereClause,
    relations: ["currency"],
    order: {
      created_at: "DESC",
    },
  });
};