import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore/lite';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import './ReviewList.css';

const ReviewList = ({ productId }) => {
    const { currentUser } = useAuth();
    const { success, error: toastError } = useToast();
    const { t } = useLanguage();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formError, setFormError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const [newReview, setNewReview] = useState({
        rating: 5,
        text: ''
    });

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const q = query(
                collection(db, "reviews"),
                where("productId", "==", productId),
                orderBy("createdAt", "desc")
            );
            const querySnapshot = await getDocs(q);
            const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setReviews(items);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const validateReview = () => {
        if (!newReview.text.trim()) {
            setFormError(t('errors.required') || 'This field is required');
            return false;
        }
        if (newReview.text.trim().length < 10) {
            setFormError(t('errors.reviewMin') || 'Review must be at least 10 characters');
            return false;
        }
        setFormError('');
        return true;
    };

    const handleTextChange = (e) => {
        setNewReview({ ...newReview, text: e.target.value });
        if (formError) setFormError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        if (!validateReview()) return;

        setSubmitting(true);

        try {
            await addDoc(collection(db, "reviews"), {
                productId,
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email.split('@')[0],
                userRole: "Verified Customer",
                rating: Number(newReview.rating),
                text: newReview.text,
                createdAt: serverTimestamp()
            });

            setShowSuccess(true);
            success("Review submitted! Thank you.");
            setNewReview({ rating: 5, text: '' });
            setFormError('');
            fetchReviews();

            // Close form after success animation
            setTimeout(() => {
                setShowSuccess(false);
                setShowForm(false);
            }, 3000);

        } catch (err) {
            console.error(err);
            toastError("Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'Just now';
        const date = timestamp.toDate();
        return date.toLocaleDateString();
    };

    return (
        <div className="reviews-section">
            <div className="reviews-header-row">
                <h3 className="reviews-title">Reviews ({reviews.length}) ⭐</h3>
                {currentUser && !showForm && (
                    <button className="btn btn-sm btn-outline" onClick={() => setShowForm(true)}>Write a Review</button>
                )}
            </div>

            {showForm && (
                <div className="review-form animate-fade-in">
                    {showSuccess ? (
                        <div className="success-state">
                            <div className="success-checkmark">
                                <svg viewBox="0 0 52 52">
                                    <circle cx="26" cy="26" r="25" fill="none" className="checkmark-circle" />
                                    <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="checkmark-check" />
                                </svg>
                            </div>
                            <h3>Review Submitted!</h3>
                            <p>Thank you for your feedback.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label>Rating</label>
                                <div className="star-rating-input">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <span
                                            key={star}
                                            onClick={() => !submitting && setNewReview({ ...newReview, rating: star })}
                                            style={{
                                                cursor: submitting ? 'not-allowed' : 'pointer',
                                                opacity: star <= newReview.rating ? 1 : 0.3,
                                                fontSize: '1.5rem'
                                            }}
                                            role="button"
                                            aria-label={`Rate ${star} stars`}
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    !submitting && setNewReview({ ...newReview, rating: star });
                                                }
                                            }}
                                        >
                                            ⭐
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className={`form-group ${formError ? 'has-error' : ''}`}>
                                <textarea
                                    placeholder="Share your experience with this product..."
                                    value={newReview.text}
                                    onChange={handleTextChange}
                                    disabled={submitting}
                                    rows="3"
                                    aria-describedby={formError ? 'review-error' : undefined}
                                />
                                {formError && (
                                    <span id="review-error" className="field-error" role="alert">
                                        {formError}
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-sm"
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        <span className="btn-loading">
                                            <span className="spinner-sm"></span>
                                            {t('errors.submitting') || 'Submitting...'}
                                        </span>
                                    ) : 'Submit Review'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-outline btn-sm"
                                    onClick={() => {
                                        setShowForm(false);
                                        setFormError('');
                                        setNewReview({ rating: 5, text: '' });
                                    }}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            <div className="reviews-grid">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <div key={review.id} className="review-card">
                            <div className="review-header">
                                <div className="reviewer-info">
                                    <span className="reviewer-name">{review.userName}</span>
                                    <span className="reviewer-role">{review.userRole}</span>
                                </div>
                                <div className="review-stars">
                                    {"⭐".repeat(review.rating)}
                                </div>
                            </div>
                            <p className="review-text">"{review.text}"</p>
                            <span className="review-date">{formatDate(review.createdAt)}</span>
                        </div>
                    ))
                ) : (
                    <div className="no-reviews">
                        <p>No reviews yet. Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewList;
