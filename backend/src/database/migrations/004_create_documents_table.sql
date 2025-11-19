-- Create documents table for file uploads and document management
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
    'profile_photo',
    'identity_document', 
    'driver_license',
    'vehicle_registration',
    'vehicle_insurance',
    'background_check_document'
  )),
  file_name VARCHAR(255) NOT NULL,
  original_file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL CHECK (file_size > 0),
  mime_type VARCHAR(100) NOT NULL,
  upload_status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (upload_status IN (
    'uploading',
    'completed', 
    'failed'
  )),
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (verification_status IN (
    'pending',
    'approved',
    'rejected',
    'expired'
  )),
  metadata JSONB DEFAULT '{}',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_document_type ON documents(document_type);
CREATE INDEX idx_documents_verification_status ON documents(verification_status);
CREATE INDEX idx_documents_upload_status ON documents(upload_status);
CREATE INDEX idx_documents_uploaded_at ON documents(uploaded_at);
CREATE INDEX idx_documents_user_type ON documents(user_id, document_type);

-- Create index for expiry date queries (using JSONB path)
CREATE INDEX idx_documents_expiry_date ON documents 
USING BTREE ((metadata->>'expiryDate')) 
WHERE metadata->>'expiryDate' IS NOT NULL;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE documents IS 'File uploads and document management for user verification';
COMMENT ON COLUMN documents.document_type IS 'Type of document: profile_photo, identity_document, driver_license, vehicle_registration, vehicle_insurance, background_check_document';
COMMENT ON COLUMN documents.file_url IS 'URL to access the file (DigitalOcean Spaces CDN URL)';
COMMENT ON COLUMN documents.file_size IS 'File size in bytes';
COMMENT ON COLUMN documents.upload_status IS 'Status of file upload process';
COMMENT ON COLUMN documents.verification_status IS 'Admin verification status of the document';
COMMENT ON COLUMN documents.metadata IS 'Additional document metadata including expiry dates and review notes';

-- Create function to automatically expire documents
CREATE OR REPLACE FUNCTION expire_documents()
RETURNS void AS $$
BEGIN
  UPDATE documents 
  SET verification_status = 'expired',
      updated_at = CURRENT_TIMESTAMP
  WHERE verification_status = 'approved'
    AND metadata->>'expiryDate' IS NOT NULL
    AND (metadata->>'expiryDate')::timestamp < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old failed uploads (older than 24 hours)
CREATE OR REPLACE FUNCTION cleanup_failed_uploads()
RETURNS void AS $$
BEGIN
  DELETE FROM documents 
  WHERE upload_status = 'failed'
    AND uploaded_at < CURRENT_TIMESTAMP - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;