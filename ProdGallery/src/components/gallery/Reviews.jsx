import { useState, useEffect } from "react";
import { reviewsAPI } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Reviews({ photoId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [photoId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsAPI.getByPhoto(photoId);
      setReviews(data);
    } catch (err) {
      console.error("Failed to load reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert("Please login to leave a review");
      return;
    }

    try {
      setSubmitting(true);
      await reviewsAPI.create({
        photo_id: photoId,
        rating,
        comment,
      });
      setComment("");
      setRating(5);
      fetchReviews();
      alert("Review submitted successfully!");
    } catch (err) {
      alert(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await reviewsAPI.delete(reviewId);
      fetchReviews();
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  const renderStars = (value, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={interactive ? () => setRating(star) : undefined}
            className={`text-2xl ${
              star <= value ? "text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-500" : ""}`}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Reviews & Ratings</h2>

      {/* Average Rating */}
      {reviews.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-emerald-600">
              {averageRating}
            </div>
            <div>
              {renderStars(Math.round(averageRating))}
              <p className="text-sm text-gray-600 mt-1">
                Based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Review Form */}
      {user && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Leave a Review</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            {renderStars(rating, true)}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              maxLength="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Share your thoughts about this photo..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/1000 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{review.user?.name || "Anonymous"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(review.rating)}
                    <span className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {user && user.id === review.user_id && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
              {review.comment && (
                <p className="text-gray-700 mt-2">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
