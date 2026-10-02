const { Payment } = require('../models');

class PaymentService {
  static async processMockPayment(orderId, amount, paymentMethod = 'MOCK_GATEWAY', simulateFailure = false, transaction = null) {
    const transactionId = `TXN-MOCK-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (simulateFailure) {
      const payment = await Payment.create(
        {
          orderId,
          paymentMethod,
          transactionId,
          amount,
          status: 'FAILED',
          paymentGatewayResponse: {
            simulated: true,
            reason: 'Card decline simulation test',
            timestamp: new Date().toISOString(),
          },
        },
        { transaction }
      );
      return { success: false, payment };
    }

    const payment = await Payment.create(
      {
        orderId,
        paymentMethod,
        transactionId,
        amount,
        status: 'SUCCESS',
        paymentGatewayResponse: {
          simulated: true,
          gateway: 'MockPaymentServer',
          responseCode: '200_OK',
          timestamp: new Date().toISOString(),
        },
      },
      { transaction }
    );

    return { success: true, payment };
  }
}

module.exports = PaymentService;
