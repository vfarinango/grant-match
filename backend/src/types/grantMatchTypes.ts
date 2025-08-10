// ---------------------------------------------------------------------
// ------------------ GrantMatch Grant Interfaces ----------------------
// ---------------------------------------------------------------------

// Define an interface for the Grant data (for backend validation later)
export interface Grant {
    id: number;
    title: string;
    description: string;
    deadline?: Date; 
    funding_amount?: string;  
    source?: string;
    source_url?: string;
    focus_areas?: string[]; 
    posted_date?: Date; 
    created_at?: Date;
    summary?: string;
}

// embeddings interface
export interface GrantEmbedding {
    id: number;
    grant_id: number;
    embedding_type: 'full_text' | 'title' | 'description';
    embedding: number[];
    model_version: string;
    created_at: Date;
}

// Specific interface for similar search results
export interface SimilarGrant extends Grant {
    similarity_score: number; 
}



