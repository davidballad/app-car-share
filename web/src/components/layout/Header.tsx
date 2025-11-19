import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            🇪🇨 Ecuador Rideshare
          </Link>
          
          <nav>
            <ul className="nav-links">
              <li><Link to="/search">Buscar Viajes</Link></li>
              {user && (
                <>
                  <li><Link to="/profile">Mi Perfil</Link></li>
                </>
              )}
            </ul>
          </nav>

          <div className="auth-buttons">
            {user ? (
              <>
                <span style={{ color: 'white', marginRight: '1rem' }}>
                  Hola, {user.firstName}
                </span>
                <button 
                  onClick={handleLogout}
                  className="btn btn-outline btn-header"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-header">
                  Iniciar Sesión
                </Link>
                <Link to="/register" className="btn btn-secondary btn-header">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;