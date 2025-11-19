import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ECUADOR_CITIES = [
  'Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Manta', 'Portoviejo',
  'Machala', 'Durán', 'Esmeraldas', 'Riobamba', 'Ibarra', 'Loja'
];

const SearchForm: React.FC = () => {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('1');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fromCity || !toCity || !date) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (fromCity === toCity) {
      alert('La ciudad de origen debe ser diferente a la de destino');
      return;
    }

    // Navigate to search results with query parameters
    const searchParams = new URLSearchParams({
      from: fromCity,
      to: toCity,
      date,
      passengers,
    });
    
    navigate(`/search?${searchParams.toString()}`);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <div className="search-form-grid">
        <div className="form-group">
          <label className="form-label">Desde</label>
          <select
            className="form-input"
            value={fromCity}
            onChange={(e) => setFromCity(e.target.value)}
            required
          >
            <option value="">Seleccionar ciudad</option>
            {ECUADOR_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Hasta</label>
          <select
            className="form-input"
            value={toCity}
            onChange={(e) => setToCity(e.target.value)}
            required
          >
            <option value="">Seleccionar ciudad</option>
            {ECUADOR_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Fecha</label>
          <input
            type="date"
            className="form-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={getTomorrowDate()}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Pasajeros</label>
          <select
            className="form-input"
            value={passengers}
            onChange={(e) => setPassengers(e.target.value)}
          >
            <option value="1">1 pasajero</option>
            <option value="2">2 pasajeros</option>
            <option value="3">3 pasajeros</option>
            <option value="4">4 pasajeros</option>
          </select>
        </div>
      </div>

      <button type="submit" className="btn btn-primary search-button">
        🔍 Buscar Viajes
      </button>
    </form>
  );
};

export default SearchForm;