import { Request, Response } from 'express';
import Order from '../Models/Order';
import User from '../Models/User';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await Order.count();
    const pendingOrders = await Order.getPendingOrdersCount();
    const completedOrders = await Order.getCompletedOrdersCount();
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
