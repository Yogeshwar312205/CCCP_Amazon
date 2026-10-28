const sequelize = require('../../config/database');

async function ensurePaymentMethods() {
  const [columns] = await sequelize.query(`
    SELECT COLUMN_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'payments'
      AND COLUMN_NAME = 'payment_method'
  `);

  if (columns.length === 0 || columns[0].COLUMN_TYPE.includes("'UPI'")) {
    return;
  }

  await sequelize.query(`
    ALTER TABLE payments
    MODIFY COLUMN payment_method
    ENUM('CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET', 'PAYPAL', 'MOCK_GATEWAY')
    NOT NULL DEFAULT 'MOCK_GATEWAY'
  `);
}

module.exports = ensurePaymentMethods;
