import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchForm from '../components/search/SearchForm';

interface Trip {
  id: string;
  route: string;
  fromCity: string;
  toCity: string;
  date: string;
  time: string;
  price: number;
  availableSeats: number;
  driver: {
    name: string;
    rating: number;
    reviewCount: number;
  };
  vehicle: {
    make: string;
    model: string;
    color: string;
  };
}

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);

  const fromCity = searchParams.get('from') || '';
  const toCity = searchParams.get('to') || '';
  const date = searchParams.get('date') || '';
  const passengers = searchParams.get('passengers') || '1';

  useEffect(() => {
    if (fromCity && toCity && date) {
      searchTrips();
    }
  }, [fromCity, toCity, date, passengers]);

  const searchTrips = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data
    const mockTrips: Trip[] = [
      {
        id: '1',
        route: `${fromCity} → ${toCity}`,
        fromCity,
        toCity,
        date,
        time: '08:00',
        price: 25,
        availableSeats: 3,
        driver: {
          name: 'Carlos Mendoza',
          rating: 4.8,
          reviewCount: 24,
        },
        vehicle: {
          make: 'Toyota',
          model: 'Corolla',
          color: 'Blanco',
        },
      },
      {
        id: '2',
        route: `${fromCity} → ${toCity}`,
        fromCity,
        toCity,
        date,
        time: '14:30',
        price: 30,
        availableSeats: 2,
        driver: {
          name: 'María González',
          rating: 4.9,
          reviewCount: 18,
        },
        vehicle: {
          make: 'Chevrolet',
          model: 'Sail',
          color: 'Azul',
        },
      },
    ];
    
    setTrips(mockTrips);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    return stars.join('');
  };

  const handleBookTrip = (tripId: string) => {
    alert(`Funcionalidad de reserva para viaje ${tripId} - Próximamente disponible`);
  };

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Buscar Viajes</h1>
          <p className="page-subtitle">
            Encuentra el viaje perfecto para tu destino
          </p>
        </div>

        <SearchForm />

        {fromCity && toCity && date && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--primary-blue)' }}>
              Resultados para {fromCity} → {toCity}
            </h2>
            <p style={{ color: 'var(--gray)', marginBottom: '2rem' }}>
              {formatDate(date)} • {passengers} pasajero{passengers !== '1' ? 's' : ''}
            </p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div className="spinner"></div>
                <p>Buscando viajes disponibles...</p>
              </div>
            ) : trips.length > 0 ? (
              <div className="trips-grid">
                {trips.map((trip) => (
                  <div key={trip.id} className="trip-card card">
                    <div className="trip-header">
                      <h3 className="trip-route">{trip.route}</h3>
                      <div className="trip-price">${trip.price}</div>
                    </div>

                    <div className="trip-details">
                      <div className="trip-detail">
                        <span>🕐</span>
                        <span>{trip.time}</span>
                      </div>
                      <div className="trip-detail">
                        <span>👥</span>
                        <span>{trip.availableSeats} asientos</span>
                      </div>
                    </div>

                    <div className="trip-driver">
                      <div className="driver-avatar">
                        {trip.driver.name.charAt(0)}
                      </div>
                      <div className="driver-info">
                        <div className="driver-name">{trip.driver.name}</div>
                        <div className="driver-rating">
                          {renderStars(trip.driver.rating)} {trip.driver.rating} ({trip.driver.reviewCount} reseñas)
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
                      <p style={{ color: 'var(--gray)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        🚗 {trip.vehicle.make} {trip.vehicle.model} {trip.vehicle.color}
                      </p>
                      <button 
                        className="btn btn-primary" 
                        style={{ width: '100%' }}
                        onClick={() => handleBookTrip(trip.id)}
                      >
                        Reservar Viaje
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <h3>No se encontraron viajes</h3>
                <p style={{ color: 'var(--gray)' }}>
                  Intenta con diferentes fechas o ciudades
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;