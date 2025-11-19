import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'passenger' | 'driver';
  verified: boolean;
  joinDate: string;
  tripsCount: number;
  rating: number;
}

const UsersPage: React.FC = () => {
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'María González',
      email: 'maria@email.com',
      phone: '0987654321',
      role: 'passenger',
      verified: true,
      joinDate: '2024-01-10',
      tripsCount: 5,
      rating: 4.8,
    },
    {
      id: '2',
      name: 'Carlos Mendoza',
      email: 'carlos@email.com',
      phone: '0976543210',
      role: 'driver',
      verified: true,
      joinDate: '2024-01-08',
      tripsCount: 12,
      rating: 4.9,
    },
    {
      id: '3',
      name: 'Ana Rodríguez',
      email: 'ana@email.com',
      phone: '0965432109',
      role: 'passenger',
      verified: false,
      joinDate: '2024-01-15',
      tripsCount: 0,
      rating: 0,
    },
  ]);

  const [filter, setFilter] = useState('all');

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'verified') return user.verified;
    if (filter === 'unverified') return !user.verified;
    return user.role === filter;
  });

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', color: 'var(--gray-800)' }}>
        Gestión de Usuarios
      </h2>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Usuarios</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.role === 'driver').length}</div>
          <div className="stat-label">Conductores</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{users.filter(u => u.verified).length}</div>
          <div className="stat-label">Verificados</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-input"
          style={{ width: 'auto' }}
        >
          <option value="all">Todos los usuarios</option>
          <option value="driver">Solo conductores</option>
          <option value="passenger">Solo pasajeros</option>
          <option value="verified">Solo verificados</option>
          <option value="unverified">No verificados</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Viajes</th>
                <th>Calificación</th>
                <th>Registro</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: '500' }}>{user.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                        {user.email}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.role === 'driver' ? 'badge-info' : 'badge-success'}`}>
                      {user.role === 'driver' ? 'Conductor' : 'Pasajero'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.verified ? 'badge-success' : 'badge-warning'}`}>
                      {user.verified ? 'Verificado' : 'Pendiente'}
                    </span>
                  </td>
                  <td>{user.tripsCount}</td>
                  <td>{user.rating > 0 ? `⭐ ${user.rating}` : '-'}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                    {new Date(user.joinDate).toLocaleDateString('es-EC')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;