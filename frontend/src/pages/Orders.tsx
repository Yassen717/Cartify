import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Button } from '../components/ui';
import * as orderService from '../services/order.service';
import type { Order } from '../services/order.service';
import toast from 'react-hot-toast';
import './Orders.css';

export const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getOrders();
            setOrders(data.orders);
        } catch (error: any) {
            toast.error('Failed to fetch orders');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: Order['status']) => {
        const colors = {
            PENDING: 'orange',
            CONFIRMED: 'blue',
            PROCESSING: 'purple',
            SHIPPED: 'cyan',
            DELIVERED: 'green',
            CANCELLED: 'red',
        };
        return colors[status] || 'gray';
    };

    if (isLoading) {
        return <div className="container"><p>Loading orders...</p></div>;
    }

    return (
        <div className="orders-page">
            <div className="container">
                <h1>My Orders</h1>

                {orders.length === 0 ? (
                    <Card>
                        <div className="empty-state">
                            <h3>No orders yet</h3>
                            <p>Start shopping to create your first order!</p>
                            <Button as={Link} to="/products">
                                Browse Products
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="order-card">
                                    <div className="order-header">
                                        <div>
                                            <h3>{order.orderNumber}</h3>
                                            <p className="order-date">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span
                                            className="status-badge"
                                            style={{ '--status-color': `var(--${getStatusColor(order.status)})` } as any}
                                        >
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="order-items">
                                        {order.items.slice(0, 3).map((item) => (
                                            <div key={item.id} className="order-item">
                                                <span>{item.product.name} × {item.quantity}</span>
                                            </div>
                                        ))}
                                        {order.items.length > 3 && (
                                            <p className="more-items">
                                                +{order.items.length - 3} more items
                                            </p>
                                        )}
                                    </div>

                                    <div className="order-footer">
                                        <div className="order-total">
                                            <span>Total:</span>
                                            <strong>${Number(order.total).toFixed(2)}</strong>
                                        </div>
                                        <Button
                                            as={Link}
                                            to={`/orders/${order.id}`}
                                            variant="outline"
                                            size="sm"
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
