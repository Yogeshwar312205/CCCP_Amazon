const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

/**
 * PlatformSettings — Super Admin Configurable Global Settings
 *
 * Single-row table (always id = 1). Use PlatformSettings.getSingleton()
 * to fetch or lazily create with defaults.
 *
 * Settings managed here:
 *   - defaultCommissionRate  : fallback if no category commission exists
 *   - escrowReturnWindowDays : days after delivery before escrow releases
 *   - maxBoostProductsPer10  : ad density cap (e.g. 2 boosted per 10 organic)
 */
const PlatformSettings = sequelize.define('platform_settings', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  // Global commission fallback (%)
  defaultCommissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 10.00,
    field: 'default_commission_rate',
  },
  // Days after delivery before escrow is released to seller
  escrowReturnWindowDays: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 7,
    field: 'escrow_return_window_days',
  },
  // Max sponsored items per 10 organic results
  maxBoostProductsPer10: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 2,
    field: 'max_boost_products_per10',
  },
  // Auto-suspend a shop if refund rate exceeds this threshold (%)
  autoSuspendRefundRateThreshold: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 5.00,
    field: 'auto_suspend_refund_rate_threshold',
  },
}, {
  tableName: 'platform_settings',
});

/**
 * Fetch the singleton settings row, creating it with defaults if absent.
 * Always call this instead of findByPk(1) directly.
 */
PlatformSettings.getSingleton = async () => {
  const [settings] = await PlatformSettings.findOrCreate({
    where: { id: 1 },
    defaults: {
      defaultCommissionRate: 10.00,
      escrowReturnWindowDays: 7,
      maxBoostProductsPer10: 2,
      autoSuspendRefundRateThreshold: 5.00,
    },
  });
  return settings;
};

module.exports = PlatformSettings;
