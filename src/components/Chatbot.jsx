
import { useState, useEffect, useRef, useCallback } from 'react';
import { MessageCircle, X, Send, RotateCcw, ChevronRight } from 'lucide-react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { laptops } from '../data/laptops';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from './OptimizedImage';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: 'Hi! 👋 I\'m your A Plus Assistant. I can help you find the perfect laptop. Want to start?' },
    ]);
    const [step, setStep] = useState(0); // 0: Start, 1: Usage, 2: Budget, 3: Brand, 4: Result
    const [answers, setAnswers] = useState({});
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen, scrollToBottom]);

    const addMessage = useCallback((text, type = 'bot') => {
        setMessages(prev => [...prev, { type, text }]);
    }, []);

    const simulateTyping = (callback) => {
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            callback();
        }, 1000); // 1s delay for realism
    };

    const handleStart = () => {
        addMessage('Yes, please!', 'user');
        setStep(1);
        simulateTyping(() => {
            addMessage('Great! First, what will you primarily use this laptop for?');
        });
    };

    const handleAnswer = (key, value, label) => {
        // User reply
        addMessage(label, 'user');
        const newAnswers = { ...answers, [key]: value };
        setAnswers(newAnswers);

        // Logic flow
        if (key === 'usage') {
            setStep(2);
            simulateTyping(() => addMessage('Got it. And what is your budget range?'));
        } else if (key === 'budget') {
            setStep(3);
            simulateTyping(() => addMessage('Almost done! do you have a preferred brand?'));
        } else if (key === 'brand') {
            setStep(4); // Finished
            findRecommendation(newAnswers);
        }
    };

    const findRecommendation = (finalAnswers) => {
        setIsTyping(true);

        // --- FILTERING LOGIC ---
        // 1. Filter by Usage (Suitability)
        let filtered = laptops.filter(l =>
            l.suitability && l.suitability.some(s => s.toLowerCase().includes(finalAnswers.usage.toLowerCase()))
        );
        // Fallback if strict filter yields nothing
        if (filtered.length === 0) filtered = laptops;

        // 2. Filter by Price
        // ranges: low (<20k), mid (20-50k), high (>50k)
        if (finalAnswers.budget === 'low') {
            filtered = filtered.filter(l => l.price < 25000);
        } else if (finalAnswers.budget === 'mid') {
            filtered = filtered.filter(l => l.price >= 25000 && l.price <= 60000);
        } else if (finalAnswers.budget === 'high') {
            filtered = filtered.filter(l => l.price > 60000);
        }

        // 3. Filter by Brand
        if (finalAnswers.brand !== 'all') {
            const BrandFiltered = filtered.filter(l => l.brand.toLowerCase() === finalAnswers.brand.toLowerCase());
            if (BrandFiltered.length > 0) filtered = BrandFiltered;
        }

        setTimeout(() => {
            setIsTyping(false);
            if (filtered.length > 0) {
                const topPick = filtered[0]; // Best match (assuming sorted or first is good)
                addMessage(`I found ${filtered.length} match(es)! The best one for you is:`);
                // Add a special "Product Card" message
                setMessages(prev => [...prev, { type: 'product', data: topPick }]);
            } else {
                addMessage("Hmm, I couldn't find an exact match for that specific combo, but you can browse our full collection here:");
                setMessages(prev => [...prev, { type: 'link', text: 'View All Laptops', path: '/shop' }]);
            }
        }, 1500);
    };

    const handleReset = () => {
        setMessages([{ type: 'bot', text: 'Hi! 👋 I\'m your A Plus Assistant. I can help you find the perfect laptop. Want to start?' }]);
        setStep(0);
        setAnswers({});
    };

    return (
        <>
            {/* Toggle Button */}
            <button
                className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close chat assistant' : 'Open chat assistant'}
                aria-expanded={isOpen}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
            </button>

            {/* Chat Window */}
            <div
                className={`chatbot-window ${isOpen ? 'open' : ''}`}
                role="dialog"
                aria-label="A Plus Chat Assistant"
                aria-modal="true"
            >
                <div className="chat-header">
                    <div className="chat-avatar" aria-hidden="true"><SparklesIcon /></div>
                    <div>
                        <h3 id="chat-title">A Plus Assistant</h3>
                        <span className="status-dot" aria-label="Online status">Online</span>
                    </div>
                    <button className="reset-btn" onClick={handleReset} title="Restart" aria-label="Restart conversation"><RotateCcw size={16} /></button>
                </div>

                <div className="chat-body" role="log" aria-live="polite" aria-label="Chat messages">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`message ${msg.type} animate-pop-in`}>
                            {msg.type === 'product' ? (
                                <div className="chat-product-card" onClick={() => {
                                    setIsOpen(false);
                                    navigate(`/${msg.data.id}`); // Assuming route is /:id or /product/:id check routes later
                                }}>
                                    <OptimizedImage
                                        src={msg.data.image}
                                        alt={msg.data.name}
                                        skeletonHeight="60px"
                                    />
                                    <div className="chat-product-info">
                                        <h4>{msg.data.name}</h4>
                                        <p>{msg.data.price.toLocaleString()} EGP</p>
                                        <button className="btn-xs">View Details <ChevronRight size={14} /></button>
                                    </div>
                                </div>
                            ) : msg.type === 'link' ? (
                                <button className="chat-link-btn" onClick={() => {
                                    setIsOpen(false);
                                    navigate(msg.path);
                                }}>{msg.text}</button>
                            ) : (
                                msg.text
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="message bot typing">
                            <span>●</span><span>●</span><span>●</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-footer">
                    {/* Dynamic Options based on Step */}
                    {step === 0 && (
                        <button className="option-btn primary" onClick={handleStart}>Let's Find a Laptop! 🚀</button>
                    )}

                    {step === 1 && (
                        <div className="options-grid">
                            <button className="option-btn" onClick={() => handleAnswer('usage', 'gaming', 'Gaming & Performance 🎮')}>Gaming 🎮</button>
                            <button className="option-btn" onClick={() => handleAnswer('usage', 'work', 'Work & Business 💼')}>Work 💼</button>
                            <button className="option-btn" onClick={() => handleAnswer('usage', 'student', 'School & Study 🎓')}>Student 🎓</button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="options-grid">
                            <button className="option-btn" onClick={() => handleAnswer('budget', 'low', 'Under 25k EGP')}>&lt; 25k</button>
                            <button className="option-btn" onClick={() => handleAnswer('budget', 'mid', '25k - 60k EGP')}>25k - 60k</button>
                            <button className="option-btn" onClick={() => handleAnswer('budget', 'high', '60k+ EGP')}>60k+</button>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="options-grid">
                            <button className="option-btn" onClick={() => handleAnswer('brand', 'all', 'No Preference')}>Any Brand</button>
                            <button className="option-btn" onClick={() => handleAnswer('brand', 'lenovo', 'Lenovo')}>Lenovo</button>
                            <button className="option-btn" onClick={() => handleAnswer('brand', 'asus', 'Asus')}>Asus</button>
                            <button className="option-btn" onClick={() => handleAnswer('brand', 'apple', 'Apple (Mac)')}>Apple</button>
                        </div>
                    )}

                    {step === 4 && (
                        <p className="chat-hint">Click the product above to view details, or restart to search again.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Chatbot;
