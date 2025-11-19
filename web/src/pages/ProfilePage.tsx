import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const verificationItems = [
    { label: 'Teléfono', status: 'verified', icon: '✅' },
    { label: 'Identidad', status: 'pending', icon: '⏳' },
    { label: 'Antecedentes', status: 'pending', icon: '⏳' },
    { label: 'Licencia', status: 'not_started', icon: '❌' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'var(--success)';
      case 'pending': return 'var(--warning)';
      default: return 'var(--error)';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Verificado';
      case 'pending': return 'Pendiente';
      default: return 'No iniciado';
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-subtitle">
            Gestiona tu información personal y verificaciones
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {/* Personal Information */}
          <div className="card">
            <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>
              Información Personal
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-blue)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                marginRight: '1rem'
              }}>
                {user.firstName.charAt(0)}
              </div>
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>
                  {user.firstName} {user.lastName}
                </h3>
                <p style={{ color: 'var(--gray)', marginBottom: '0.25rem' }}>
                  {user.email}
                </p>
                <p style={{ color: 'var(--gray)' }}>
                  {user.phone}
                </p>
              </div>
            </div>

            <button className="btn btn-outline" style={{ width: '100%' }}>
              Editar Información
            </button>
          </div>

          {/* Verification Status */}
          <div className="card">
            <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>
              Estado de Verificación
            </h2>
            
            <div style={{ marginBottom: '2rem' }}>
              {verificationItems.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 0',
                  borderBottom: index < verificationItems.length - 1 ? '1px solid #e0e0e0' : 'none'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <span style={{ 
                    color: getStatusColor(item.status),
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    {getStatusText(item.status)}
                  </span>
                </div>
              ))}
            </div>

            <button className="btn btn-secondary" style={{ width: '100%' }}>
              Completar Verificación
            </button>
          </div>

          {/* Trip Statistics */}
          <div className="card">
            <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>
              Estadísticas
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: 'var(--primary-blue)',
                  marginBottom: '0.5rem'
                }}>
                  0
                </div>
                <div style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
                  Viajes Completados
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: 'var(--secondary-green)',
                  marginBottom: '0.5rem'
                }}>
                  5.0
                </div>
                <div style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
                  Calificación
                </div>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>
                Miembro desde {new Date().toLocaleDateString('es-EC', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 style={{ color: 'var(--primary-blue)', marginBottom: '1.5rem' }}>
              Acciones Rápidas
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn btn-outline">
                📋 Mis Reservas
              </button>
              <button className="btn btn-outline">
                🚗 Crear Viaje
              </button>
              <button className="btn btn-outline">
                💬 Mensajes
              </button>
              <button className="btn btn-outline">
                ❓ Centro de Ayuda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;