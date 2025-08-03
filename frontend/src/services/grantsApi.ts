import axios from 'axios';
const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL;

interface Grant {
    id: number;
    title: string;
    description: string;
    deadline?: Date; 
    funding_amount?: number;  
    source?: string;
    source_url?: string;
    focus_areas?: string[]; 
    posted_date?: Date; 
    embedding?: number[]; 
    created_at?: Date;
    similarity_score?: number;
}

interface SearchResponse {
    message: string;
    status: 'excellent' | 'good' | 'fair' | 'no_results';
    query: string;
    results: Grant[];
    metadata: {
        totalResults: number;
        topSimilarityScore: number | null;
        relevanceThreshold: number;
    };
}

// Function to get all grants from backend API
const getGrantsFromApi = async (): Promise<Grant[]> => {
    if (!BACKEND_URL) {
        throw new Error("VITE_APP_BACKEND_URL is not defined in frontend/.env or Netlify.");
    }

    console.log('Calling API:', `${BACKEND_URL}/api/grants`); // Debug log

    try {
        const apiUrl = `${BACKEND_URL}/api/grants`;
        const response = await axios.get<Grant[]>(apiUrl); // Ensure expected type
        console.log('Full API Response:', response); // Debug the full response
        console.log('Response Status:', response.status); // Debug status
        console.log('Response Data:', response.data); // Debug data
        console.log('Response Data Type:', typeof response.data); // Debug data type
        console.log('Response Data Length:', response.data?.length); // Debug length
        return response.data; // Return the raw data array

    } catch (error) {
        console.error('Error in getGrantsFromApi:', error);
        throw error;    
    }
};

// Function to search grants from backend API
const searchGrantsFromApi = async (query: string): Promise<SearchResponse> => {
    if (!BACKEND_URL) {
        throw new Error("VITE_APP_BACKEND_URL is not defined in frontend/.env or Netlify.");
    }

    console.log('Calling search API:', `${BACKEND_URL}/api/grants/search?query=${encodeURIComponent(query)}`); // Debug log

    try {
        const apiUrl = `${BACKEND_URL}/api/grants/search?query=${encodeURIComponent(query)}`;
        const response = await axios.get<SearchResponse>(apiUrl); // Ensure expected type
        console.log('Full Search Response:', response); // Debug the full response
        console.log('Search Response Status:', response.status); // Debug status
        console.log('Search Response Data:', response.data); // Debug data
        console.log('Search Results Array:', response.data?.results); // Debug results array        
        return response.data;
    } catch (error) {
        console.error('Error in searchGrantsFromApi call: ', error);
        throw error;
    }
};

export { getGrantsFromApi, searchGrantsFromApi };
export type { Grant, SearchResponse };