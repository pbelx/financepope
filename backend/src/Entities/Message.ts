import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  ManyToOne,
  CreateDateColumn,
  IsNull,
} from "typeorm";
import { Order } from "./Order";
import { User } from "./User";

export enum MessageSender {
  USER = "USER",
  ADMIN = "ADMIN", 
  SYSTEM = "SYSTEM"
}

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn()
  created_at: Date;

  @Column()
  message: string;

  @ManyToOne(() => Order, (order) => order.messages, {
    eager: true,
    nullable: true,
  })
  order: Order | null;

  @ManyToOne(() => User, { nullable: true, eager: true })
  sender: User;

  @ManyToOne(() => User, { nullable: true, eager: true })
  recipient: User;

  @Column({
    type: "enum",
    enum: MessageSender,
    default: MessageSender.USER
  })
  sender_type: MessageSender;

  @Column({ default: false })
  is_read: boolean;

  @Column({ nullable: true })
  sender_name: string;

  @Column({ nullable: true })
  recipient_name: string;

  // Helper columns for cases where sender relation might be null
  @Column({ type: "int", nullable: true })
  sender_id: number | null;

  @Column({ type: "int", nullable: true })
  recipient_id: number | null;
}

export const createMessage = async (
  message: string,
  orderId: number,
  senderId?: number,
  recipientId?: number,
  senderType: MessageSender = MessageSender.USER
) => {
  console.log('Creating message for orderId:', orderId);
  
  const order = await Order.findOne({ 
    where: { id: orderId },
    relations: ['user']
  });
  
  if (!order) throw new Error("Order not found");

  const msg = new Message();
  msg.order = order;
  msg.message = message;
  msg.sender_type = senderType;
  msg.sender_id = senderId || null;
  msg.recipient_id = recipientId || null;

  // Set sender
  if (senderId) {
    const sender = await User.findOne({ where: { id: senderId } });
    if (sender) {
      msg.sender = sender;
      msg.sender_name = sender.full_name || sender.email;
    }
  }

  // Set recipient
  if (recipientId) {
    const recipient = await User.findOne({ where: { id: recipientId } });
    if (recipient) {
      msg.recipient = recipient;
      msg.recipient_name = recipient.full_name || recipient.email;
    }
  } else if (order.user) {
    msg.recipient = order.user;
    msg.recipient_name = order.user.full_name || order.user.email;
    msg.recipient_id = order.user.id;
  }

  await msg.save();
  return msg;
};

export const createDirectMessage = async (
  message: string,
  senderId: number,
  recipientId: number,
  senderType: MessageSender = MessageSender.USER
) => {
  console.log('Creating direct message from:', senderId, 'to:', recipientId);

  const msg = new Message();
  msg.message = message;
  msg.sender_type = senderType;
  msg.sender_id = senderId;
  msg.recipient_id = recipientId;
  msg.order = null; // No order for direct messages

  // Set sender
  const sender = await User.findOne({ where: { id: senderId } });
  if (sender) {
    msg.sender = sender;
    msg.sender_name = sender.full_name || sender.email;
  } else {
    throw new Error("Sender not found");
  }

  // Set recipient
  const recipient = await User.findOne({ where: { id: recipientId } });
  if (recipient) {
    msg.recipient = recipient;
    msg.recipient_name = recipient.full_name || recipient.email;
  } else {
    throw new Error("Recipient not found");
  }

  await msg.save();
  return msg;
};

export const getMessages = async () => {
  const messages = await Message.find({
    relations: ['order', 'order.user', 'sender', 'recipient'],
    order: {
      created_at: "DESC",
    },
  });

  return messages;
};

export const getMessagesByOrderId = async (orderId: number) => {
  const messages = await Message.find({
    where: {
      order: { id: orderId },
    },
    relations: ['order', 'order.user', 'sender', 'recipient'],
    order: {
      created_at: "ASC",
    },
  });

  return messages;
};

export const getChatHistory = async (orderId: number, userId?: number) => {
  let queryOptions: any;

  if (userId) {
    // Get the user to check their role
    const user = await User.findOne({ where: { id: userId } });
    
    if (user && user.is_admin) {
      // Admins can see all messages for the order
      queryOptions = {
        where: {
          order: { id: orderId },
        },
        relations: ['order', 'order.user', 'sender', 'recipient'],
        order: {
          created_at: "ASC",
        },
      };
    } else {
      // Members can see:
      // 1. Messages they sent or received directly
      // 2. Admin messages in the order context (where sender_type is ADMIN)
      queryOptions = {
        where: [
          { order: { id: orderId }, sender: { id: userId } },
          { order: { id: orderId }, recipient: { id: userId } },
          { order: { id: orderId }, sender_type: MessageSender.ADMIN }
        ],
        relations: ['order', 'order.user', 'sender', 'recipient'],
        order: {
          created_at: "ASC",
        },
      };
    }
  } else {
    queryOptions = {
      where: {
        order: { id: orderId },
      },
      relations: ['order', 'order.user', 'sender', 'recipient'],
      order: {
        created_at: "ASC",
      },
    };
  }

  const messages = await Message.find(queryOptions);
  return messages;
};

export const markMessagesAsRead = async (orderId: number, userId: number) => {
  await Message.update(
    {
      order: { id: orderId },
      recipient: { id: userId },
      is_read: false
    },
    {
      is_read: true
    }
  );
};

export const markDirectMessagesAsRead = async (targetUserId: number, currentUserId: number) => {
  // Mark messages as read where:
  // - sender is targetUserId and recipient is currentUserId (messages FROM target TO current user)
  // - order is null (direct messages only)
  await Message.update(
    {
      sender: { id: targetUserId },
      recipient: { id: currentUserId },
      order: IsNull(),
      is_read: false
    },
    {
      is_read: true
    }
  );
};

export const getDirectChatThread = async (user1Id: number, user2Id: number) => {
  if (!user1Id || !user2Id) {
    console.error("Both user IDs must be provided to fetch a direct chat thread.");
    return []; 
  }
  
  // Get both users to check their roles
  const user1 = await User.findOne({ where: { id: user1Id } });
  const user2 = await User.findOne({ where: { id: user2Id } });
  
  if (!user1 || !user2) {
    console.error("One or both users not found.");
    return [];
  }
  
  // Basic query for direct messages between the two users
  let whereConditions = [
    { sender: { id: user1Id }, recipient: { id: user2Id }, order: IsNull() }, 
    { sender: { id: user2Id }, recipient: { id: user1Id }, order: IsNull() }
  ];
  
  // If one user is a member and the other is an admin, include admin broadcast messages
  if ((user1.is_admin && !user2.is_admin) || (!user1.is_admin && user2.is_admin)) {
    const adminId = user1.is_admin ? user1Id : user2Id;
    const memberId = user1.is_admin ? user2Id : user1Id;
    
    // Add condition for admin messages that might be visible to the member
    whereConditions.push(
      // Admin messages where the member should see them (recipient is member or null for broadcasts)
      { sender: { id: adminId }, sender_type: MessageSender.ADMIN, order: IsNull() }
    );
  }
  
  const messages = await Message.find({
    where: whereConditions,
    relations: ['sender', 'recipient'], 
    order: { created_at: "ASC" } 
  });
  
  return messages;
};