-- Create background_checks table for Ecuador verification system
CREATE TABLE IF NOT EXISTS background_checks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('cedula', 'passport')),
    document_number VARCHAR(20) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    document_photo_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_background_checks_user_id ON background_checks(user_id);
CREATE INDEX idx_background_checks_status ON background_checks(status);
CREATE INDEX idx_background_checks_expires_at ON background_checks(expires_at);
CREATE INDEX idx_background_checks_created_at ON background_checks(created_at);

-- Create function to automatically expire background checks after 90 days
CREATE OR REPLACE FUNCTION expire_background_checks()
RETURNS void AS $$
BEGIN
    UPDATE background_checks 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'approved' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_background_checks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_background_checks_updated_at
    BEFORE UPDATE ON background_checks
    FOR EACH ROW
    EXECUTE FUNCTION update_background_checks_updated_at();

-- Create a scheduled job function (to be called by cron or similar)
-- This would typically be called daily to expire old background checks
CREATE OR REPLACE FUNCTION cleanup_expired_background_checks()
RETURNS void AS $$
BEGIN
    -- Expire background checks that are past their expiry date
    PERFORM expire_background_checks();
    
    -- Log the cleanup operation
    INSERT INTO system_logs (operation, details, created_at)
    VALUES ('background_check_cleanup', 'Expired old background checks', NOW())
    ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create system_logs table if it doesn't exist (for logging cleanup operations)
CREATE TABLE IF NOT EXISTS system_logs (
    id SERIAL PRIMARY KEY,
    operation VARCHAR(100) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add some sample Ecuador province codes for reference (comment)
-- 01: Azuay, 02: Bolívar, 03: Cañar, 04: Carchi, 05: Cotopaxi
-- 06: Chimborazo, 07: El Oro, 08: Esmeraldas, 09: Guayas, 10: Imbabura
-- 11: Loja, 12: Los Ríos, 13: Manabí, 14: Morona Santiago, 15: Napo
-- 16: Pastaza, 17: Pichincha, 18: Tungurahua, 19: Zamora Chinchipe
-- 20: Galápagos, 21: Sucumbíos, 22: Orellana, 23: Santo Domingo, 24: Santa Elena