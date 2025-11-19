import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión con Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setError('');
    setFacebookLoading(true);

    try {
      await loginWithFacebook();
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión con Facebook');
    } finally {
      setFacebookLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card card">
          <div className="auth-header">
            <h1 className="auth-title">Iniciar Sesión</h1>
            <p className="auth-subtitle">
              Accede a tu cuenta de Ecuador Rideshare
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="form-error" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              disabled={loading || googleLoading || facebookLoading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '20px', height: '20px', margin: '0 auto' }}></div>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="social-divider" style={{ margin: '1.5rem 0', textAlign: 'center', position: 'relative' }}>
            <span style={{ 
              background: '#fff', 
              padding: '0 1rem', 
              position: 'relative', 
              zIndex: 1,
              color: '#666'
            }}>
              O continúa con
            </span>
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: 0, 
              right: 0, 
              height: '1px', 
              background: '#ddd',
              zIndex: 0
            }}></div>
          </div>

          <div className="social-buttons" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <button
              type="button"
              className="btn"
              style={{
                flex: 1,
                backgroundColor: '#DB4437',
                color: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onClick={handleGoogleLogin}
              disabled={loading || googleLoading || facebookLoading}
            >
              {googleLoading ? (
                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
              ) : (
                <>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>G</span>
                  <span>Google</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn"
              style={{
                flex: 1,
                backgroundColor: '#4267B2',
                color: '#fff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onClick={handleFacebookLogin}
              disabled={loading || googleLoading || facebookLoading}
            >
              {facebookLoading ? (
                <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
              ) : (
                <>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>f</span>
                  <span>Facebook</span>
                </>
              )}
            </button>
          </div>

          <div className="auth-footer">
            <p>
              ¿No tienes cuenta?{' '}
              <Link to="/register">Regístrate aquí</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;