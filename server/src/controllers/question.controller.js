const QuestionService = require('../services/question.service');

class QuestionController {
  static async getQuestions(req, res, next) {
    try {
      const { productId } = req.params;
      const result = await QuestionService.getProductQuestions(productId, req.query);
      return res.status(200).json({
        success: true,
        message: 'Product questions retrieved',
        data: { questions: result.questions },
        meta: { pagination: result.pagination },
      });
    } catch (error) {
      next(error);
    }
  }

  static async askQuestion(req, res, next) {
    try {
      const { productId } = req.params;
      const { question } = req.body;
      const q = await QuestionService.askQuestion(req.user.id, productId, question);
      return res.status(201).json({
        success: true,
        message: 'Question submitted successfully',
        data: { question: q },
      });
    } catch (error) {
      next(error);
    }
  }

  static async answerQuestion(req, res, next) {
    try {
      const { id } = req.params;
      const { answer } = req.body;
      const ans = await QuestionService.answerQuestion(req.user.id, id, answer, req.user.role);
      return res.status(201).json({
        success: true,
        message: 'Answer posted successfully',
        data: { answer: ans },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = QuestionController;
