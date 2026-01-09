import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../services/admin.service';

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
        if (mounted) {
          setStats(res.data as DashboardStats);
        }
      })
      .catch((err: any) => {
        if (mounted) {
          const msg = err?.response?.data?.message || 'Failed to load dashboard stats';
          setError(msg);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  const containerStyle: React.CSSProperties = {
    background: '#f8fafc',
    minHeight: '100vh',
    padding: '32px',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '32px',
  };

  const headingStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  };

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  };

  const cardHoverStyle: React.CSSProperties = {
    transform: 'translateY(-4px)',
    boxShadow: '0 4px 6px 0 rgba(0, 0, 0, 0.15)',
  };

  const cardHeaderStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '8px',
  };

  const iconStyle: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const valueStyle: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 700,
    color: '#111827',
  };

  const twoColStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  };

  const panelStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
  };

  const panelTitleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 600,
    color: '#111827',
    marginBottom: '16px',
  };

  const listStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  const listItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  };

  const listItemHoverStyle: React.CSSProperties = {
    background: '#f9fafb',
  };

  const primaryTextStyle: React.CSSProperties = {
    fontWeight: 600,
    color: '#111827',
  };

  const secondaryTextStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#6b7280',
  };

  const emptyStateStyle: React.CSSProperties = {
    padding: '48px',
    textAlign: 'center',
    color: '#6b7280',
  };

  const errorCardStyle: React.CSSProperties = {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
  };

  const errorTextStyle: React.CSSProperties = {
    color: '#b91c1c',
    marginBottom: '16px',
    fontSize: '16px',
  };

  const retryButtonStyle: React.CSSProperties = {
    background: '#b91c1c',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const retryButtonHoverStyle: React.CSSProperties = {
    background: '#c2410c',
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
          <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTop: '4px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div style={errorCardStyle}>
          <div style={errorTextStyle}>{error}</div>
          <button 
            style={retryButtonStyle}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = '#c2410c';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.background = '#b91c1c';
            }}
            onClick={() => { setLoading(true); setError(null); }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={containerStyle}>
        <div style={emptyStateStyle}>No dashboard data available</div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={headingStyle}>Dashboard Overview</h1>
      </div>

      <div style={gridStyle}>
        <div style={cardStyle} onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, {})}>
          <div style={cardHeaderStyle}>
            <div style={{ ...iconStyle, background: '#dbeafe' }}>💰</div>
            <span style={labelStyle}>Total Revenue</span>
          </div>
          <div style={valueStyle}>${stats.revenue?.toLocaleString?.() ?? '0'}</div>
        </div>

        <div style={cardStyle} onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, {})}>
          <div style={cardHeaderStyle}>
            <div style={{ ...iconStyle, background: '#93c5fd' }}>📦</div>
            <span style={labelStyle}>Total Orders</span>
          </div>
          <div style={valueStyle}>{stats.counts.orders}</div>
        </div>

        <div style={cardStyle} onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, {})}>
          <div style={cardHeaderStyle}>
            <div style={{ ...iconStyle, background: '#a78bfa' }}>👥</div>
            <span style={labelStyle}>Active Users</span>
          </div>
          <div style={valueStyle}>{stats.counts.users}</div>
        </div>

        <div style={cardStyle} onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)} onMouseLeave={(e) => Object.assign(e.currentTarget.style, {})}>
          <div style={cardHeaderStyle}>
            <div style={{ ...iconStyle, background: '#10b981' }}>📦</div>
            <span style={labelStyle}>Products</span>
          </div>
          <div style={valueStyle}>{stats.counts.products}</div>
        </div>
      </div>

      <div style={twoColStyle}>
        <div style={panelStyle}>
          <h2 style={panelTitleStyle}>📦 Recent Orders</h2>
          <div style={listStyle}>
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order: any) => (
                <div 
                  key={order.id} 
                  style={listItemStyle}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, listItemHoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, {})}
                >
                  <div>
                    <span style={primaryTextStyle}>
                      {order.user?.firstName ?? ''} {order.user?.lastName ?? ''}
                    </span>
                    <span style={secondaryTextStyle}>{order.orderNumber}</span>
                  </div>
                  <span style={{ ...valueStyle, fontSize: '18px' }}>${Number(order.total).toFixed(2)}</span>
                </div>
              ))
            ) : (
              <div style={emptyStateStyle}>No recent orders yet</div>
            )}
          </div>
        </div>

        <div style={panelStyle}>
          <h2 style={panelTitleStyle}>⚠️ Low Stock Alerts</h2>
          <div style={listStyle}>
            {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
              stats.lowStockProducts.map((p: any) => (
                <div 
                  key={p.id} 
                  style={listItemStyle}
                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, listItemHoverStyle)}
                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, {})}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ ...valueStyle, fontSize: '16px' }}>{p.name}</span>
                    <span style={{ ...secondaryTextStyle, color: '#dc2626', fontWeight: 500 }}>
                      Only {p.stockQty} left
                    </span>
                  </div>
                  <button 
                    style={{ 
                      background: '#3b82f6',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.background = '#2563eb';
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.currentTarget.style.background = '#3b82f6';
                    }}
                  >
                    Restock
                  </button>
                </div>
              ))
            ) : (
              <div style={emptyStateStyle}>All products are well stocked ✅</div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
