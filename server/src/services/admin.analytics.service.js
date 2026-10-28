const { Order, OrderItem, User, Product, Inventory, sequelize } = require('../models');
const { Op } = require('sequelize');

class AdminAnalyticsService {
  /**
   * KPI Overview stats
   */
  static async getOverviewStats(currentUser = null) {
    const adminProductFilter = currentUser?.role === 'ADMIN' ? { createdBy: currentUser.id } : undefined;
    const orderOwnershipInclude = currentUser?.role === 'ADMIN'
      ? [{
          model: OrderItem,
          as: 'items',
          required: true,
          include: [{ model: Product, as: 'product', where: adminProductFilter, attributes: [] }],
        }]
      : [];

    // 1. Total Revenue
    const revenueOrders = await Order.findAll({
      attributes: ['totalAmount'],
      where: {
        status: { [Op.ne]: 'CANCELLED' },
      },
      include: orderOwnershipInclude,
      distinct: true,
    });
    const totalRevenue = revenueOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

    // 2. Total Orders
    const totalOrders = await Order.count({ include: orderOwnershipInclude, distinct: true });

    // 3. Active Customers
    const totalCustomers = await User.count({
      where: { role: 'CUSTOMER', isActive: true },
    });

    // 4. Low stock items count
    const lowStockItemsCount = await Inventory.count({
      where: sequelize.literal('`stock_quantity` <= `low_stock_threshold`'),
      include: [{
        model: Product,
        as: 'product',
        where: adminProductFilter,
        attributes: [],
      }],
    });

    // 5. Recent 5 orders
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        ...orderOwnershipInclude,
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
      ],
      subQuery: false,
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
  static async getSalesChartData(days = 14, currentUser = null) {
    days = Math.min(Math.max(parseInt(days, 10) || 14, 1), 365);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const orders = await Order.findAll({
      attributes: ['placedAt', 'totalAmount'],
      where: {
        placedAt: { [Op.gte]: startDate },
        status: { [Op.ne]: 'CANCELLED' },
      },
      include: currentUser?.role === 'ADMIN'
        ? [{
            model: OrderItem,
            as: 'items',
            required: true,
            include: [{ model: Product, as: 'product', where: { createdBy: currentUser.id }, attributes: [] }],
          }]
        : [],
      order: [['placedAt', 'ASC']],
    });

    const byDate = new Map();
    for (const order of orders) {
      const date = new Date(order.placedAt).toISOString().slice(0, 10);
      const current = byDate.get(date) || { date, orders: 0, revenue: 0 };
      current.orders += 1;
      current.revenue += parseFloat(order.totalAmount || 0);
      byDate.set(date, current);
    }
    return [...byDate.values()];
  }

  /**
   * Top Selling Products
   */
  static async getTopProducts(limit = 5, currentUser = null) {
    limit = Math.min(Math.max(parseInt(limit, 10) || 5, 1), 100);
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
      include: currentUser?.role === 'ADMIN'
        ? [{ model: Product, as: 'product', where: { createdBy: currentUser.id }, attributes: [] }]
        : [],
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
