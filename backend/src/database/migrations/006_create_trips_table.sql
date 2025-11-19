-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    origin_city VARCHAR(100) NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    departure_date DATE NOT NULL,
    departure_time TIME NOT NULL,
    estimated_arrival_time TIME NOT NULL,
    available_seats INTEGER NOT NULL CHECK (available_seats >= 0),
    total_seats INTEGER NOT NULL CHECK (total_seats > 0),
    price_per_seat DECIMAL(10,2) NOT NULL CHECK (price_per_seat > 0),
    vehicle_info JSONB NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'full', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_trips_driver_id ON trips(driver_id);
CREATE INDEX idx_trips_origin_city ON trips(origin_city);
CREATE INDEX idx_trips_destination_city ON trips(destination_city);
CREATE INDEX idx_trips_departure_date ON trips(departure_date);
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_price_per_seat ON trips(price_per_seat);
CREATE INDEX idx_trips_available_seats ON trips(available_seats);

-- Composite indexes for common search patterns
CREATE INDEX idx_trips_route_date ON trips(origin_city, destination_city, departure_date);
CREATE INDEX idx_trips_active_date ON trips(status, departure_date) WHERE status = 'active';

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_trips_updated_at
    BEFORE UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION update_trips_updated_at();

-- Create function to automatically update trip status when seats are full
CREATE OR REPLACE FUNCTION update_trip_status_on_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Update trip status to 'full' when available_seats reaches 0
    IF NEW.available_seats = 0 AND OLD.available_seats > 0 THEN
        NEW.status = 'full';
    -- Update trip status back to 'active' when seats become available again
    ELSIF NEW.available_seats > 0 AND OLD.available_seats = 0 AND NEW.status = 'full' THEN
        NEW.status = 'active';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically manage trip status based on available seats
CREATE TRIGGER trigger_update_trip_status_on_booking
    BEFORE UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION update_trip_status_on_booking();

-- Create function to validate Ecuador cities
CREATE OR REPLACE FUNCTION validate_ecuador_city(city_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN city_name IN (
        'Quito', 'Guayaquil', 'Cuenca', 'Santo Domingo', 'Machala', 'Durán', 
        'Manta', 'Portoviejo', 'Loja', 'Ambato', 'Esmeraldas', 'Quevedo', 
        'Riobamba', 'Milagro', 'Ibarra', 'La Libertad', 'Babahoyo', 'Sangolquí', 
        'Otavalo', 'Rosa Zárate', 'Pasaje', 'Cayambe', 'Latacunga', 'Chone', 
        'Tulcán', 'Tena', 'Puyo', 'Macas', 'Nueva Loja', 'Zamora'
    );
END;
$$ LANGUAGE plpgsql;

-- Add check constraints for Ecuador cities
ALTER TABLE trips ADD CONSTRAINT check_origin_city_valid 
    CHECK (validate_ecuador_city(origin_city));

ALTER TABLE trips ADD CONSTRAINT check_destination_city_valid 
    CHECK (validate_ecuador_city(destination_city));

-- Add constraint to prevent same origin and destination
ALTER TABLE trips ADD CONSTRAINT check_different_cities 
    CHECK (origin_city != destination_city);

-- Add constraint to ensure departure time is before arrival time
ALTER TABLE trips ADD CONSTRAINT check_departure_before_arrival 
    CHECK (departure_time < estimated_arrival_time);

-- Add constraint to ensure departure date is not in the past
ALTER TABLE trips ADD CONSTRAINT check_departure_date_future 
    CHECK (departure_date >= CURRENT_DATE);

-- Create function to clean up old completed/cancelled trips (optional)
CREATE OR REPLACE FUNCTION cleanup_old_trips()
RETURNS void AS $$
BEGIN
    -- Archive trips older than 30 days that are completed or cancelled
    DELETE FROM trips 
    WHERE status IN ('completed', 'cancelled') 
    AND departure_date < CURRENT_DATE - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;