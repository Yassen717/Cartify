import { useEffect, useState } from 'react';
import { getDashboardStats, DashboardStats } from '../../services/admin.service';
import { FiDollarSign, FiShoppingBag, FiUsers, FiBox } from 'react-icons/fi';
import { getProductImage } from '../../utils/imageUtils';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
    </div>
);

const Dashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getDashboardStats();
                setStats(response.data);
            } catch (error) {
                toast.error('Failed to load dashboard stats');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) return <div className="p-8">Loading stats...</div>;
    if (!stats) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.revenue.toLocaleString()}`}
                    icon={FiDollarSign}
                    color="bg-green-500"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.counts.orders}
                    icon={FiShoppingBag}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Active Users"
                    value={stats.counts.users}
                    icon={FiUsers}
                    color="bg-purple-500"
                />
                <StatCard
                    title="Products"
                    value={stats.counts.products}
                    icon={FiBox}
                    color="bg-orange-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h2>
                    <div className="space-y-4">
                        {stats.recentOrders.map((order: any) => (
                            <div key={order.id} className="flex items-center justify-between py-3 border-b last:border-0">
                                <div>
                                    <p className="font-medium text-gray-900">{order.user.firstName} {order.user.lastName}</p>
                                    <p className="text-sm text-gray-500">{order.orderNumber}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900">${Number(order.total).toFixed(2)}</p>
                                    <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Low Stock Alerts</h2>
                    <div className="space-y-4">
                        {stats.lowStockProducts.map((product) => (
                            <div key={product.id} className="flex items-center space-x-4 py-3 border-b last:border-0">
                                <img
                                    src={getProductImage(product)}
                                    alt={product.name}
                                    className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                                    <p className="text-sm text-red-600 font-medium">
                                        Only {product.stockQty} left
                                    </p>
                                </div>
                                <button className="text-blue-600 text-sm font-medium hover:underline">
                                    Restock
                                </button>
                            </div>
                        ))}
                        {stats.lowStockProducts.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No low stock items</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
