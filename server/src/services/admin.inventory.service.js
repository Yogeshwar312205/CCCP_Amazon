const {
  Inventory,
  InventoryTransaction,
  Product,
  ProductVariant,
  sequelize,
} = require('../models');
const { Op } = require('sequelize');
const AuditService = require('./audit.service');

class AdminInventoryService {
  /**
   * Get all inventory items with filtering
   */
  static async getInventory({ page = 1, limit = 15, lowStockOnly = false, search = '' }) {
    const offset = (page - 1) * limit;
    const where = {};

    if (lowStockOnly === 'true' || lowStockOnly === true) {
      where[Op.and] = [sequelize.literal('`stock_quantity` <= `low_stock_threshold`')];
    }

    const { count, rows: inventory } = await Inventory.findAndCountAll({
      where,
      limit,
      offset,
      order: [['stockQuantity', 'ASC']],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'sku', 'brand'],
          where: search ? { title: { [Op.like]: `%${search}%` } } : undefined,
        },
        {
          model: ProductVariant,
          as: 'variant',
          attributes: ['id', 'sku', 'variantName', 'price'],
        },
      ],
    });

    return {
      inventory,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Adjust Stock with Inventory Transaction Audit Trail
   */
  static async adjustStock(inventoryId, { quantityChange, type, notes }, adminId) {
    const transaction = await sequelize.transaction();

    try {
      const inventory = await Inventory.findByPk(inventoryId, {
        include: [{ model: ProductVariant, as: 'variant' }],
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!inventory) {
        const error = new Error('Inventory record not found');
        error.statusCode = 404;
        throw error;
      }

      const newStock = inventory.stockQuantity + quantityChange;
      if (newStock < 0) {
        const error = new Error('Adjustment would result in negative stock');
        error.statusCode = 400;
        throw error;
      }

      inventory.stockQuantity = newStock;
      await inventory.save({ transaction });

      // If tied to a variant, sync variant stock quantity
      if (inventory.variant) {
        inventory.variant.stockQuantity = newStock;
        await inventory.variant.save({ transaction });
      }

      // Log transaction
      const auditLog = await InventoryTransaction.create(
        {
          inventoryId: inventory.id,
          quantityChange,
          type: type || 'ADJUSTMENT',
          performedBy: adminId,
          notes: notes || `Manual stock adjustment by admin #${adminId}`,
        },
        { transaction }
      );

      await transaction.commit();

      await AuditService.log({
        userId: adminId,
        action: 'ADJUST_INVENTORY',
        entityType: 'INVENTORY',
        entityId: inventory.id,
        oldValues: { stockQuantity: newStock - quantityChange },
        newValues: { stockQuantity: newStock, quantityChange, type },
      });

      return {
        inventory,
        auditLog,
      };
    } catch (error) {
      if (transaction && !transaction.finished) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  /**
   * Get transaction history for an inventory item
   */
  static async getTransactionHistory(inventoryId) {
    return await InventoryTransaction.findAll({
      where: { inventoryId },
      order: [['createdAt', 'DESC']],
      limit: 20,
    });
  }
}

module.exports = AdminInventoryService;
