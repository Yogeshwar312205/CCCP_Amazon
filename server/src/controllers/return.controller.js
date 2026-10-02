const ReturnService = require('../services/return.service');

const getReturns = async (req, res, next) => {
  try {
    const returns = await ReturnService.getUserReturns(req.user.id);
    res.json({ success: true, data: returns });
  } catch (err) { next(err); }
};

const requestReturn = async (req, res, next) => {
  try {
    const { orderId, reason, details } = req.body;
    const returnRequest = await ReturnService.requestReturn(
      req.user.id, orderId, reason, details
    );
    res.status(201).json({
      success: true,
      message: 'Return request submitted successfully',
      data: returnRequest,
    });
  } catch (err) { next(err); }
};

module.exports = { getReturns, requestReturn };
