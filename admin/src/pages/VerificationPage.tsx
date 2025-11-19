import React, { useState } from 'react';

interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  documentType: 'cedula' | 'passport';
  documentNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  notes?: string;
}

const VerificationPage: React.FC = () => {
  const [requests] = useState<VerificationRequest[]>([
    {
      id: '1',
      userId: '101',
      userName: 'María González',
      userEmail: 'maria@email.com',
      documentType: 'cedula',
      documentNumber: '1714616123',
      status: 'pending',
      submittedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      userId: '102',
      userName: 'Carlos Mendoza',
      userEmail: 'carlos@email.com',
      documentType: 'passport',
      documentNumber: 'AB1234567',
      status: 'approved',
      submittedAt: '2024-01-14T15:20:00Z',
      reviewedAt: '2024-01-14T16:45:00Z',
    },
    {
      id: '3',
      userId: '103',
      userName: 'Ana Rodríguez',
      userEmail: 'ana@email.com',
      documentType: 'cedula',
      documentNumber: '0926687856',
      status: 'pending',
      submittedAt: '2024-01-13T09:15:00Z',
    },
  ]);

  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredRequests = requests.filter(request => 
    selectedStatus === 'all' || request.status === selectedStatus
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-success">Aprobado</span>;
      case 'rejected':
        return <span className="badge badge-danger">Rechazado</span>;
      case 'pending':
      default:
        return <span className="badge badge-warning">Pendiente</span>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleApprove = (requestId: string) => {
    alert(`Aprobar verificación ${requestId} - Funcionalidad próximamente`);
  };

  const handleReject = (requestId: string) => {
    alert(`Rechazar verificación ${requestId} - Funcionalidad próximamente`);
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--gray-800)' }}>
          Verificaciones de Antecedentes
        </h2>
        <div className="badge badge-warning">
          {pendingCount} pendientes
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontWeight: '500' }}>Filtrar por estado:</label>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="form-input"
            style={{ width: 'auto' }}
          >
            <option value="all">Todos</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobados</option>
            <option value="rejected">Rechazados</option>
          </select>
        </div>
      </div>

      {/* Verification Requests Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Documento</th>
                <th>Estado</th>
                <th>Enviado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: '500' }}>{request.userName}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                        {request.userEmail}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '500' }}>
                        {request.documentType === 'cedula' ? 'Cédula' : 'Pasaporte'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                        {request.documentNumber}
                      </div>
                    </div>
                  </td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                    {formatDate(request.submittedAt)}
                  </td>
                  <td>
                    {request.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-success btn-sm"
                          onClick={() => handleApprove(request.id)}
                        >
                          ✅ Aprobar
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleReject(request.id)}
                        >
                          ❌ Rechazar
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                        {request.reviewedAt ? `Revisado ${formatDate(request.reviewedAt)}` : '-'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-500)' }}>
            No hay verificaciones {selectedStatus !== 'all' ? `con estado "${selectedStatus}"` : ''}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="card" style={{ marginTop: '2rem', background: '#f0f9ff' }}>
        <h3 style={{ color: 'var(--primary-blue)', marginBottom: '1rem' }}>
          📋 Proceso de Verificación
        </h3>
        <ol style={{ paddingLeft: '1.5rem', color: 'var(--gray-700)' }}>
          <li>Revisar el documento de identidad (cédula o pasaporte)</li>
          <li>Verificar en el sitio web oficial del gobierno ecuatoriano</li>
          <li>Confirmar que los datos coinciden con el perfil del usuario</li>
          <li>Aprobar o rechazar la verificación con notas si es necesario</li>
        </ol>
      </div>
    </div>
  );
};

export default VerificationPage;