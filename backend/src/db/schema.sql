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

CREATE INDEX ON grant_embeddings USING ivfflat (embedding vector_cosine_ops);

