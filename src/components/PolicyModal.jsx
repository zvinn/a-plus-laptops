
import { X } from 'lucide-react';
import './PolicyModal.css';

const PolicyModal = ({ title, content, onClose }) => {
    return (
        <div className="policy-modal-overlay" onClick={onClose}>
            <div className="policy-modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <X size={24} />
                </button>
                <h2>{title}</h2>
                <div className="policy-text">
                    {content}
                </div>
            </div>
        </div>
    );
};

export default PolicyModal;
