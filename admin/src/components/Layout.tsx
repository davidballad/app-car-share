import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            🇪🇨 Admin Panel
          </div>
        </div>
        
        <nav>
          <ul className="sidebar-nav">
            <li>
              <Link to="/dashboard" className={isActive('/dashboard')}>
                <span className="icon">📊</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/verification" className={isActive('/verification')}>
                <span className="icon">✅</span>
                Verificaciones
              </Link>
            </li>
            <li>
              <Link to="/users" className={isActive('/users')}>
                <span className="icon">👥</span>
                Usuarios
              </Link>
            </li>
            <li>
              <Link to="/trips" className={isActive('/trips')}>
                <span className="icon">🚗</span>
                Viajes
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--gray-200)'
        }}>
          <h1 style={{ color: 'var(--gray-800)' }}>
            Panel de Administración
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>Hola, {admin?.name}</span>
            <button onClick={logout} className="btn btn-primary btn-sm">
              Cerrar Sesión
            </button>
          </div>
        </div>
        
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;