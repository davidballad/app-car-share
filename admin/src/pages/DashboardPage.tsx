import React from 'react';

const DashboardPage: React.FC = () => {
  const stats = [
    { label: 'Usuarios Totales', value: '1,234', color: 'var(--primary-blue)' },
    { label: 'Viajes Activos', value: '89', color: 'var(--secondary-green)' },
    { label: 'Verificaciones Pendientes', value: '23', color: 'var(--warning)' },
    { label: 'Ingresos del Mes', value: '$12,450', color: 'var(--success)' },
  ];

  const recentActivity = [
    { type: 'user', message: 'Nuevo usuario registrado: María González', time: '2 min' },
    { type: 'trip', message: 'Viaje completado: Quito → Guayaquil', time: '15 min' },
    { type: 'verification', message: 'Verificación aprobada: Carlos Mendoza', time: '1 hora' },
    { type: 'user', message: 'Nuevo conductor registrado: Ana Rodríguez', time: '2 horas' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return '👤';
      case 'trip': return '🚗';
      case 'verification': return '✅';
      default: return '📝';
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', color: 'var(--gray-800)' }}>
        Dashboard
      </h2>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Actividad Reciente</h3>
          </div>
          <div>
            {recentActivity.map((activity, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '1rem 0',
                borderBottom: index < recentActivity.length - 1 ? '1px solid var(--gray-200)' : 'none'
              }}>
                <span style={{ marginRight: '1rem', fontSize: '1.5rem' }}>
                  {getActivityIcon(activity.type)}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: 'var(--gray-700)' }}>
                    {activity.message}
                  </p>
                </div>
                <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Acciones Rápidas</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button className="btn btn-primary">
              📋 Ver Verificaciones
            </button>
            <button className="btn btn-success">
              👥 Gestionar Usuarios
            </button>
            <button className="btn btn-warning">
              🚗 Monitorear Viajes
            </button>
            <button className="btn btn-primary">
              📊 Ver Reportes
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">Estado del Sistema</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🟢</div>
            <div style={{ fontWeight: '500' }}>API Backend</div>
            <div style={{ color: 'var(--success)', fontSize: '0.875rem' }}>Operativo</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🟢</div>
            <div style={{ fontWeight: '500' }}>Base de Datos</div>
            <div style={{ color: 'var(--success)', fontSize: '0.875rem' }}>Operativo</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🟡</div>
            <div style={{ fontWeight: '500' }}>Notificaciones</div>
            <div style={{ color: 'var(--warning)', fontSize: '0.875rem' }}>Mantenimiento</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🟢</div>
            <div style={{ fontWeight: '500' }}>WhatsApp API</div>
            <div style={{ color: 'var(--success)', fontSize: '0.875rem' }}>Operativo</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;