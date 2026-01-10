import React, { useState, useEffect, useRef } from 'react';
import './Testimonials.css';
import { StarIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '../context/LanguageContext';

const Testimonials = () => {
    const { t } = useLanguage();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const timeoutRef = useRef(null);

    // Hardcoded data for testimonials
    const testimonials = [
        {
            id: 1,
            name: "Ahmed Hassan",
            role: "Gamer",
            rating: 5,
            text: "Best laptop buying experience in Egypt! The team guided me to the perfect ROG Strix for my budget. Delivery was super fast.",
            avatar: "AH"
        },
        {
            id: 2,
            name: "Sarah Mahmoud",
            role: "Graphic Designer",
            rating: 5,
            text: "I needed a powerful workstation for 3D rendering. A Plus+ recommended a Legion Pro 7i and it's a beast. Customer support is top-notch.",
            avatar: "SM"
        },
        {
            id: 3,
            name: "Omar Khaled",
            role: "Student",
            rating: 4,
            text: "Great prices compared to other stores. The open box policy gave me peace of mind. Highly recommended!",
            avatar: "OK"
        },
        {
            id: 4,
            name: "Laila Youssef",
            role: "Content Creator",
            rating: 5,
            text: "The delivery was extremely fast, and the packaging was secure. The laptop arrived in perfect condition. Will definitely buy again.",
            avatar: "LY"
        }
    ];

    const delay = 5000;

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    useEffect(() => {
        resetTimeout();
        if (!isPaused) {
            timeoutRef.current = setTimeout(() => {
                setCurrentIndex((prevIndex) =>
                    prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
                );
            }, delay);
        }

        return () => {
            resetTimeout();
        };
    }, [currentIndex, isPaused, testimonials.length]);

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <section className="testimonials-section section-padding">
            <div className="container">
                <div className="section-header">
                    <h2>What Our Customers Say</h2>
                    <p>Trusted by gamers and professionals across Egypt</p>
                </div>

                <div
                    className="testimonials-carousel-wrapper"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                >
                    <button
                        className="nav-btn prev-btn"
                        onClick={handlePrev}
                        aria-label="Previous Review"
                    >
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>

                    <div className="testimonial-card-container">
                        <div
                            className="testimonial-track"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {testimonials.map((review) => (
                                <div className="testimonial-slide" key={review.id}>
                                    <div className="testimonial-card card">
                                        <div className="testimonial-header">
                                            <div className="avatar-circle">
                                                {review.avatar}
                                            </div>
                                            <div className="user-info">
                                                <h3>{review.name}</h3>
                                                <span className="user-role">{review.role}</span>
                                            </div>
                                            <div className="rating-stars">
                                                {[...Array(5)].map((_, i) => (
                                                    <StarIcon
                                                        key={i}
                                                        className={`star-icon ${i < review.rating ? 'filled' : ''}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="testimonial-body">
                                            <p>"{review.text}"</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        className="nav-btn next-btn"
                        onClick={handleNext}
                        aria-label="Next Review"
                    >
                        <ChevronRightIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="carousel-dots">
                    {testimonials.map((_, idx) => (
                        <div
                            key={idx}
                            className={`dot ${currentIndex === idx ? "active" : ""}`}
                            onClick={() => setCurrentIndex(idx)}
                        ></div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
