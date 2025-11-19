-- Create users table with comprehensive user data and verification status
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  profile_photo_url TEXT,
  date_of_birth DATE,
  rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_trips INTEGER DEFAULT 0 CHECK (total_trips >= 0),
  verification_status JSONB DEFAULT '{
    "phoneVerified": false,
    "identityVerified": false,
    "backgroundCheckPassed": false,
    "driverLicenseVerified": false,
    "vehicleRegistrationVerified": false
  }'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_verification_status ON users USING GIN (verification_status);
CREATE INDEX idx_users_rating ON users(rating);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
CREATE INDEX idx_users_active ON users(id) WHERE deleted_at IS NULL;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE users IS 'Main users table storing user profiles and verification status';
COMMENT ON COLUMN users.verification_status IS 'JSONB field storing verification flags and dates';
COMMENT ON COLUMN users.rating IS 'User rating from 0.00 to 5.00 based on trip reviews';
COMMENT ON COLUMN users.total_trips IS 'Total number of completed trips as driver or passenger';