import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { questionApi } from '../../services/questionApi';
import { HelpCircle, MessageSquare, ShieldCheck, Send } from 'lucide-react';

const QuestionSection = ({ productId }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [answerInput, setAnswerInput] = useState({});
  const [loading, setLoading] = useState(false);

  const loadQuestions = async () => {
    try {
      const res = await questionApi.getQuestions(productId);
      setQuestions(res.data.questions);
    } catch (err) {
      console.error('Failed to load questions:', err);
    }
  };

  useEffect(() => {
    if (productId) loadQuestions();
  }, [productId]);

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    try {
      setLoading(true);
      await questionApi.askQuestion(productId, newQuestion);
      setNewQuestion('');
      loadQuestions();
    } catch (err) {
      console.error('Failed to ask question:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnswer = async (questionId) => {
    const text = answerInput[questionId];
    if (!text || !text.trim()) return;
    try {
      await questionApi.answerQuestion(questionId, text);
      setAnswerInput((prev) => ({ ...prev, [questionId]: '' }));
      loadQuestions();
    } catch (err) {
      console.error('Failed to post answer:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mt-6 text-xs">
      <div className="flex items-center space-x-2 border-b pb-3 mb-4">
        <HelpCircle className="w-5 h-5 text-amazon-orange" />
        <h3 className="font-bold text-base text-gray-900">Customer Questions & Answers</h3>
      </div>

      {/* Ask Question Box */}
      {isAuthenticated ? (
        <form onSubmit={handleAskQuestion} className="mb-6 flex gap-2">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Have a question? Search for answers or ask the seller..."
            className="flex-grow border rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-amazon-orange"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold px-4 py-2 rounded flex items-center space-x-1"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      ) : (
        <p className="text-gray-500 mb-4 font-medium">Please sign in to ask a question.</p>
      )}

      {/* Question Accordion List */}
      {questions.length === 0 ? (
        <p className="text-gray-500 italic">No questions asked yet for this product. Be the first to ask!</p>
      ) : (
        <div className="space-y-4 divide-y">
          {questions.map((q) => (
            <div key={q.id} className="pt-3 space-y-2">
              <div className="flex items-start space-x-2 font-bold text-gray-900">
                <span className="text-amazon-orange">Q:</span>
                <span>{q.question}</span>
              </div>

              {q.answers && q.answers.length > 0 ? (
                <div className="pl-5 space-y-2">
                  {q.answers.map((ans) => (
                    <div key={ans.id} className="bg-gray-50 p-2.5 rounded border">
                      <div className="flex items-center space-x-2 text-[11px] text-gray-600 mb-1">
                        <span className="font-bold text-gray-900">
                          {ans.answerer?.firstName} {ans.answerer?.lastName}
                        </span>
                        {ans.isAdminAnswer && (
                          <span className="bg-amazon-orange text-amazon-blue font-bold text-[9px] px-1.5 py-0.2 rounded flex items-center space-x-0.5">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Seller / Admin</span>
                          </span>
                        )}
                      </div>
                      <p className="text-gray-800">{ans.answer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="pl-5 text-gray-400 italic">No answers yet.</p>
              )}

              {/* Answer Input Box */}
              {isAuthenticated && (
                <div className="pl-5 pt-1 flex gap-2">
                  <input
                    type="text"
                    value={answerInput[q.id] || ''}
                    onChange={(e) => setAnswerInput({ ...answerInput, [q.id]: e.target.value })}
                    placeholder="Provide an answer..."
                    className="flex-grow border rounded p-1.5 text-xs"
                  />
                  <button
                    onClick={() => handlePostAnswer(q.id)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-3 py-1 rounded"
                  >
                    Answer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuestionSection;
