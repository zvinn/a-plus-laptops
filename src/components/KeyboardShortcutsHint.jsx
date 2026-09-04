import React from 'react';

const KeyboardShortcutsHint = ({ show = false }) => {
    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '80px',
            left: '20px',
            background: 'rgba(0, 0, 0, 0.85)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            fontSize: '0.8rem',
            zIndex: 9998,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '280px'
        }}>
            <div style={{ fontWeight: '600', marginBottom: '10px', color: '#60a5fa' }}>
                ⌨️ Keyboard Shortcuts
            </div>
            <div style={{ display: 'grid', gap: '6px' }}>
                <ShortcutRow keys="Alt + H" action="الرئيسية" />
                <ShortcutRow keys="Alt + S" action="المتجر" />
                <ShortcutRow keys="Alt + F" action="مساعد الذكاء" />
                <ShortcutRow keys="Alt + C" action="السلة" />
                <ShortcutRow keys="Alt + D" action="Dark/Light Mode" />
                <ShortcutRow keys="/" action="البحث" />
                <ShortcutRow keys="Esc" action="إغلاق" />
            </div>
        </div>
    );
};

const ShortcutRow = ({ keys, action }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
        <span style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '2px 8px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.75rem'
        }}>
            {keys}
        </span>
        <span style={{ color: '#94a3b8' }}>{action}</span>
    </div>
);

export default KeyboardShortcutsHint;
