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
  embedding VECTOR(1536), -- For OpenAI embeddings
  created_at TIMESTAMP DEFAULT NOW()
);
