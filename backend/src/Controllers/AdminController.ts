import { Request, Response } from 'express';
import { Order, getPendingOrdersCount, getCompletedOrdersCount } from "../Entities/Order";
import { User } from "../Entities/User";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await Order.count();
    const pendingOrders = await getPendingOrdersCount();
    const completedOrders = await getCompletedOrdersCount();
    const totalUsers = await User.count({ where: { is_admin: false, is_member: false } });
    const totalMembers = await User.count({ where: { is_member: true } });

    res.json({
      totalOrders,
      pendingOrders,
      completedOrders,
      totalUsers,
      totalMembers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
};
