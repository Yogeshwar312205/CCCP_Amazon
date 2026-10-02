import React, { useState } from 'react';
import StarRating from './StarRating';
import { reviewApi } from '../../services/reviewApi';
import { Upload, AlertCircle } from 'lucide-react';

const ReviewForm = ({ productId, onReviewAdded }) => {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('rating', rating);
      formData.append('title', title);
      formData.append('comment', comment);

      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }

      await reviewApi.addReview(productId, formData);
      setTitle('');
      setComment('');
      setImages([]);
      setRating(5);
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border rounded-lg p-4 space-y-3 text-xs mb-6">
      <h3 className="font-bold text-sm text-gray-900">Create Review</h3>

      {error && (
        <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block font-bold mb-1">Overall Rating</label>
        <StarRating rating={rating} setRating={setRating} size="w-5 h-5" />
      </div>

      <div>
        <label className="block font-bold mb-1">Add a headline</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's most important to know?"
          required
          className="w-full border p-2 rounded text-xs"
        />
      </div>

      <div>
        <label className="block font-bold mb-1">Add a written review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What did you like or dislike? What did you use this product for?"
          rows={3}
          required
          className="w-full border p-2 rounded text-xs"
        />
      </div>

      <div>
        <label className="block font-bold mb-1">Add photos (Max 3)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files).slice(0, 3))}
          className="text-xs text-gray-600"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-amazon-yellow hover:bg-yellow-400 text-amazon-blue font-bold px-4 py-2 rounded text-xs shadow transition disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
