// import axios from 'axios';
// import { AgGridReact } from '@ag-grid-community/react'; 
// import { ModuleRegistry } from '@ag-grid-community/core';
// import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
// import 'ag-grid-community/styles/ag-grid.css'; 
// import 'ag-grid-community/styles/ag-theme-quartz.css'; 

import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { getGrantsFromApi, searchGrantsFromApi, searchSimilarGrantsFromApi} from './services/grantsApi'; 
import type { Grant, SimilarGrant } from './services/grantsApi'; 

import { theme } from './theme';
import Dashboard from './components/Dashboard';
import InitialSearch from './components/InitialSearch';
import './App.css';


type DisplayedGrant = Grant | SimilarGrant;

function App() {
  const [grants, setGrants] = useState<DisplayedGrant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(''); // Track search query
  const [currentView, setCurrentView] = useState<'all' | 'search' | 'similar' | 'initial'>('initial'); // Similar search specific state
  const [baseGrant, setBaseGrant] = useState<{ id: number; title: string } | null>(null); // Similar search specific state:

  
  // API handlers
  const onSearchSubmit = (query: string) => {
    fetchGrants(query);
  };

  const onFetchAllGrants = () => {
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

const onSearchSimilarGrants = async (grantId: number, grantTitle: string) => {
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

  // Reset to initial view (for "Home" navigation)
  const onResetToInitial = () => {
    setCurrentView('initial');
    setGrants([]);
    setSearchQuery('');
    setBaseGrant(null);
    setError(null);
  };

  return (
    <MantineProvider theme={theme}>
      {currentView === 'initial' ? (
          <InitialSearch 
            onSearchSubmit={onSearchSubmit} 
            isLoading={isLoading} 
          />
      ) : (
          <Dashboard
              grants={grants}
              isLoading={isLoading}
              error={error}
              searchQuery={searchQuery}
              currentView={currentView}
              baseGrant={baseGrant}
              onSearchSubmit={onSearchSubmit}
              onFetchAllGrants={onFetchAllGrants}
              onSearchSimilarGrants={onSearchSimilarGrants}
              onResetToInitial={onResetToInitial}
          />
      )}
    </MantineProvider>
  );
}

export default App;

