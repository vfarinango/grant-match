// import axios from 'axios';
// import { AgGridReact } from '@ag-grid-community/react'; 
// import { ModuleRegistry } from '@ag-grid-community/core';
// import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
// import 'ag-grid-community/styles/ag-grid.css'; 
// import 'ag-grid-community/styles/ag-theme-quartz.css'; 

// import '@mantine/core/styles.css';

import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import { getGrantsFromApi, searchGrantsFromApi, searchSimilarGrantsFromApi, getGrantSummaryFromApi} from './services/grantsApi'; 
import type { Grant, SimilarGrant } from './services/grantsApi'; 

import { theme } from './theme';
import Dashboard from './components/Dashboard';
import InitialSearch from './components/InitialSearch';
import SimilarGrantsModal from './components/SimilarGrantsModal';
// import './App.css';


type DisplayedGrant = Grant | SimilarGrant;

function App() {
  const [grants, setGrants] = useState<DisplayedGrant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(''); // Track search query
  const [currentView, setCurrentView] = useState<'all' | 'search' |'initial' | 'detail'>('initial'); 
  
  // Similar grants modal state
  const [similarGrants, setSimilarGrants] = useState<SimilarGrant[]>([]);
  const [similarModalOpened, setSimilarModalOpened] = useState<boolean>(false);
  const [similarLoading, setSimilarLoading] = useState<boolean>(false);
  const [baseGrant, setBaseGrant] = useState<{ id: number; title: string } | null>(null); // Similar search specific state:
  
  // Summarize grant loading state and store previous view
  const [summarizingGrantId, setSummarizingGrantId] = useState<number | null>(null);
  const [previousView, setPreviousView] = useState<'all' | 'search' | 'initial' | 'detail'>('initial');

  // Detailed grants state
  const [selectedGrantId, setSelectedGrantId] = useState<number | null>(null);
  const [detailedGrantSummary, setDetailedGrantSummary] = useState<string | null>(null);


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
      setSimilarLoading(true);
      setSimilarModalOpened(true);
      setBaseGrant({ id: grantId, title: grantTitle });
      setError(null);
      setSimilarGrants([]); 

      try {
          const similarSearchResponse = await searchSimilarGrantsFromApi(grantId);
          setSimilarGrants(similarSearchResponse.results);
          console.log("Similar grants: ", similarSearchResponse); // debug log
      } catch (err) {
          console.error("Similar search failed:", err);
          setError("An error occurred while finding similar grants.");
          setSimilarGrants([]);  
      } finally {
          setSimilarLoading(false);
      }
  };

  const handleSummarize = async (grantId: number) => {
    console.log('SETTING summarizingGrantId to:', grantId);
    setSummarizingGrantId(grantId);
    setError(null);
    const startTime = Date.now();

    try {
        const summary = await getGrantSummaryFromApi(grantId);
        console.log('Received summary:', summary); // debug log
        const elapsed = Date.now() - startTime;
        
        if (elapsed < 300) {
          await new Promise(resolve => setTimeout(resolve, 300 - elapsed));
        }
        // Find the grant to update and add the summary
        setGrants(currentGrants => currentGrants.map(grant =>
            grant.id === grantId ? { ...grant, summary } : grant
        ));

      setSimilarGrants(currentSimilarGrants => currentSimilarGrants.map(grant =>
          grant.id === grantId ? { ...grant, summary } : grant
      ));
        console.log('Grant updated with summary:', summary); // debug log
    } catch (err) {
        console.error("Summarize failed:", err);
        setError("An error occurred while generating the summary.");
    } finally {
        console.log('CLEARING summarizingGrantId');
        setSummarizingGrantId(null);
    }
  };


  const onSelectGrant = (grantId: number) => {
    setSelectedGrantId(grantId);
    setPreviousView(currentView);
    setCurrentView('detail');
    setSimilarModalOpened(false);
    setDetailedGrantSummary(null);
  };

  const onBackToResults = () => {
    setSelectedGrantId(null);
    setCurrentView(previousView);
  };

  const onCloseSimilarModal = () => {
    setSimilarModalOpened(false);
    setSimilarGrants([]);
    setBaseGrant(null);
  };



  // Reset to initial view (for "Home" navigation)
  const onResetToInitial = () => {
    setCurrentView('initial');
    setGrants([]);
    setSearchQuery('');
    setBaseGrant(null);
    setError(null);
  };


    // Find the selected grant for the detail view
  const selectedGrant = grants.find(g => g.id === selectedGrantId);

  return (
    <MantineProvider theme={theme}>
        {/* Conditional to check if view is Search */}
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
                summarizingGrantId={summarizingGrantId}
                currentView={currentView}
                onSearchSubmit={onSearchSubmit}
                onFetchAllGrants={onFetchAllGrants}
                onSearchSimilarGrants={onSearchSimilarGrants}
                onSummarize={handleSummarize}
                onResetToInitial={onResetToInitial}
                onSelectGrant={onSelectGrant}
                selectedGrant={selectedGrant} 
                onBackToResults={onBackToResults} 
            />
        )}

        {/* Similar Grants Modal */}
        <SimilarGrantsModal
          opened={similarModalOpened}
          onClose={onCloseSimilarModal}
          similarGrants={similarGrants}
          loading={similarLoading}
          baseGrant={baseGrant}
          onSearchSimilarGrants={onSearchSimilarGrants}
          onSummarize={handleSummarize}
          onSelectGrant={onSelectGrant} 
          summarizingGrantId={summarizingGrantId}
        />
    </MantineProvider>
  );
}

export default App;

