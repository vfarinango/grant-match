// import { useState } from 'react'
// import axios from 'axios';
// import { AgGridReact } from '@ag-grid-community/react'; 
// import { ModuleRegistry } from '@ag-grid-community/core';
// import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
// import 'ag-grid-community/styles/ag-grid.css'; 
// import 'ag-grid-community/styles/ag-theme-quartz.css'; 
import SearchBar from './components/SearchBar';
import './App.css';

function App() {
  const handleSearchSubmit = (query: string) => {
    console.log("Search query received from SearchBar:", query);
  };

  return (
    <>
      <div className="container mx-auto p-4">
          <h1 className="text-4xl font-bold text-center mb-6">GrantMatch App</h1>

          {/* Render the SearchBar component */}
          <SearchBar
              onSearch={handleSearchSubmit}
              // For now, isLoading is not explicitly passed, it will default to false in SearchBar
          />
      </div>
    </>
  );
}

export default App;
