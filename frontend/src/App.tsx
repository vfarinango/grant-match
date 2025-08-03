// import axios from 'axios';
// import { AgGridReact } from '@ag-grid-community/react'; 
// import { ModuleRegistry } from '@ag-grid-community/core';
// import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
// import 'ag-grid-community/styles/ag-grid.css'; 
// import 'ag-grid-community/styles/ag-theme-quartz.css'; 
import { useState, useEffect } from 'react';
import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

import SearchBar from './components/SearchBar';
import GrantsResults from './components/GrantsResults';
import { getGrantsFromApi, searchGrantsFromApi } from './services/grantsApi'; 
import type { Grant } from './services/grantsApi';
import './App.css';



function App() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(''); // Track search query

  console.log('Backend URL:', import.meta.env.VITE_APP_BACKEND_URL);

  const fetchGrants = async (query?: string) => {
    setIsLoading(true);
    setError(null);
    setSearchQuery(query || ''); // Update query state

    try {
      if (query) {
        const searchResponse = await searchGrantsFromApi(query);
        setGrants(searchResponse?.results || []);
        console.log("Search results: ", searchResponse);
      } else {
        const fetchedData = await getGrantsFromApi();
        setGrants(fetchedData || []);
        console.log("All grants: ", fetchedData);
      } 
    } catch (err) {
      console.error("API call failed:", err);
      setError("An unknown error occurred while fetching grants.");
      setGrants([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load of all grants
  useEffect(() => {
    fetchGrants(); 
  }, []);

  

  return (
    <>
      <div className="container mx-auto p-4">
          <h1 className="text-4xl font-bold text-center mb-6">GrantMatch App</h1>

          <SearchBar 
            onSearch={fetchGrants} 
            isLoading={isLoading} 
          />

          {error && (
            <Alert 
              icon={<IconAlertCircle size={16} />} 
              title="Error" 
              color="red" 
              className="my-4"
            >
              {error}
            </Alert>
          )}

          {!error && (
            <GrantsResults 
              grants={grants}
              loading={isLoading}
              searchQuery={searchQuery}
            />
          )}

          {!isLoading && !error && grants && grants.length === 0 && searchQuery === '' && (
            <div className="text-center my-8 text-gray-500">
              <p className="text-lg mb-2">Welcome to GrantMatch!</p>
              <p>Search for grants using natural language.</p>
              <p className="text-sm mt-2 italic">
                Example: "Grants for environmental education in urban areas"
              </p>
            </div>              
          )}
          {/* {isLoading && (
                <p className="text-center mt-4 text-blue-600">Loading grants...</p>
            )}
            {error && (
                <p className="text-center mt-4 text-red-600">Error: {error}</p>
            )}

            {!isLoading && !error && grants.length === 0 && (
                <p className="text-center mt-4 text-gray-500">No grants found. Database might be empty or your search yielded no results.</p>
            )}

            <GrantsResults 
              grants={grants}
              loading={isLoading}
              searchQuery={searchQuery}
              isSearchResults={!!searchResults}
            /> */}
      </div>
    </>
  );
}

export default App;
