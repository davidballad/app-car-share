import React from 'react';
import { Link } from 'react-router-dom';
import SearchForm from '../components/search/SearchForm';

const HomePage: React.FC = () => {
  return (
    <div className="page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">
            Viaja por Ecuador de forma segura
          </h1>
          <p className="hero-subtitle">
            Conecta con conductores verificados y comparte viajes por todo el país
          </p>
          <div className="hero-buttons">
            <Link to="/search" className="btn btn-secondary">
              Buscar Viajes
            </Link>
            <Link to="/register" className="btn btn-outline">
              Únete Ahora
            </Link>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <div className="container">
        <SearchForm />
      </div>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="page-header">
            <h2 className="page-title">¿Por qué elegir Ecuador Rideshare?</h2>
            <p className="page-subtitle">
              La plataforma más segura y confiable para viajar por Ecuador
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card card">
              <div className="feature-icon">🛡️</div>
              <h3 className="feature-title">Seguridad Verificada</h3>
              <p className="feature-description">
                Todos los conductores pasan por verificación de antecedentes y documentos oficiales.
              </p>
            </div>
            
            <div className="feature-card card">
              <div className="feature-icon">🇪🇨</div>
              <h3 className="feature-title">Cobertura Nacional</h3>
              <p className="feature-description">
                Conectamos las principales ciudades de Ecuador: Quito, Guayaquil, Cuenca y más.
              </p>
            </div>
            
            <div className="feature-card card">
              <div className="feature-icon">💰</div>
              <h3 className="feature-title">Precios Justos</h3>
              <p className="feature-description">
                Tarifas transparentes y justas. Paga en efectivo o transferencia bancaria.
              </p>
            </div>
            
            <div className="feature-card card">
              <div className="feature-icon">📱</div>
              <h3 className="feature-title">Fácil Comunicación</h3>
              <p className="feature-description">
                Contacta directamente con conductores y pasajeros a través de WhatsApp.
              </p>
            </div>
            
            <div className="feature-card card">
              <div className="feature-icon">⭐</div>
              <h3 className="feature-title">Sistema de Calificaciones</h3>
              <p className="feature-description">
                Califica y lee reseñas de otros usuarios para viajar con confianza.
              </p>
            </div>
            
            <div className="feature-card card">
              <div className="feature-icon">🚗</div>
              <h3 className="feature-title">Vehículos Verificados</h3>
              <p className="feature-description">
                Información completa del vehículo y conductor antes de reservar tu viaje.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="hero" style={{ padding: '3rem 0' }}>
        <div className="container">
          <h2 className="hero-title" style={{ fontSize: '2rem' }}>
            ¿Listo para tu próximo viaje?
          </h2>
          <p className="hero-subtitle">
            Únete a miles de ecuatorianos que ya viajan de forma segura
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-secondary">
              Crear Cuenta Gratis
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;