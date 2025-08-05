// import axios from 'axios';
// import { AgGridReact } from '@ag-grid-community/react'; 
// import { ModuleRegistry } from '@ag-grid-community/core';
// import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
// import 'ag-grid-community/styles/ag-grid.css'; 
// import 'ag-grid-community/styles/ag-theme-quartz.css'; 
import { useState, useEffect } from 'react';
import { Text, Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

import SearchBar from './components/SearchBar';
import GrantsResults from './components/GrantsResults';
import { getGrantsFromApi, searchGrantsFromApi, searchSimilarGrantsFromApi} from './services/grantsApi'; 
import type { Grant, SimilarGrant } from './services/grantsApi'; // SearchResponse,  SimilarSearchResponse
import './App.css';

// Use a union type for the grants state to handle both types
type DisplayedGrant = Grant | SimilarGrant;

function App() {
  const [grants, setGrants] = useState<DisplayedGrant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(''); // Track search query
  
  // Similar search specific state:
  const [currentView, setCurrentView] = useState<'all' | 'search' | 'similar'>('all');
  const [baseGrant, setBaseGrant] = useState<{ id: number; title: string } | null>(null);

  // const isSimilarGrant = (grant: Grant | SimilarGrant): grant is SimilarGrant => {
  //   return 'similarity_score' in grant && typeof grant.similarity_score === 'number';
  // };

  const handleSearchSubmit = (query: string) => {
    fetchGrants(query);
  };

  const handleFetchAllGrants = () => {
    fetchGrants();
  };

  const fetchGrants = async (query?: string) => {
    setIsLoading(true);
    setError(null);
    setSearchQuery(query || ''); // Update query state
    setCurrentView(query ? 'search' : 'all');
    setBaseGrant(null); // set base grant when doing regular search

    try {
      if (query) {
        const searchResponse = await searchGrantsFromApi(query);
        setGrants(searchResponse.results);
        console.log("Search results: ", searchResponse);
      } else {
        const fetchedData = await getGrantsFromApi();
        setGrants(fetchedData);
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

  const handleSearchSimilarGrants = async (grantId: number, grantTitle: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentView('similar');
    setSearchQuery('');

    // Find the grant title from the currently displayed grants
    const grant = grants.find(g => g.id === grantId);
    if (grant) {
        setBaseGrant({ id: grantId, title: grantTitle });
    } else {
        setBaseGrant(null);
    }

    try {
      const similarSearchResponse = await searchSimilarGrantsFromApi(grantId);
      setGrants(similarSearchResponse.results);
      console.log("Similar grants: ", similarSearchResponse); // debug log
    } catch (err) {
      console.error("Similar search failed:", err);
      setError("An error occurred while finding similar grants.");
      setGrants([]);  
    } finally {
      setIsLoading(false);
    }
  };



  // Initial load of all grants
  useEffect(() => {
    handleFetchAllGrants();
  }, []);


  return (
    <>
      <div className="container mx-auto p-4">
          <h1 className="text-4xl font-bold text-center mb-6">GrantMatch App</h1>

          <SearchBar 
            onSearch={handleSearchSubmit} 
            isLoading={isLoading} 
          />

          {currentView === 'similar' && baseGrant && (
            <Text size="lg" className="mt-4 text-center">
              Showing grants similar to: <span className="font-bold">{baseGrant.title}</span>
            </Text>
          )}

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
              onSearchSimilar={handleSearchSimilarGrants}
              // onSummarize={handleSummarize}
              view={currentView}
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
      </div>
    </>
  );
}

export default App;
