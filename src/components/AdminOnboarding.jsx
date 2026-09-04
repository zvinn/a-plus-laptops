import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle, DollarSign, Package, Users, FileText, Ticket, LayoutDashboard } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const TOUR_STEPS = [
    {
        id: 'welcome',
        title: 'مرحباً بك في لوحة التحكم! 👋',
        description: 'هذه الجولة السريعة ستساعدك على التعرف على أهم الميزات. يمكنك تخطيها في أي وقت.',
        icon: LayoutDashboard,
        color: '#3b82f6'
    },
    {
        id: 'accounting',
        title: 'نظام المحاسبة 💰',
        description: 'تتبع الإيرادات والمصروفات، راجع الأرباح والخسائر، وصدّر التقارير المالية.',
        icon: DollarSign,
        color: '#22c55e'
    },
    {
        id: 'inventory',
        title: 'إدارة المخزون 📦',
        description: 'راقب حركة المخزون، تنبيهات النقص، وإدارة الموردين.',
        icon: Package,
        color: '#3b82f6'
    },
    {
        id: 'crm',
        title: 'إدارة العملاء 👥',
        description: 'قاعدة بيانات العملاء، تصنيفهم (VIP, عادي, جديد)، ومتابعة التفاعلات.',
        icon: Users,
        color: '#8b5cf6'
    },
    {
        id: 'invoices',
        title: 'نظام الفواتير 🧾',
        description: 'إنشاء وتتبع الفواتير، تصديرها كـ PDF، ومراقبة حالة الدفع.',
        icon: FileText,
        color: '#f59e0b'
    },
    {
        id: 'coupons',
        title: 'إدارة الكوبونات 🎫',
        description: 'إنشاء أكواد خصم، تحديد نسبة الخصم، وتاريخ الانتهاء.',
        icon: Ticket,
        color: '#ec4899'
    }
];

const STORAGE_KEY = 'admin_onboarding_completed';

const AdminOnboarding = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Check if tour was already completed
        const completed = localStorage.getItem(STORAGE_KEY);
        if (!completed) {
            // Show tour after short delay
            const timer = setTimeout(() => setIsOpen(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleNext = () => {
        if (currentStep < TOUR_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsOpen(false);
    };

    const handleSkip = () => {
        localStorage.setItem(STORAGE_KEY, 'true');
        setIsOpen(false);
    };

    const step = TOUR_STEPS[currentStep];
    const Icon = step.icon;
    const progress = ((currentStep + 1) / TOUR_STEPS.length) * 100;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    style={{
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                        borderRadius: '20px',
                        padding: '32px',
                        maxWidth: '500px',
                        width: '100%',
                        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        position: 'relative'
                    }}
                >
                    {/* Close button */}
                    <button
                        onClick={handleSkip}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px',
                            cursor: 'pointer',
                            color: '#94a3b8'
                        }}
                    >
                        <X size={20} />
                    </button>

                    {/* Progress bar */}
                    <div style={{
                        height: '4px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '2px',
                        marginBottom: '24px',
                        overflow: 'hidden'
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            style={{
                                height: '100%',
                                background: step.color,
                                borderRadius: '2px'
                            }}
                        />
                    </div>

                    {/* Step counter */}
                    <div style={{
                        color: '#64748b',
                        fontSize: '0.85rem',
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        {currentStep + 1} / {TOUR_STEPS.length}
                    </div>

                    {/* Icon */}
                    <motion.div
                        key={step.id}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '20px',
                            background: `linear-gradient(135deg, ${step.color}20, ${step.color}40)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            border: `2px solid ${step.color}50`
                        }}
                    >
                        <Icon size={36} color={step.color} />
                    </motion.div>

                    {/* Content */}
                    <motion.div
                        key={`content-${step.id}`}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        style={{ textAlign: 'center' }}
                    >
                        <h2 style={{
                            color: '#f8fafc',
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            marginBottom: '12px'
                        }}>
                            {step.title}
                        </h2>
                        <p style={{
                            color: '#94a3b8',
                            fontSize: '1rem',
                            lineHeight: '1.6'
                        }}>
                            {step.description}
                        </p>
                    </motion.div>

                    {/* Navigation */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '32px',
                        gap: '12px'
                    }}>
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            style={{
                                padding: '12px 24px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                borderRadius: '10px',
                                color: currentStep === 0 ? '#475569' : '#f8fafc',
                                cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: '500'
                            }}
                        >
                            <ChevronLeft size={18} /> السابق
                        </button>

                        <button
                            onClick={handleNext}
                            style={{
                                padding: '12px 32px',
                                background: step.color,
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: '600',
                                boxShadow: `0 4px 15px ${step.color}40`
                            }}
                        >
                            {currentStep === TOUR_STEPS.length - 1 ? (
                                <>
                                    <CheckCircle size={18} /> ابدأ الآن
                                </>
                            ) : (
                                <>
                                    التالي <ChevronRight size={18} />
                                </>
                            )}
                        </button>
                    </div>

                    {/* Skip link */}
                    <button
                        onClick={handleSkip}
                        style={{
                            display: 'block',
                            margin: '16px auto 0',
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                        }}
                    >
                        تخطي الجولة
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// Helper to reset tour for testing
export const resetOnboardingTour = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export default AdminOnboarding;
