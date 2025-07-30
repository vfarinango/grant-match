import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { AgGridReact } from '@ag-grid-community/react'; 
// import { ModuleRegistry } from '@ag-grid-community/core';
// import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
// import 'ag-grid-community/styles/ag-grid.css'; 
// import 'ag-grid-community/styles/ag-theme-quartz.css'; 
import SearchBar from './components/SearchBar';
import GrantsResults from './components/GrantsResults';
import { getGrantsFromApi, searchGrantsFromApi } from './services/grantsApi'; 
import './App.css';

interface Grant {
    id: number;
    title: string;
    description: string;
    deadline?: string;
    funding_amount?: number;
    source?: string;
    source_url?: string;
    focus_areas?: string[];
    posted_date?: string;
    created_at?: string;
}


function App() {
  const [grants, setGrants] = useState<Grant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(''); // Track search query


  const fetchGrants = async (query?: string) => {
    setIsLoading(true);
    setError(null);
    setSearchQuery(query || ''); // Update query state

    try{
      let fetchedData: Grant[];
      if (query) {
        fetchedData = await searchGrantsFromApi(query);
      } else {
        fetchedData = await getGrantsFromApi();
      }
      setGrants(fetchedData);
      console.log("Fetched grants:", fetchedData);
    } catch (err: any) {
      console.error("Error fetching grants:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching grants.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrants(); // Initial load of all grants
  }, []);

  return (
    <>
      <div className="container mx-auto p-4">
          <h1 className="text-4xl font-bold text-center mb-6">GrantMatch App</h1>

          <SearchBar onSearch={fetchGrants} isLoading={isLoading} />
          
          {isLoading && (
                <p className="text-center mt-4 text-blue-600">Loading grants...</p>
            )}
            {error && (
                <p className="text-center mt-4 text-red-600">Error: {error}</p>
            )}

            {/* JSON results*/}

            {/* {!isLoading && !error && grants.length > 0 && (
                <div>
                    <h2 className="text-2xl font-semibold mt-8 mb-4">Available Grants:</h2>
                    <div style={{ height: '400px', overflowY: 'auto', border: '1px solid #ccc' }}>
                        <pre>{JSON.stringify(grants, null, 2)}</pre>
                    </div>
                </div>
            )} */}
            {!isLoading && !error && grants.length === 0 && (
                <p className="text-center mt-4 text-gray-500">No grants found. Database might be empty or your search yielded no results.</p>
            )}

            <GrantsResults 
              grants={grants}
              loading={isLoading}
              searchQuery={searchQuery}
             />
            

      </div>
    </>
  );
}

export default App;
