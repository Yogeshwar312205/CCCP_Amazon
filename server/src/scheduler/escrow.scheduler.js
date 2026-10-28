/**
 * Escrow Settlement Scheduler
 *
 * Runs every hour. For each SellerOrder that:
 *   - Has status = 'DELIVERED'
 *   - Has payoutSettled = false
 *   - Was delivered more than N days ago (PlatformSettings.escrowReturnWindowDays)
 *
 * It moves funds from Shop.escrowBalance → Shop.availableBalance and
 * marks the SellerOrder as payoutSettled = true.
 *
 * Also expires stale ProductBoosts hourly.
 *
 * Usage (called from server.js on startup):
 *   const { startScheduler } = require('./src/scheduler/escrow.scheduler');
 *   startScheduler();
 */

const { Op } = require('sequelize');
const { SellerOrder, Shop, Notification, PlatformSettings, sequelize } = require('../models');
const BoostService = require('../services/boost.service');
const logger = require('../../config/logger');

async function runEscrowSettlement() {
  try {
    const settings = await PlatformSettings.getSingleton();
    const windowDays = settings.escrowReturnWindowDays;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - windowDays);

    // Find all delivered, unsettled orders past the return window
    const eligibleOrders = await SellerOrder.findAll({
      where: {
        status: 'DELIVERED',
        payoutSettled: false,
        deliveredAt: { [Op.lt]: cutoffDate },
      },
      include: [{ model: Shop, as: 'shop' }],
    });

    if (eligibleOrders.length === 0) {
      logger.debug(`[Escrow Scheduler] No eligible orders to settle.`);
      return;
    }

    logger.info(`[Escrow Scheduler] Settling ${eligibleOrders.length} orders...`);

    for (const sellerOrder of eligibleOrders) {
      const t = await sequelize.transaction();
      try {
        const earnings = parseFloat(sellerOrder.sellerEarnings);

        // Move from escrow → available balance
        await Shop.decrement('escrowBalance', {
          by: earnings,
          where: { id: sellerOrder.shopId },
          transaction: t,
        });
        await Shop.increment('availableBalance', {
          by: earnings,
          where: { id: sellerOrder.shopId },
          transaction: t,
        });

        sellerOrder.payoutSettled = true;
        sellerOrder.escrowReleasedAt = new Date();
        await sellerOrder.save({ transaction: t });

        // Notify seller
        await Notification.create(
          {
            userId: sellerOrder.shop.userId,
            title: 'Funds Cleared for Withdrawal',
            message: `$${earnings.toFixed(2)} from order #${sellerOrder.orderId} is now available for withdrawal.`,
            type: 'ORDER_STATUS',
            link: '/seller/balance',
          },
          { transaction: t }
        );

        await t.commit();
        logger.info(`[Escrow Scheduler] Settled SellerOrder ${sellerOrder.id} — $${earnings.toFixed(2)} released.`);
      } catch (err) {
        await t.rollback();
        logger.error(`[Escrow Scheduler] Failed to settle SellerOrder ${sellerOrder.id}:`, err);
      }
    }
  } catch (err) {
    logger.error('[Escrow Scheduler] Settlement run failed:', err);
  }
}

async function runBoostExpiry() {
  try {
    const expired = await BoostService.expireStaleBoosts();
    if (expired > 0) {
      logger.info(`[Boost Expiry] Expired ${expired} boost campaign(s).`);
    }
  } catch (err) {
    logger.error('[Boost Expiry] Failed:', err);
  }
}

let schedulerInterval = null;

function startScheduler() {
  // Run immediately on startup, then every hour
  runEscrowSettlement();
  runBoostExpiry();

  schedulerInterval = setInterval(() => {
    runEscrowSettlement();
    runBoostExpiry();
  }, 60 * 60 * 1000); // every 1 hour

  logger.info('[Escrow Scheduler] Started — running every 1 hour.');
}

function stopScheduler() {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    logger.info('[Escrow Scheduler] Stopped.');
  }
}

module.exports = { startScheduler, stopScheduler, runEscrowSettlement, runBoostExpiry };
