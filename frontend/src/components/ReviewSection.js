import React, { useState, useEffect, useCallback } from 'react';
import { reviewsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaStar, FaRegStar } from 'react-icons/fa';
import './ReviewSection.css';

const ReviewSection = ({ targetType, targetId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();

    const fetchReviews = useCallback(async () => {
        try {
            const res = await reviewsAPI.getByTarget(targetType, targetId);
            const data = res?.data ?? res;
            setReviews(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch reviews:', err);
        } finally {
            setLoading(false);
        }
    }, [targetType, targetId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert('Please login to leave a review.');

        setSubmitting(true);
        try {
            const token = localStorage.getItem('userToken');
            await reviewsAPI.create({ ...newReview, targetId, targetType }, token);
            setNewReview({ rating: 5, comment: '' });
            fetchReviews();
        } catch (err) {
            alert('Failed to post review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="review-section">
            <h3>Community Reviews</h3>

            {user && (
                <form onSubmit={handleSubmit} className="review-form glass">
                    <h4>Leave a Review</h4>
                    <div className="rating-input">
                        {[1, 2, 3, 4, 5].map(num => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => setNewReview({ ...newReview, rating: num })}
                                className={newReview.rating >= num ? 'active' : ''}
                            >
                                {newReview.rating >= num ? <FaStar /> : <FaRegStar />}
                            </button>
                        ))}
                    </div>
                    <textarea
                        placeholder="Share your thoughts..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        required
                    />
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Posting...' : 'Post Review'}
                    </button>
                </form>
            )}

            {loading ? <p>Loading reviews...</p> : (
                <div className="review-list">
                    {reviews?.length > 0 ? reviews.map(review => (
                        <div key={review._id} className="review-item glass">
                            <div className="review-header">
                                <strong>{review.User?.name}</strong>
                                <div className="stars">
                                    {[...Array(5)].map((_, i) => (
                                        i < review.rating ? <FaStar key={i} /> : <FaRegStar key={i} />
                                    ))}
                                </div>
                            </div>
                            <p>{review.comment}</p>
                            <small>{new Date(review.createdAt).toLocaleDateString()}</small>
                        </div>
                    )) : <p className="empty-message">No reviews yet. Be the first to share your thoughts!</p>}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
