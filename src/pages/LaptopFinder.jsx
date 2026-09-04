import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import {
    Sparkles,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    Monitor,
    Briefcase,
    GraduationCap,
    DollarSign,
    Zap,
    Battery,
    Star,
    Gamepad2,
    Wallet,
    Gem
} from 'lucide-react';
import SEO from '../components/SEO';
import AIConcierge from '../components/AIConcierge';
import { searchLaptops } from '../utils/semanticSearch';
import MatchVisualizer from '../components/MatchVisualizer';
import { trackEvent } from '../utils/analytics';
import './LaptopFinder.css';

const LaptopFinder = () => {
    const { t } = useLanguage();
    const [useAI, setUseAI] = useState(false);
    const [laptops, setLaptops] = useState([]);
    const [step, setStep] = useState(0); // 0 = welcome, 1-3 = questions, 4 = results
    const [answers, setAnswers] = useState({
        use: '',
        budget: '',
        priority: ''
    });
    const [results, setResults] = useState([]);
    const [isCalculating, setIsCalculating] = useState(false);

    const totalSteps = 3;

    // Quiz questions configuration
    const questions = [
        {
            id: 'use',
            title: t('finder.useTitle') || "What will you use it for?",
            subtitle: t('finder.useSubtitle') || "Choose the primary purpose",
            options: [
                {
                    value: 'gaming',
                    icon: <Gamepad2 size={24} />,
                    title: t('finder.gaming') || 'Gaming & Heavy Design',
                    desc: t('finder.gamingDesc') || 'High FPS, 3D rendering, heavy editing',
                    color: 'purple'
                },
                {
                    value: 'work',
                    icon: <Briefcase size={24} />,
                    title: t('finder.work') || 'Professional Work',
                    desc: t('finder.workDesc') || 'Coding, Office, Data analysis',
                    color: 'blue'
                },
                {
                    value: 'student',
                    icon: <GraduationCap size={24} />,
                    title: t('finder.student') || 'Student & Casual',
                    desc: t('finder.studentDesc') || 'Study, browsing, movies',
                    color: 'green'
                }
            ]
        },
        {
            id: 'budget',
            title: t('finder.budgetTitle') || "What's your budget?",
            subtitle: t('finder.budgetSubtitle') || "Select your price range",
            options: [
                {
                    value: 'low',
                    icon: <Wallet size={24} />,
                    title: t('finder.budget1') || 'Budget Friendly',
                    desc: t('finder.budget1Desc') || 'Under 15,000 EGP',
                    color: 'teal'
                },
                {
                    value: 'medium',
                    icon: <DollarSign size={24} />,
                    title: t('finder.budget2') || 'Mid-Range',
                    desc: t('finder.budget2Desc') || '15,000 - 30,000 EGP',
                    color: 'orange'
                },
                {
                    value: 'high',
                    icon: <Gem size={24} />,
                    title: t('finder.budget3') || 'Premium',
                    desc: t('finder.budget3Desc') || 'Above 30,000 EGP',
                    color: 'gold'
                }
            ]
        },
        {
            id: 'priority',
            title: t('finder.priorityTitle') || "What's most important?",
            subtitle: t('finder.prioritySubtitle') || "Your top priority",
            options: [
                {
                    value: 'performance',
                    icon: <Zap size={24} />,
                    title: t('finder.performance') || 'Raw Performance',
                    desc: t('finder.performanceDesc') || 'Speed and power above all',
                    color: 'red'
                },
                {
                    value: 'battery',
                    icon: <Battery size={24} />,
                    title: t('finder.battery') || 'Battery Life',
                    desc: t('finder.batteryDesc') || 'All-day unplugged usage',
                    color: 'green'
                },
                {
                    value: 'value',
                    icon: <Star size={24} />,
                    title: t('finder.value') || 'Best Value',
                    desc: t('finder.valueDesc') || 'Maximum specs for price',
                    color: 'blue'
                }
            ]
        }
    ];

    useEffect(() => {
        const fetchLaptops = async () => {
            const querySnapshot = await getDocs(collection(db, "laptops"));
            setLaptops(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchLaptops();
    }, []);

    const handleAnswer = (key, value) => {
        setAnswers(prev => ({ ...prev, [key]: value }));

        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            calculateResults({ ...answers, [key]: value });
        }
    };

    const calculateResults = (finalAnswers) => {
        setIsCalculating(true);
        const { use, budget, priority } = finalAnswers;

        trackEvent({
            category: 'Laptop Finder',
            action: 'Quiz Completed',
            label: `Use: ${use}, Budget: ${budget}, Priority: ${priority}`
        });

        // Construct a natural language query from answers to use our semantic search
        let queryBuilder = "";

        // Map use case
        if (use === 'gaming') queryBuilder += "High performance gaming laptop nvidia rtx ";
        if (use === 'work') queryBuilder += "Professional workstation heavy editing programming ";
        if (use === 'student') queryBuilder += "Student study university light ";

        // Map budget - we'll treat this as hard constraint or strong preference in search
        if (budget === 'low') queryBuilder += "budget friendly cheap under 15000 ";
        if (budget === 'medium') queryBuilder += "mid range price ";
        if (budget === 'high') queryBuilder += "premium expensive flagship ";

        // Map priority
        if (priority === 'performance') queryBuilder += "powerful cpu gpu fastest ";
        if (priority === 'battery') queryBuilder += "long battery life unplugged ";
        if (priority === 'value') queryBuilder += "best value for money deal ";

        setTimeout(() => {
            // Use semantic search
            const results = searchLaptops(queryBuilder, laptops).slice(0, 3);

            // Map results to include reasons if they aren't already there (searchLaptops provides them, but we might want to augment)
            const enhancedResults = results.map(r => ({
                ...r,
                // If search didn't give specific reasons, fallback to generic based on score
                reasons: r.matchReasons?.length ? r.matchReasons : [t('finder.matchReason') || 'Matches your criteria']
            }));

            setResults(enhancedResults);
            setStep(totalSteps + 1);
            setIsCalculating(false);
        }, 1500);
    };

    const restart = () => {
        setStep(0);
        setAnswers({ use: '', budget: '', priority: '' });
        setResults([]);
    };

    const goBack = () => {
        if (step > 1) setStep(step - 1);
        else setStep(0);
    };

    // Get current question
    const currentQuestion = questions[step - 1];

    return (
        <div className="finder-page">
            <SEO
                title="AI Laptop Finder"
                description="Find your perfect laptop in 3 simple questions. Our AI-powered quiz recommends the best laptop based on your needs, budget, and priorities."
                url="/laptop-finder"
                keywords="laptop finder, laptop quiz, best laptop for work, laptop recommendation, student laptop"
            />
            <div className="finder-container">
                {/* Welcome Screen */}
                {step === 0 && (
                    <div className="welcome-screen fade-in">
                        <div className="welcome-icon">
                            <Sparkles size={48} />
                        </div>
                        <h1 className="welcome-title">
                            {t('finder.title') || 'AI Laptop Finder'}
                        </h1>
                        <p className="welcome-subtitle">
                            {t('finder.subtitle') || 'Answer 3 quick questions and we\'ll find your perfect match'}
                        </p>
                        <div className="welcome-features">
                            <div className="feature">
                                <CheckCircle size={20} />
                                <span>{t('finder.feature1') || '3 Simple Questions'}</span>
                            </div>
                            <div className="feature">
                                <CheckCircle size={20} />
                                <span>{t('finder.feature2') || 'Personalized Results'}</span>
                            </div>
                            <div className="feature">
                                <CheckCircle size={20} />
                                <span>{t('finder.feature3') || 'Smart Recommendations'}</span>
                            </div>
                        </div>
                        <button
                            className="start-btn"
                            onClick={() => setStep(1)}
                            aria-label="Start laptop finder quiz"
                        >
                            <span>{t('finder.start') || "Let's Start"}</span>
                            <ArrowRight aria-hidden="true" size={20} />
                        </button>

                        <div className="ai-toggle-hint" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                                OR try our new experience:
                            </p>
                            <button
                                className="btn btn-outline"
                                onClick={() => setUseAI(true)}
                                style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
                            >
                                <Sparkles style={{ width: '18px', marginRight: '8px' }} />
                                Try AI Chat Concierge
                            </button>
                        </div>
                    </div>
                )}

                {/* AI Concierge View */}
                {useAI && (
                    <div className="ai-concierge-view fade-in">
                        <button className="back-btn" onClick={() => setUseAI(false)} style={{ marginBottom: '1rem' }}>
                            <ArrowLeft size={18} /> Back to Quiz
                        </button>
                        <AIConcierge />
                    </div>
                )}

                {/* Question Steps */}
                {!useAI && step >= 1 && step <= totalSteps && currentQuestion && (
                    <div className="question-screen fade-in">
                        {/* Progress Bar */}
                        <div className="progress-container" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={totalSteps} aria-label={`Step ${step} of ${totalSteps}`}>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${(step / totalSteps) * 100}%` }}
                                />
                            </div>
                            <div className="progress-steps">
                                {questions.map((q, idx) => (
                                    <div
                                        key={q.id}
                                        className={`progress-step ${idx + 1 <= step ? 'active' : ''} ${idx + 1 < step ? 'completed' : ''}`}
                                    >
                                        {idx + 1 < step ? <CheckCircle size={16} /> : <span>{idx + 1}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Question */}
                        <div className="question-header">
                            <h2 className="question-title">{currentQuestion.title}</h2>
                            <p className="question-subtitle">{currentQuestion.subtitle}</p>
                        </div>

                        {/* Options */}
                        <div className="options-grid">
                            {currentQuestion.options.map(option => (
                                <button
                                    key={option.value}
                                    className={`option-card option-${option.color}`}
                                    onClick={() => handleAnswer(currentQuestion.id, option.value)}
                                    aria-label={`${option.title}: ${option.desc}`}
                                >
                                    <span className="option-icon" aria-hidden="true">{option.icon}</span>
                                    <h3 className="option-title">{option.title}</h3>
                                    <p className="option-desc">{option.desc}</p>
                                    <div className="option-select" aria-hidden="true">
                                        <ArrowRight size={20} />
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Back Button */}
                        <button className="back-btn" onClick={goBack} aria-label="Go back to previous question">
                            <ArrowLeft aria-hidden="true" size={18} />
                            <span>{t('finder.back') || 'Go Back'}</span>
                        </button>
                    </div>
                )}

                {/* Calculating Animation */}
                {isCalculating && (
                    <div className="calculating-screen fade-in" role="alert" aria-live="polite">
                        <div className="calculating-spinner" aria-hidden="true">
                            <Sparkles className="spin" size={32} />
                        </div>
                        <h2>{t('finder.calculating') || 'Finding your perfect match...'}</h2>
                        <p>{t('finder.analyzing') || 'Analyzing your preferences'}</p>
                    </div>
                )}

                {/* Results */}
                {step === totalSteps + 1 && !isCalculating && (
                    <div className="results-screen fade-in">
                        <div className="results-header">
                            <div className="results-icon">
                                <Star size={32} className="text-yellow-400 fill-current" />
                            </div>
                            <h2 className="results-title">
                                {t('finder.resultsTitle') || 'Your Perfect Matches'}
                            </h2>
                            <p className="results-subtitle">
                                {t('finder.resultsSubtitle') || 'Based on your preferences, here are our top picks:'}
                            </p>
                        </div>

                        {/* Answer Summary */}
                        <div className="answer-summary">
                            <div className="summary-tag">
                                <span>🎯</span> {answers.use}
                            </div>
                            <div className="summary-tag">
                                <span>💰</span> {answers.budget}
                            </div>
                            <div className="summary-tag">
                                <span>⚡</span> {answers.priority}
                            </div>
                        </div>

                        {results.length > 0 ? (
                            <div className="results-grid">
                                {results.map((laptop, idx) => (
                                    <div key={laptop.id} className="result-card">
                                        {idx === 0 && (
                                            <div className="best-match-badge">
                                                👑 {t('finder.bestMatch') || 'Best Match'}
                                            </div>
                                        )}
                                        <ProductCard product={laptop} />
                                        {laptop.reasons && laptop.reasons.length > 0 && (
                                            <div className="why-recommend">
                                                <MatchVisualizer score={laptop.matchScore || 90} reasons={laptop.reasons || []} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-results">
                                <p>{t('finder.noResults') || 'No exact match found, but check our full collection!'}</p>
                                <Link to="/shop" className="btn btn-primary">
                                    {t('finder.browseAll') || 'Browse All Laptops'}
                                </Link>
                            </div>
                        )}

                        <div className="results-actions">
                            <button className="btn btn-outline" onClick={restart}>
                                {t('finder.restart') || 'Start Over'}
                            </button>
                            <Link to="/shop" className="btn btn-primary">
                                {t('finder.viewAll') || 'View All Laptops'}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LaptopFinder;
