const express = require('express');
const QuestionController = require('../controllers/question.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router({ mergeParams: true });

router.get('/', QuestionController.getQuestions);
router.post('/', authenticate, QuestionController.askQuestion);
router.post('/:id/answers', authenticate, QuestionController.answerQuestion);

module.exports = router;
