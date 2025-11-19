-- Add additional indexes for enhanced trip search performance
-- This migration adds indexes to optimize the new search filters

-- Index for driver rating searches
CREATE INDEX idx_users_rating ON users(rating) WHERE rating IS NOT NULL;

-- Index for verification status searches (for verified drivers filter)
CREATE INDEX idx_users_verification_status ON users USING GIN(verification_status);

-- Composite index for time-based searches
CREATE INDEX idx_trips_departure_time_range ON trips(departure_time, departure_date) WHERE status = 'active';

-- Index for price range searches with status
CREATE INDEX idx_trips_price_status ON trips(price_per_seat, status) WHERE status = 'active';

-- Composite index for route and date searches (most common search pattern)
CREATE INDEX idx_trips_route_date_status ON trips(origin_city, destination_city, departure_date, status) WHERE status = 'active';

-- Index for available seats with status
CREATE INDEX idx_trips_seats_status ON trips(available_seats, status) WHERE status = 'active';

-- Composite index for complex searches combining multiple filters
CREATE INDEX idx_trips_complex_search ON trips(
    origin_city, 
    destination_city, 
    departure_date, 
    price_per_seat, 
    available_seats, 
    status
) WHERE status = 'active';

-- Index for sorting by creation date
CREATE INDEX idx_trips_created_at_status ON trips(created_at, status) WHERE status = 'active';

-- Partial index for future trips only (most searches are for future trips)
CREATE INDEX idx_trips_future_only ON trips(departure_date, departure_time, status) 
WHERE status = 'active' AND departure_date >= CURRENT_DATE;

-- Index for driver-trip relationship with rating for sorting
CREATE INDEX idx_trips_driver_rating ON trips(driver_id) 
INCLUDE (origin_city, destination_city, departure_date, price_per_seat);

-- Function-based index for date range searches (alternative dates)
CREATE INDEX idx_trips_date_proximity ON trips(departure_date, origin_city, destination_city) 
WHERE status = 'active';

-- Add statistics collection for better query planning
ANALYZE trips;
ANALYZE users;
ANALYZE bookings;

-- Create a function to refresh search-related statistics
CREATE OR REPLACE FUNCTION refresh_search_statistics()
RETURNS void AS $
BEGIN
    -- Refresh statistics for search-related tables
    ANALYZE trips;
    ANALYZE users;
    ANALYZE bookings;
    
    -- Log the refresh
    RAISE NOTICE 'Search statistics refreshed at %', NOW();
END;
$ LANGUAGE plpgsql;

-- Create a function to monitor search performance
CREATE OR REPLACE FUNCTION get_search_performance_stats()
RETURNS TABLE(
    table_name text,
    index_name text,
    index_size text,
    index_scans bigint,
    tuples_read bigint,
    tuples_fetched bigint
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        indexname as index_name,
        pg_size_pretty(pg_relation_size(indexrelid)) as index_size,
        idx_scan as index_scans,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
    FROM pg_stat_user_indexes 
    WHERE schemaname = 'public' 
    AND (tablename = 'trips' OR tablename = 'users' OR tablename = 'bookings')
    ORDER BY idx_scan DESC;
END;
$ LANGUAGE plpgsql;

-- Schedule statistics refresh (this would typically be done via cron or pg_cron)
-- For now, we'll just document that this should be run periodically
COMMENT ON FUNCTION refresh_search_statistics() IS 'Run this function periodically (e.g., daily) to keep search statistics up to date';