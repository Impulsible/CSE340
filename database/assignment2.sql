-- Create contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  contact_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(200),
  message TEXT NOT NULL,
  vehicle_id INT,
  preferred_contact VARCHAR(10) DEFAULT 'email',
  newsletter BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES inventory(inv_id) ON DELETE SET NULL
);

-- Add is_read column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'contact_submissions' 
                 AND column_name = 'is_read') THEN
    ALTER TABLE contact_submissions ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
  END IF;
END $$;