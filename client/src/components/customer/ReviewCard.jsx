import React from 'react';
import StarRating from './StarRating';
import { CheckCircle2, User } from 'lucide-react';

const ReviewCard = ({ review }) => {
  const authorName = review.author
    ? `${review.author.firstName} ${review.author.lastName}`
    : 'Verified Customer';

  return (
    <div className="border-b py-4 space-y-2 text-xs">
      <div className="flex items-center space-x-2">
        <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
          <User className="w-4 h-4" />
        </div>
        <span className="font-bold text-gray-900">{authorName}</span>
      </div>

      <div className="flex items-center space-x-2">
        <StarRating rating={review.rating} readOnly size="w-3.5 h-3.5" />
        <h4 className="font-bold text-gray-900">{review.title}</h4>
      </div>

      <p className="text-gray-400 text-[10px]">
        Reviewed on {new Date(review.createdAt).toLocaleDateString()}
      </p>

      {review.isVerifiedPurchase && (
        <span className="inline-flex items-center space-x-1 text-amazon-orange font-bold text-[10px]">
          <CheckCircle2 className="w-3 h-3 text-amazon-orange" />
          <span>Verified Purchase</span>
        </span>
      )}

      <p className="text-gray-700 leading-relaxed mt-1">{review.comment}</p>

      {review.images && review.images.length > 0 && (
        <div className="flex space-x-2 pt-2">
          {review.images.map((img, i) => (
            <img
              key={i}
              src={img.imageUrl}
              alt="Review attachment"
              className="w-16 h-16 object-cover border rounded"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
