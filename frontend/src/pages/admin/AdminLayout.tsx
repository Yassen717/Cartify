import { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
    FiGrid,
    FiBox,
    FiShoppingBag,
    FiUsers,
    FiSettings,
    FiLogOut
} from 'react-icons/fi';

const AdminLayout = () => {
    const { user, logout, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    const navItems = [
        { path: '/admin', icon: FiGrid, label: 'Dashboard' },
        { path: '/admin/products', icon: FiBox, label: 'Products' },
        { path: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
        { path: '/admin/users', icon: FiUsers, label: 'Users' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-lg flex flex-col">
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-gray-800">Cartify Admin</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={logout}
                        className="flex items-center space-x-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <FiLogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                    <div className="mt-4 px-4 text-sm text-gray-400">
                        <p>Logged in as</p>
                        <p className="font-medium text-gray-600">{user.email}</p>
                    </div>
                </div>
            </div>

            {/* Main Content with Safe Fallback to avoid white screen while dashboard loads */}
            <div className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                    {/* Fallback dashboard UI if Dashboard.tsx fails to render */}
                    {/* Remove this block to enable real dashboard once fixed */}
                    {/* <div className="fallback-dashboard" /> */}
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
