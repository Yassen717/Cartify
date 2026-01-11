import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllOrders } from '../../services/admin.service';
import type { AdminOrder } from '../../services/admin.service';
import { updateOrderStatus } from '../../services/order.service';
import type { Order } from '../../services/order.service';
import toast from 'react-hot-toast';
import { FiEye, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import './OrdersManagement.css';

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

    const getStatusClass = (status: string) => {
        const statusMap: any = {
            PENDING: 'pending',
            PROCESSING: 'processing',
            SHIPPED: 'shipped',
            DELIVERED: 'delivered',
            CANCELLED: 'cancelled',
        };
        return statusMap[status] || 'pending';
    };

    return (
        <div className="orders-management">
            <div className="orders-header">
                <h1>Orders</h1>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            <div className="table-container">
                <table className="orders-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="orders-loading">Loading...</td>
                            </tr>
                        ) : orders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="orders-empty">No orders found</td>
                            </tr>
                        ) : (
                            orders.map((order) => (
                                <tr key={order.id}>
                                    <td className="order-id">
                                        {order.orderNumber}
                                    </td>
                                    <td className="customer-name">
                                        {order.user.firstName} {order.user.lastName}
                                    </td>
                                    <td>
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="order-total">
                                        ${Number(order.total).toFixed(2)}
                                    </td>
                                    <td>
                                        {editingId === order.id ? (
                                            <div className="status-editor">
                                                <select
                                                    value={newStatus}
                                                    onChange={(e) => setNewStatus(e.target.value as any)}
                                                    className="status-editor-select"
                                                >
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="PROCESSING">PROCESSING</option>
                                                    <option value="SHIPPED">SHIPPED</option>
                                                    <option value="DELIVERED">DELIVERED</option>
                                                    <option value="CANCELLED">CANCELLED</option>
                                                </select>
                                                <button onClick={() => handleStatusUpdate(order.id)} className="status-editor-btn confirm">
                                                    <FiCheck />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="status-editor-btn cancel">
                                                    <FiX />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`status-badge ${getStatusClass(order.status)}`}>
                                                {order.status}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                onClick={() => {
                                                    setEditingId(order.id);
                                                    setNewStatus(order.status as any);
                                                }}
                                                className="action-btn edit"
                                                title="Update Status"
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <Link
                                                to={`/orders/${order.id}`}
                                                className="action-btn view"
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

            <div className="pagination">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="pagination-btn"
                >
                    Previous
                </button>
                <span className="pagination-info">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="pagination-btn"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default OrdersManagement;
