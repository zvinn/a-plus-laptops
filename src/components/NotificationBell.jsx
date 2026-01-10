import { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../context/NotificationContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import './NotificationBell.css';

const NotificationBell = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleBellClick = () => {
        setIsOpen(!isOpen);
    };

    const handleMarkRead = (id, e) => {
        e.stopPropagation();
        markAsRead(id);
    };

    return (
        <div className="notification-bell-container" ref={dropdownRef}>
            <button
                className="nav-link notification-btn"
                onClick={handleBellClick}
                aria-label="Notifications"
            >
                <BellIcon className="icon-sm" />
                {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown animate-fade-in">
                    <div className="dropdown-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-btn" onClick={markAllAsRead}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {notifications.length === 0 ? (
                            <div className="empty-state">
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((note) => (
                                <div
                                    key={note.id}
                                    className={`notification-item ${!note.read ? 'unread' : ''}`}
                                    onClick={() => markAsRead(note.id)}
                                >
                                    <div className={`status-dot ${!note.read ? 'active' : ''}`}></div>
                                    <div className="notification-content">
                                        <h4>{note.title}</h4>
                                        <p>{note.message}</p>
                                        <span className="notification-time">
                                            {note.createdAt?.toDate ? format(note.createdAt.toDate(), 'MMM d, h:mm a') : 'Just now'}
                                        </span>
                                    </div>
                                    {!note.read && (
                                        <button
                                            className="mark-read-action"
                                            onClick={(e) => handleMarkRead(note.id, e)}
                                            title="Mark as read"
                                        >
                                            •
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="dropdown-footer">
                            {/* Placeholder for "View All" if we make a full page later */}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
