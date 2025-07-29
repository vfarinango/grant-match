import axios from 'axios';

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
}

// Function to get all grants from backend API
const getGrantsFromApi = async (): Promise<Grant[]> => {
    const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;
    if (!backendUrl) {
        throw new Error("VITE_APP_BACKEND_URL is not defined in frontend/.env or Netlify.");
    }

    const apiUrl = `${backendUrl}/api/grants`;
    const response = await axios.get<Grant[]>(apiUrl); // Ensure expected type
    return response.data; // Return the raw data array
};

// Function to search grants from backend API
const searchGrantsFromApi = async (query: string): Promise<Grant[]> => {
    const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;
    if (!backendUrl) {
        throw new Error("VITE_APP_BACKEND_URL is not defined in frontend/.env or Netlify.");
    }

    const apiUrl = `${backendUrl}/api/grants/search?query=${encodeURIComponent(query)}`;
    const response = await axios.get<Grant[]>(apiUrl); // Ensure expected type
    // The search endpoint currently returns { message, results }. We need results.
    // If your backend's search endpoint returns { message: string, results: Grant[] }, you'd adjust here:
    // return response.data.results;
    // For now, based on its current placeholder:
    if (Array.isArray(response.data)) { // If it directly returns the array (like /api/grants)
        return response.data;
    } else if (typeof response.data === 'object' && response.data !== null && 'results' in response.data && Array.isArray(response.data.results)) {
        return response.data.results as Grant[]; // Type assertion for safety
    } else {
        // Handle cases where the placeholder returns non-array or unexpected structure
        console.warn('Unexpected response structure from search API:', response.data);
        return [];
    }
};

export { getGrantsFromApi, searchGrantsFromApi };