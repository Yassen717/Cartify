import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../services/admin.service';
import './Dashboard.css';

type DashboardStats = {
  counts: { users: number; products: number; orders: number };
  revenue: number;
  recentOrders: any[];
  lowStockProducts: any[];
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getDashboardStats()
      .then((res) => {
        if (mounted) setStats(res.data as DashboardStats);
      })
      .catch((err: any) => {
        if (mounted) {
          const msg = err?.response?.data?.message || 'Failed to load dashboard stats';
          setError(msg);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="spinner"></div>
          <div className="loading-text">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-card">
          <div className="error-text">{error}</div>
          <button className="retry-btn" onClick={() => { setLoading(true); setError(null); }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard">
        <div className="empty-state">No dashboard data available</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="header">
        <h1>Dashboard Overview</h1>
      </div>

      <div className="dashboard-grid">
        <div className="card" aria-label="Total Revenue">
          <div className="card-content">
            <span className="card-title">Total Revenue</span>
            <span className="card-value">${stats.revenue?.toLocaleString?.() ?? '0'}</span>
          </div>
          <div className="card-icon">💰</div>
        </div>

        <div className="card" aria-label="Total Orders">
          <div className="card-content">
            <span className="card-title">Total Orders</span>
            <span className="card-value">{stats.counts.orders}</span>
          </div>
          <div className="card-icon">📦</div>
        </div>

        <div className="card" aria-label="Active Users">
          <div className="card-content">
            <span className="card-title">Active Users</span>
            <span className="card-value">{stats.counts.users}</span>
          </div>
          <div className="card-icon">👥</div>
        </div>

        <div className="card" aria-label="Products">
          <div className="card-content">
            <span className="card-title">Products</span>
            <span className="card-value">{stats.counts.products}</span>
          </div>
          <div className="card-icon">🗂️</div>
        </div>
      </div>

      <div className="dashboard-two-col">
        <div className="panel">
          <h2>📦 Recent Orders</h2>
          {stats.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="order-list">
              {stats.recentOrders.map((order: any) => (
                <div key={order.id} className="order">
                  <div>
                    <span className="user">{order.user?.firstName ?? ''} {order.user?.lastName ?? ''}</span>
                    <span className="order-number">{order.orderNumber}</span>
                  </div>
                  <span className="amount">${Number(order.total).toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No recent orders yet</div>
          )}
        </div>

        <div className="panel">
          <h2>⚠️ Low Stock Alerts</h2>
          {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
            <div className="order-list">
              {stats.lowStockProducts.map((p: any) => (
                <div key={p.id} className="lowstock">
                  <div>
                    <span className="product-name">{p.name}</span>
                    <span className="stock-info">Only {p.stockQty} left</span>
                  </div>
                  <button className="restock-btn">Restock</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">All products are well stocked ✅</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
