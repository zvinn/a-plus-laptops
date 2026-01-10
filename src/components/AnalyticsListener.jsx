import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { setUserId } from '../utils/analytics';

const AnalyticsListener = () => {
    const { currentUser } = useAuth();

    useEffect(() => {
        if (currentUser) {
            setUserId(currentUser.uid);
        } else {
            setUserId(null);
        }
    }, [currentUser]);

    return null;
};

export default AnalyticsListener;
