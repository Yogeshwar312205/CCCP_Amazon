const { ProductQuestion, ProductAnswer, User } = require('../models');
const paginate = require('../utils/paginate');

class QuestionService {
  static async getProductQuestions(productId, query = {}) {
    const { limit, offset, buildMeta } = paginate(query);

    const { count, rows } = await ProductQuestion.findAndCountAll({
      where: { productId },
      include: [
        { model: User, as: 'asker', attributes: ['firstName', 'lastName'] },
        {
          model: ProductAnswer,
          as: 'answers',
          include: [{ model: User, as: 'answerer', attributes: ['firstName', 'lastName'] }],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return { questions: rows, pagination: buildMeta(count) };
  }

  static async askQuestion(userId, productId, questionText) {
    return await ProductQuestion.create({
      productId,
      userId,
      question: questionText,
      isAnswered: false,
    });
  }

  static async answerQuestion(userId, questionId, answerText, userRole) {
    const question = await ProductQuestion.findByPk(questionId);
    if (!question) {
      const error = new Error('Question not found');
      error.statusCode = 404;
      error.code = 'QUESTION_NOT_FOUND';
      throw error;
    }

    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

    const answer = await ProductAnswer.create({
      questionId,
      userId,
      answer: answerText,
      isAdminAnswer: isAdmin,
    });

    question.isAnswered = true;
    await question.save();

    return answer;
  }
}

module.exports = QuestionService;
