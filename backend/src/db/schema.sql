-- Drop tables if they exist to allow for clean recreation
DROP TABLE IF EXISTS grant_embeddings;
DROP TABLE IF EXISTS grants;


CREATE TABLE grants (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  deadline DATE,
  funding_amount DECIMAL(15,2),
  source VARCHAR(100), -- 'grants.gov', 'usaspending', etc.
  source_url TEXT,
  focus_areas TEXT[], -- Array for multiple focus areas
  posted_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table to store the embedding vectors, linked to the grants table
CREATE TABLE grant_embeddings (
  id SERIAL PRIMARY KEY,
  grant_id INTEGER NOT NULL REFERENCES grants(id) ON DELETE CASCADE,
  embedding_type VARCHAR(50) NOT NULL, -- 'full_text', 'title', 'description'
  embedding VECTOR(1536) NOT NULL,
  model_version VARCHAR(50) DEFAULT 'text-embedding-3-small',
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure one embedding per grant per type
  UNIQUE(grant_id, embedding_type)
);

-- CREATE INDEX ON grant_embeddings USING ivfflat (embedding vector_cosine_ops);

INSERT INTO grants (title, description, deadline, funding_amount, source, source_url, focus_areas, posted_date) VALUES
('Community Development Grant', 'Funding for local community projects focusing on education and infrastructure.', '2025-09-30', 150000.00, 'City Council', 'http://citygrants.org/cdg', ARRAY['education', 'infrastructure'], '2025-07-01'),
('Environmental Research Fund', 'Supports scientific research into renewable energy and sustainable practices.', '2025-10-15', 250000.00, 'Green Futures Foundation', 'http://greenfutures.org/erf', ARRAY['environment', 'research'], '2025-06-20'),
('Arts & Culture Initiative', 'Grants for local artists and cultural organizations to promote community engagement through arts.', '2025-11-01', 75000.00, 'Cultural Heritage Trust', 'http://culturetrust.org/aci', ARRAY['arts', 'culture'], '2025-07-10');