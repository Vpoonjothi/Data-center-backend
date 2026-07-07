import { Service, Payment, User } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalActiveServers = await Service.count({ where: { status: 'Active' } });
    const suspendedServers = await Service.count({ where: { status: 'Suspended' } });
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const endOfGracePeriod = new Date();
    endOfGracePeriod.setDate(today.getDate() - 7); // Assuming 7 days grace period

    // Count services that are in grace period (Expired, but not suspended, and past due date)
    const inGracePeriod = await Service.count({
      where: {
        status: 'Expired',
        next_due_date: {
          [Op.lt]: today,
          [Op.gt]: endOfGracePeriod
        }
      }
    });

    // Count renewals due within next 7 days
    const next7Days = new Date();
    next7Days.setDate(today.getDate() + 7);
    const renewalsDue = await Service.count({
      where: {
        status: 'Active',
        next_due_date: {
          [Op.gte]: today,
          [Op.lte]: next7Days
        }
      }
    });

    // Revenue calculations
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);
    const todayEnd = new Date();
    todayEnd.setHours(23,59,59,999);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todaysRevenueResult = await Payment.sum('amount', {
      where: {
        status: 'Verified',
        payment_date: { [Op.between]: [todayStart, todayEnd] }
      }
    });

    const monthlyRevenueResult = await Payment.sum('amount', {
      where: {
        status: 'Verified',
        payment_date: { [Op.gte]: firstDayOfMonth }
      }
    });

    const pendingPayments = await Payment.count({ where: { status: 'Pending Verification' } });

    res.json({
      success: true,
      data: {
        totalActiveServers,
        suspendedServers,
        inGracePeriod,
        renewalsDue,
        todaysRevenue: todaysRevenueResult || 0,
        monthlyRevenue: monthlyRevenueResult || 0,
        pendingPayments
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
