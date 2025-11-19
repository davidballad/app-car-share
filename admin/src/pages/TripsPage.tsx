import React, { useState } from 'react';

interface Trip {
  id: string;
  route: string;
  driver: string;
  date: string;
  time: string;
  price: number;
  seats: number;
  bookedSeats: number;
  status: 'active' | 'completed' | 'cancelled';
}

const TripsPage: React.FC = () => {
  const [trips] = useState<Trip[]>([
    {
      id: '1',
      route: 'Quito → Guayaquil',
      driver: 'Carlos Mendoza',
      date: '2024-01-20',
      time: '08:00',
      price: 25,
      seats: 4,
      bookedSeats: 3,
      status: 'active',
    },
    {
      id: '2',
      route: 'Guayaquil → Cuenca',
      driver: 'María González',
      date: '2024-01-19',
      time: '14:30',
      price: 30,
      seats: 4,
      bookedSeats: 4,
      status: 'completed',
    },
    {
      id: '3',
      route: 'Cuenca → Quito',
      driver: 'Luis Rodríguez',
      date: '2024-01-18',
      time: '09:15',
      price: 35,
      seats: 3,
      bookedSeats: 1,
      status: 'cancelled',
    },
  ]);

  const [statusFilter, setStatusFilter] = useState('all');

  const filteredTrips = trips.filter(trip => 
    statusFilter === 'all' || trip.status === statusFilter
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Activo</span>;
      case 'completed':
        return <span className="badge badge-info">Completado</span>;
      case 'cancelled':
        return <span className="badge badge-danger">Cancelado</span>;
      default:
        return <span className="badge badge-warning">Desconocido</span>;
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem', color: 'var(--gray-800)' }}>
        Gestión de Viajes
      </h2>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{trips.length}</div>
          <div className="stat-label">Total Viajes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{trips.filter(t => t.status === 'active').length}</div>
          <div className="stat-label">Activos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{trips.filter(t => t.status === 'completed').length}</div>
          <div className="stat-label">Completados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            ${trips.reduce((sum, trip) => sum + (trip.price * trip.bookedSeats), 0)}
          </div>
          <div className="stat-label">Ingresos Totales</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input"
          style={{ width: 'auto' }}
        >
          <option value="all">Todos los viajes</option>
          <option value="active">Activos</option>
          <option value="completed">Completados</option>
          <option value="cancelled">Cancelados</option>
        </select>
      </div>

      {/* Trips Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Ruta</th>
                <th>Conductor</th>
                <th>Fecha y Hora</th>
                <th>Precio</th>
                <th>Asientos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip) => (
                <tr key={trip.id}>
                  <td style={{ fontWeight: '500' }}>{trip.route}</td>
                  <td>{trip.driver}</td>
                  <td>
                    <div>
                      <div>{new Date(trip.date).toLocaleDateString('es-EC')}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                        {trip.time}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: '500', color: 'var(--secondary-green)' }}>
                    ${trip.price}
                  </td>
                  <td>
                    <div>
                      <div>{trip.bookedSeats}/{trip.seats}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                        {trip.seats - trip.bookedSeats} disponibles
                      </div>
                    </div>
                  </td>
                  <td>{getStatusBadge(trip.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTrips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
            No hay viajes {statusFilter !== 'all' ? `con estado "${statusFilter}"` : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsPage;