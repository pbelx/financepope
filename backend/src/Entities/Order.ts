import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  Column,
  ManyToMany,
  JoinTable,
  OneToOne,
  IsNull,
  Not,
  OneToMany,
  CreateDateColumn,
  Between,
} from "typeorm";
import { User, getuserById } from "./User";
import { dateFormatter, roundOffNumbers } from "../Helpers/Helpers";
import { Message } from "./Message";

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: "userId" })
  user!: User; // This will hold the full User object

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: "memberId" })
  member!: User; // This will hold the full User object

  @OneToMany(() => Message, (message) => message.order)
  messages: Message[];

  @Column()
  amount: number;

  @Column()
  fromCurrency: number;

  @Column()
  receiverPlace: string;

  @Column()
  receiverCurrency: number;

  @Column()
  senderName: string;

  @Column()
  senderPhone: string;

  @Column()
  senderAddress: string;

  @Column()
  relationship: string;

  @Column()
  receiverName: string;

  @Column()
  receiverPhone: string;

  @Column()
  receiverAddress: string;

  @Column()
  bank: string;

  @Column()
  status: OrderStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}

export interface OrderItem {
  productId: number;
  qty: number;
}

export type OrderStatus = "pending" | "approved" | "cancelled" | "completed";

export const createOrder = async (
  userId: number,
  amount: number,
  memberId: number,
  fromCurrency: number,
  receiverPlace: string,
  receiverCurrency: number,
  senderName: string,
  senderPhone: string,
  senderAddress: string,
  relationship: string,
  receiverName: string,
  receiverPhone: string,
  receiverAddress: string,
  bank: string
) => {
  const orderObj = new Order();
  orderObj.user = { id: userId } as User;
  orderObj.amount = amount;
  orderObj.fromCurrency = fromCurrency;
  orderObj.receiverPlace = receiverPlace;
  orderObj.receiverCurrency = receiverCurrency;
  orderObj.senderName = senderName;
  orderObj.senderPhone = senderPhone;
  orderObj.senderAddress = senderAddress;
  orderObj.relationship = relationship;
  orderObj.receiverName = receiverName;
  orderObj.receiverPhone = receiverPhone;
  orderObj.receiverAddress = receiverAddress;
  orderObj.bank = bank;
  orderObj.status = "pending";
  await orderObj.save();
  return orderObj;
};

export const getOrderById = async (id: number) => {
  return await Order.findOne({
    where: { id },
    relations: ["messages"],
  });
};


export const getOrdersByUserId = async (userId: number) => {
  return Order.find({
    where: { user: { id: userId } },
  });
};

export const getMemberCompletedOrder = async (userId: number) => {
  return await Order.find({
    where: {
      user: { id: userId }, // This works if "user" is eager-loaded and supports this syntax
      status: "completed",
    },
    order: {
      createdAt: "DESC", // Optional ordering
    },
  });
};

export const getOrders = async (): Promise<Order[]> => {
  return await Order.find({
    order: {
      id: "DESC",
    },
  });
};

export const getUserOrders = async (id: number): Promise<Order[]> => {
  return await Order.find({
    order: {
      id: "DESC",
    },
    where: [{ user: { id } }, { member: { id } }],
  });
};

export const deleteOrder = async (id: number) => {
  const orderObj = await getOrderById(id);
  if (!orderObj)
    throw new Error(
      "order not Found make sure you have selected the right one"
    );
  await orderObj.remove();
  return true;
};

export const changeOrderStatus = async (order: Order, status: OrderStatus) => {
  // Update status and save
  order.status = status;
  await order.save();

  return order;
};

export const asignMember = async (id: number, memberId: number) => {
  // Find the order by ID
  const orderObj = await getOrderById(id);
  if (!orderObj) throw new Error("Order not found");

  // Find the agent user by ID
  const member = await getuserById(memberId);
  if (!member) throw new Error("Agent not found");

  // Update the agent relationship
  orderObj.member = member;
  await orderObj.save();
  return orderObj;
};

// Add these functions to your Order.ts file

// Get all completed orders (for admin/overview)
export const getAllCompletedOrders = async (): Promise<Order[]> => {
  return await Order.find({
    where: {
      status: "completed",
    },
    order: {
      createdAt: "DESC",
    },
  });
};

// Get completed orders by user ID (as sender)
export const getUserCompletedOrders = async (
  userId: number
): Promise<Order[]> => {
  return await Order.find({
    where: {
      user: { id: userId },
      status: "completed",
    },
    order: {
      createdAt: "DESC",
    },
  });
};

// Get completed orders by member ID (assigned member)
export const getMemberCompletedOrders = async (
  memberId: number
): Promise<Order[]> => {
  return await Order.find({
    where: {
      member: { id: memberId },
      status: "completed",
    },
    order: {
      createdAt: "DESC",
    },
  });
};

// Get completed orders with date range filter
export const getCompletedOrdersByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<Order[]> => {
  return await Order.find({
    where: {
      status: "completed",
      createdAt: Between(startDate, endDate),
    },
    order: {
      createdAt: "DESC",
    },
  });
};

// Get completed orders count by user
export const getCompletedOrdersCount = async (
  userId?: number
): Promise<number> => {
  const whereCondition: any = { status: "completed" };

  if (userId) {
    whereCondition.user = { id: userId };
  }

  return await Order.count({
    where: whereCondition,
  });
};

// Get completed orders with pagination
export const getCompletedOrdersPaginated = async (
  page: number = 1,
  limit: number = 10,
  userId?: number
): Promise<{ orders: Order[]; total: number; totalPages: number }> => {
  const whereCondition: any = { status: "completed" };

  if (userId) {
    whereCondition.user = { id: userId };
  }

  const [orders, total] = await Order.findAndCount({
    where: whereCondition,
    order: {
      createdAt: "DESC",
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    orders,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

// adding pending orders fix .. Peter Edits 
// Get all pending orders (for admin/overview)
export const getAllPendingOrders = async (): Promise<Order[]> => {
  return await Order.find({
    where: {
      status: "pending",
    },
    order: {
      createdAt: "DESC",
    },
  });
};

// Get pending orders with pagination
export const getPendingOrdersPaginated = async (
  page: number = 1,
  limit: number = 10
): Promise<{ orders: Order[]; total: number; totalPages: number }> => {
  const [orders, total] = await Order.findAndCount({
    where: {
      status: "pending",
    },
    order: {
      createdAt: "DESC",
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    orders,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

// Get pending orders count
export const getPendingOrdersCount = async (): Promise<number> => {
  return await Order.count({
    where: {
      status: "pending",
    },
  });
};

// Get pending orders with date range filter
export const getPendingOrdersByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<Order[]> => {
  return await Order.find({
    where: {
      status: "pending",
      createdAt: Between(startDate, endDate),
    },
    order: {
      createdAt: "DESC",
    },
  });
};
// end Pete edits 

// Note: You'll need to import Between from typeorm at the top of your Order.ts file:
// import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, BaseEntity, Column, CreateDateColumn, Between } from "typeorm";

export const isValidOrderStatus = (status: string): status is OrderStatus => {
  return ["pending", "approved", "cancelled", "completed"].includes(status);
};
