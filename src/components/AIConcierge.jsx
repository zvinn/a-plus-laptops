import { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore/lite';
import { db } from '../firebase';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from './ProductCard';
import MatchVisualizer from './MatchVisualizer';
import { searchLaptops } from '../utils/semanticSearch';
import './AIConcierge.css';

const AIConcierge = () => {
    const { t, language } = useLanguage();
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            text: language === 'ar'
                ? 'أهلاً بك! أنا مساعدك الذكي من A Plus+. إيه نوع اللابتوب اللي بتدور عليه؟ (مثلاً: جيمنج تحت ٤٠ الف، أو لابتوب للدراسة)'
                : 'Welcome! I am your A Plus+ smart assistant. What kind of laptop are you looking for? (e.g., Gaming under 40k, or a student laptop)'
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [laptops, setLaptops] = useState([]);
    const messagesEndRef = useRef(null);

    // Fetch all laptops for local filtering/parsing
    useEffect(() => {
        const fetchLaptops = async () => {
            const querySnapshot = await getDocs(collection(db, "laptops"));
            setLaptops(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchLaptops();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages, isTyping]);

    const handleSend = async (text = inputValue) => {
        if (!text.trim()) return;

        const userMsg = { id: Date.now(), type: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI Thinking
        setTimeout(() => {
            processRequest(text.toLowerCase());
        }, 1200);
    };

    const processRequest = (query) => {
        setIsTyping(false);
        // Use new semantic search utility
        const results = searchLaptops(query, laptops).slice(0, 3);

        let responseText = '';
        if (results.length > 0) {
            const topMatch = results[0];
            const score = topMatch.matchScore;

            if (score > 85) {
                responseText = language === 'ar'
                    ? `لقيت لك لابتوب مثالي! ${topMatch.name} مناسب جداً لطلبك بنسبة ${score}%.`
                    : `I found a perfect match! The ${topMatch.name} fits your needs with a ${score}% match score.`;
            } else {
                responseText = language === 'ar'
                    ? `لقيت لك ${results.length} خيارات كويسة. شوف دول:`
                    : `I found ${results.length} good options. Check these out:`;
            }
        } else {
            responseText = language === 'ar'
                ? 'للأسف ملقيتش حاجة مطابقة بالظبط، بس دول لابتوبات ممتازة ممكن تعجبك:'
                : 'I couldn\'t find an exact match, but here are some excellent laptops you might like:';
        }

        const botMsg = {
            id: Date.now() + 1,
            type: 'bot',
            text: responseText,
            recommendations: results.length > 0 ? results : laptops.slice(0, 2)
        };

        setMessages(prev => [...prev, botMsg]);
    };

    const suggestions = language === 'ar'
        ? ['جيمنج تحت ٤٠ الف', 'لابتوب للدراسة', 'لابتوبات آبل', 'أقوى أداء']
        : ['Gaming under 40k', 'Study laptop', 'Apple MacBooks', 'High Performance'];

    return (
        <div className="ai-concierge-container">
            <div className="concierge-header">
                <div className="bot-avatar">🤖</div>
                <div>
                    <h3 style={{ margin: 0 }}>{language === 'ar' ? 'المساعد الذكي' : 'A+ Smart Concierge'}</h3>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Online | AI Powered</span>
                </div>
            </div>

            <div className="messages-list">
                {messages.map(msg => (
                    <div key={msg.id} className="message-wrapper">
                        <div className={`message message-${msg.type}`}>
                            {msg.text}
                        </div>
                        {msg.recommendations && (
                            <div className="chat-recommendations">
                                {msg.recommendations.map(laptop => (
                                    <div key={laptop.id}>
                                        <ProductCard product={laptop} />
                                        {laptop.matchScore && (
                                            <MatchVisualizer score={laptop.matchScore} reasons={laptop.matchReasons || []} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {isTyping && (
                    <div className="typing-indicator">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="concierge-input-area">
                <div className="suggestion-chips">
                    {suggestions.map(s => (
                        <button key={s} className="chip" onClick={() => handleSend(s)}>
                            {s}
                        </button>
                    ))}
                </div>
                <div className="input-wrapper">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder={language === 'ar' ? 'اكتب طلبك هنا...' : 'Type your request...'}
                    />
                    <button className="send-btn" onClick={() => handleSend()} disabled={!inputValue.trim()}>
                        {language === 'ar' ? 'إرسال' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIConcierge;
