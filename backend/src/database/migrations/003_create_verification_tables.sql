-- Create verification events table for tracking all verification activities
CREATE TABLE verification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create identity verifications table for document verification
CREATE TABLE identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('cedula', 'passport')),
  document_number VARCHAR(50) NOT NULL,
  document_photo TEXT NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  date_of_birth DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one active verification per user
  UNIQUE(user_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- Create background checks table (already exists from previous task, but adding if missing)
CREATE TABLE IF NOT EXISTS background_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('cedula', 'passport')),
  document_number VARCHAR(50) NOT NULL,
  full_name VARCHAR(200),
  date_of_birth DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_valid BOOLEAN,
  has_records BOOLEAN,
  check_date TIMESTAMP,
  expiry_date TIMESTAMP,
  api_response JSONB,
  review_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create driver license verifications table
CREATE TABLE driver_license_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(50) NOT NULL,
  license_photo TEXT NOT NULL,
  license_type VARCHAR(20) NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vehicle registration verifications table
CREATE TABLE vehicle_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  license_plate VARCHAR(20) NOT NULL,
  vehicle_make VARCHAR(50) NOT NULL,
  vehicle_model VARCHAR(50) NOT NULL,
  vehicle_year INTEGER NOT NULL CHECK (vehicle_year >= 1990 AND vehicle_year <= EXTRACT(YEAR FROM CURRENT_DATE) + 1),
  vehicle_color VARCHAR(30) NOT NULL,
  registration_photo TEXT NOT NULL,
  insurance_photo TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure unique license plate
  UNIQUE(license_plate)
);

-- Create indexes for performance
CREATE INDEX idx_verification_events_user_id ON verification_events(user_id);
CREATE INDEX idx_verification_events_type ON verification_events(verification_type);
CREATE INDEX idx_verification_events_status ON verification_events(status);
CREATE INDEX idx_verification_events_created_at ON verification_events(created_at);

CREATE INDEX idx_identity_verifications_user_id ON identity_verifications(user_id);
CREATE INDEX idx_identity_verifications_status ON identity_verifications(status);
CREATE INDEX idx_identity_verifications_created_at ON identity_verifications(created_at);

CREATE INDEX idx_background_checks_user_id ON background_checks(user_id);
CREATE INDEX idx_background_checks_status ON background_checks(status);
CREATE INDEX idx_background_checks_expiry_date ON background_checks(expiry_date);
CREATE INDEX idx_background_checks_created_at ON background_checks(created_at);

CREATE INDEX idx_driver_license_verifications_user_id ON driver_license_verifications(user_id);
CREATE INDEX idx_driver_license_verifications_status ON driver_license_verifications(status);

CREATE INDEX idx_vehicle_registrations_user_id ON vehicle_registrations(user_id);
CREATE INDEX idx_vehicle_registrations_status ON vehicle_registrations(status);
CREATE INDEX idx_vehicle_registrations_license_plate ON vehicle_registrations(license_plate);

-- Create triggers to update updated_at timestamps
CREATE TRIGGER update_identity_verifications_updated_at 
    BEFORE UPDATE ON identity_verifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_background_checks_updated_at 
    BEFORE UPDATE ON background_checks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_driver_license_verifications_updated_at 
    BEFORE UPDATE ON driver_license_verifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicle_registrations_updated_at 
    BEFORE UPDATE ON vehicle_registrations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE verification_events IS 'Log of all verification activities and status changes';
COMMENT ON TABLE identity_verifications IS 'Identity document verification submissions and reviews';
COMMENT ON TABLE background_checks IS 'Background check requests and results';
COMMENT ON TABLE driver_license_verifications IS 'Driver license verification submissions';
COMMENT ON TABLE vehicle_registrations IS 'Vehicle registration and insurance verifications';

COMMENT ON COLUMN identity_verifications.document_type IS 'Type of identity document: cedula or passport';
COMMENT ON COLUMN background_checks.expiry_date IS 'Background check expiry date (90 days from approval)';
COMMENT ON COLUMN vehicle_registrations.license_plate IS 'Vehicle license plate number (unique)';
COMMENT ON COLUMN driver_license_verifications.license_type IS 'Type of license (e.g., B, C, D, etc.)';