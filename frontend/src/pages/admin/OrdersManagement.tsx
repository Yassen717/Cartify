import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders, AdminOrder } from '../../services/admin.service';
import { updateOrderStatus, Order } from '../../services/order.service';
import toast from 'react-hot-toast';
import { FiEye, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

const OrdersManagement = () => {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newStatus, setNewStatus] = useState<Order['status'] | ''>('');

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const response = await getAllOrders(page, 10, statusFilter || undefined);
            setOrders(response.data.orders);
            setTotalPages(response.data.pagination.totalPages);
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const handleStatusUpdate = async (id: string) => {
        if (!newStatus) return;

        try {
            await updateOrderStatus(id, newStatus);
            toast.success('Order status updated');
            setEditingId(null);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        const colors: any = {
            PENDING: 'bg-yellow-100 text-yellow-700',
            PROCESSING: 'bg-blue-100 text-blue-700',
            SHIPPED: 'bg-purple-100 text-purple-700',
            DELIVERED: 'bg-green-100 text-green-700',
            CANCELLED: 'bg-red-100 text-red-700',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading...</td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders found</td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-gray-900 font-medium">
                                        {order.orderNumber}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {order.user.firstName} {order.user.lastName}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-gray-900 font-medium">
                                        ${Number(order.total).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {editingId === order.id ? (
                                            <div className="flex items-center space-x-2">
                                                <select
                                                    value={newStatus}
                                                    onChange={(e) => setNewStatus(e.target.value as any)}
                                                    className="text-xs border rounded p-1"
                                                >
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="PROCESSING">PROCESSING</option>
                                                    <option value="SHIPPED">SHIPPED</option>
                                                    <option value="DELIVERED">DELIVERED</option>
                                                    <option value="CANCELLED">CANCELLED</option>
                                                </select>
                                                <button onClick={() => handleStatusUpdate(order.id)} className="text-green-600 hover:text-green-700">
                                                    <FiCheck />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-600">
                                                    <FiX />
                                                </button>
                                            </div>
                                        ) : (
                                            <StatusBadge status={order.status} />
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => {
                                                    setEditingId(order.id);
                                                    setNewStatus(order.status as any);
                                                }}
                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                                title="Update Status"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <Link
                                                to={`/orders/${order.id}`} // Users view, but admins can access too
                                                className="text-gray-400 hover:text-blue-600 transition-colors"
                                                title="View Details"
                                            >
                                                <FiEye />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center space-x-2">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                    Previous
                </button>
                <div className="flex items-center text-gray-600">
                    Page {page} of {totalPages}
                </div>
                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default OrdersManagement;
