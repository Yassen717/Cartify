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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <div className="loading-text">Loading your dashboard...</div>
          <div className="loading-subtext">Fetching latest statistics</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <div className="error-title">Something went wrong</div>
          <div className="error-text">{error}</div>
          <button className="retry-btn" onClick={() => { setLoading(true); setError(null); }}>
            <span className="retry-icon">↻</span>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard">
        <div className="empty-state-card">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No Data Available</div>
          <div className="empty-text">Dashboard data is currently unavailable</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-greeting">
            <span className="greeting-wave">👋</span>
            <h1>{getGreeting()}, Admin</h1>
          </div>
          <p className="header-subtitle">Here's what's happening with your store today</p>
        </div>
        <div className="header-meta">
          <div className="header-date">
            <span className="date-icon">📅</span>
            <span>{formatDate()}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-section">
        <div className="section-header">
          <h2>Overview</h2>
          <span className="section-badge">Live</span>
        </div>
        <div className="dashboard-grid">
          <div className="stat-card stat-revenue" aria-label="Total Revenue">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper revenue-icon">
                <span>💰</span>
              </div>
              <div className="stat-trend positive">
                <span className="trend-icon">↑</span>
                <span>12.5%</span>
              </div>
            </div>
            <div className="stat-card-body">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">${stats.revenue?.toLocaleString?.() ?? '0'}</span>
            </div>
            <div className="stat-card-footer">
              <span className="stat-comparison">vs last month</span>
            </div>
            <div className="stat-decoration"></div>
          </div>

          <div className="stat-card stat-orders" aria-label="Total Orders">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper orders-icon">
                <span>📦</span>
              </div>
              <div className="stat-trend positive">
                <span className="trend-icon">↑</span>
                <span>8.2%</span>
              </div>
            </div>
            <div className="stat-card-body">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{stats.counts.orders.toLocaleString()}</span>
            </div>
            <div className="stat-card-footer">
              <span className="stat-comparison">vs last month</span>
            </div>
            <div className="stat-decoration"></div>
          </div>

          <div className="stat-card stat-users" aria-label="Active Users">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper users-icon">
                <span>👥</span>
              </div>
              <div className="stat-trend positive">
                <span className="trend-icon">↑</span>
                <span>5.1%</span>
              </div>
            </div>
            <div className="stat-card-body">
              <span className="stat-label">Active Users</span>
              <span className="stat-value">{stats.counts.users.toLocaleString()}</span>
            </div>
            <div className="stat-card-footer">
              <span className="stat-comparison">vs last month</span>
            </div>
            <div className="stat-decoration"></div>
          </div>

          <div className="stat-card stat-products" aria-label="Products">
            <div className="stat-card-header">
              <div className="stat-icon-wrapper products-icon">
                <span>🗂️</span>
              </div>
              <div className="stat-trend neutral">
                <span className="trend-icon">→</span>
                <span>0%</span>
              </div>
            </div>
            <div className="stat-card-body">
              <span className="stat-label">Products</span>
              <span className="stat-value">{stats.counts.products.toLocaleString()}</span>
            </div>
            <div className="stat-card-footer">
              <span className="stat-comparison">in catalog</span>
            </div>
            <div className="stat-decoration"></div>
          </div>
        </div>
      </div>

      {/* Activity Panels */}
      <div className="activity-section">
        <div className="dashboard-two-col">
          {/* Recent Orders Panel */}
          <div className="activity-panel orders-panel">
            <div className="panel-header">
              <div className="panel-title">
                <span className="panel-icon">📦</span>
                <h2>Recent Orders</h2>
              </div>
              <button className="panel-action">View All →</button>
            </div>
            <div className="panel-content">
              {stats.recentOrders && stats.recentOrders.length > 0 ? (
                <div className="orders-list">
                  {stats.recentOrders.map((order: any, index: number) => (
                    <div 
                      key={order.id} 
                      className="order-item"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="order-avatar">
                        {(order.user?.firstName?.[0] ?? 'U').toUpperCase()}
                      </div>
                      <div className="order-details">
                        <span className="order-customer">
                          {order.user?.firstName ?? ''} {order.user?.lastName ?? ''}
                        </span>
                        <span className="order-id">{order.orderNumber}</span>
                      </div>
                      <div className="order-meta">
                        <span className="order-amount">${Number(order.total).toFixed(2)}</span>
                        <span className="order-status completed">Completed</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-panel-state">
                  <span className="empty-panel-icon">📭</span>
                  <span className="empty-panel-text">No recent orders yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Panel */}
          <div className="activity-panel alerts-panel">
            <div className="panel-header">
              <div className="panel-title">
                <span className="panel-icon warning">⚠️</span>
                <h2>Low Stock Alerts</h2>
              </div>
              <span className="alert-count">
                {stats.lowStockProducts?.length || 0} items
              </span>
            </div>
            <div className="panel-content">
              {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                <div className="alerts-list">
                  {stats.lowStockProducts.map((p: any, index: number) => (
                    <div 
                      key={p.id} 
                      className="alert-item"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="alert-indicator">
                        <span className="pulse-dot"></span>
                      </div>
                      <div className="alert-details">
                        <span className="alert-product">{p.name}</span>
                        <div className="stock-bar">
                          <div 
                            className="stock-fill" 
                            style={{ width: `${Math.min((p.stockQty / 20) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <span className="alert-stock">
                          <span className="stock-count">{p.stockQty}</span> units remaining
                        </span>
                      </div>
                      <button className="restock-btn">
                        <span>Restock</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-panel-state success">
                  <span className="empty-panel-icon">✅</span>
                  <span className="empty-panel-text">All products are well stocked</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
