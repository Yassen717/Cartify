import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  FiGrid,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiLogOut
} from 'react-icons/fi';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
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
    <div className="admin-layout">
      <aside className="sidebar" aria-label="Sidebar navigation">
        <div className="sidebar-header">
          <h1 className="sidebar-title">Cartify Admin</h1>
          <p className="sidebar-subtitle">Management Dashboard</p>
        </div>
        <nav className="sidebar-nav" aria-label="Admin navigation">
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link to={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                    <Icon className="nav-icon" />
                    <span className="nav-text">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn" aria-label="Logout">
            <FiLogOut className="logout-icon" />
            <span>Logout</span>
          </button>
          <div className="user-info" aria-label="Logged in as">
            <span className="user-info-label">Logged in as</span>
            <span className="user-info-email">{user.email}</span>
          </div>
        </div>
      </aside>

      <main className="main-content" aria-label="Main content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
