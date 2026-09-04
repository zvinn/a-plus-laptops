/* eslint-disable react/prop-types */
import { useState } from 'react';
import { User, Trash2, Shield, UserPlus } from 'lucide-react';
import { adminService } from '../../api/adminService';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import { useAuth } from '../../context/AuthContext';

const AdminUserManagement = ({ admins, refreshAdmins }) => {
    const { currentUser } = useAuth();
    const { success, error } = useToast();
    const { confirm } = useConfirm();
    const [newAdminEmail, setNewAdminEmail] = useState('');

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            await adminService.addAdmin(newAdminEmail, currentUser.email);
            setNewAdminEmail('');
            success(`Admin access granted to ${newAdminEmail}`);
            refreshAdmins();
        } catch (err) {
            console.error(err);
            error("Failed to add admin");
        }
    };

    const handleRemoveAdmin = async (email) => {
        if (!await confirm({
            title: 'Remove Admin',
            message: `Are you sure you want to remove admin access for ${email}?`,
            confirmText: 'Remove',
            variant: 'danger'
        })) return;

        try {
            await adminService.removeAdmin(email);
            success(`Admin access removed for ${email}`);
            refreshAdmins();
        } catch (err) {
            console.error(err);
            error("Failed to remove admin (Cannot remove Super Admin)");
        }
    };

    return (
        <div className="admins-manager animate-fade-in">
            <div className="add-admin-card">
                <h3><UserPlus size={20} /> Grant Admin Access</h3>
                <form onSubmit={handleAddAdmin} className="add-admin-form">
                    <input
                        type="email"
                        placeholder="Enter email address..."
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn btn-primary">Add Admin</button>
                </form>
            </div>

            <div className="admins-list">
                <h3>Current Admins ({admins.length})</h3>
                <div className="admin-grid">
                    {admins.map(admin => (
                        <div key={admin.email} className="admin-card">
                            <div className="admin-icon"><Shield size={24} /></div>
                            <div className="admin-info">
                                <span className="admin-email">{admin.email}</span>
                                <span className="admin-meta">
                                    Added by: {admin.addedBy || 'System'}
                                </span>
                            </div>
                            <button
                                className="remove-btn"
                                onClick={() => handleRemoveAdmin(admin.email)}
                                title="Remove Access"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminUserManagement;
