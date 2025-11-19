import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, loginWithGoogle, loginWithFacebook } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (!formData.phone.match(/^09\d{8}$/)) {
      setError('Ingresa un número de teléfono móvil válido (09XXXXXXXX)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse con Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleFacebookSignup = async () => {
    setError('');
    setFacebookLoading(true);

    try {
      await loginWithFacebook();
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse con Facebook');
    } finally {
      setFacebookLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container">
        <div className="auth-card card">
          <div className="auth-header">
            <h1 className="auth-title">Crear Cuenta</h1>
            <p className="auth-subtitle">
              Únete a Ecuador Rideshare y comienza a viajar
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <div className="form-error" style={{ marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Nombres</label>
                <input
                  type="text"
                  name="firstName"
                  className="form-input"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Tus nombres"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Apellidos</label>
                <input
                  type="text"
                  name="lastName"
                  className="form-input"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Tus apellidos"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Teléfono Móvil</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0987654321"
                pattern="09[0-9]{8}"
                required
                disabled={loading}
              />
              <small style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
                Formato: 09XXXXXXXX
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirmar Contraseña</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                minLength={6}
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
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
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
              O regístrate con
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
              onClick={handleGoogleSignup}
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
              onClick={handleFacebookSignup}
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
              ¿Ya tienes cuenta?{' '}
              <Link to="/login">Inicia sesión aquí</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;