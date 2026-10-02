const { Order, OrderItem, User, Product, Inventory, sequelize } = require('../models');
const { Op } = require('sequelize');

class AdminAnalyticsService {
  /**
   * KPI Overview stats
   */
  static async getOverviewStats() {
    // 1. Total Revenue
    const revenueResult = await Order.findOne({
      attributes: [[sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_amount')), 0), 'totalRevenue']],
      where: {
        status: { [Op.ne]: 'CANCELLED' },
      },
      raw: true,
    });
    const totalRevenue = parseFloat(revenueResult?.totalRevenue || 0);

    // 2. Total Orders
    const totalOrders = await Order.count();

    // 3. Active Customers
    const totalCustomers = await User.count({
      where: { role: 'CUSTOMER', isActive: true },
    });

    // 4. Low stock items count
    const lowStockItemsCount = await Inventory.count({
      where: sequelize.literal('`stock_quantity` <= `low_stock_threshold`'),
    });

    // 5. Recent 5 orders
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
      ],
    });

    return {
      totalRevenue,
      totalOrders,
      totalCustomers,
      lowStockItemsCount,
      recentOrders,
    };
  }

  /**
   * Sales Chart: Daily aggregation for last 14 days
   */
  static async getSalesChartData(days = 14) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('placed_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'ordersCount'],
        [sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('total_amount')), 0), 'dailyRevenue'],
      ],
      where: {
        placedAt: { [Op.gte]: startDate },
        status: { [Op.ne]: 'CANCELLED' },
      },
      group: [sequelize.fn('DATE', sequelize.col('placed_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('placed_at')), 'ASC']],
      raw: true,
    });

    return orders.map((o) => ({
      date: o.date,
      orders: parseInt(o.ordersCount, 10),
      revenue: parseFloat(o.dailyRevenue),
    }));
  }

  /**
   * Top Selling Products
   */
  static async getTopProducts(limit = 5) {
    const topItems = await OrderItem.findAll({
      attributes: [
        'productId',
        'productName',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
        [sequelize.fn('SUM', sequelize.col('subtotal')), 'totalRevenue'],
      ],
      group: ['productId', 'productName'],
      order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
      limit,
      raw: true,
    });

    return topItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      totalSold: parseInt(item.totalSold, 10),
      totalRevenue: parseFloat(item.totalRevenue),
    }));
  }
}

module.exports = AdminAnalyticsService;
