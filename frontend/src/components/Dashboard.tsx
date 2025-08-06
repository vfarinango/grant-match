import { AppShell, Burger, Group, Text, Title, NavLink, Box, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHome2, IconSearch, IconStar, IconAlertCircle } from '@tabler/icons-react';

// Import existing components and logic
import SearchBar from './SearchBar';
import GrantsResults from './GrantsResults';
import GrantsFilters from './GrantsFilters';

// import { useState, useEffect } from 'react';
import type { Grant, SimilarGrant } from '../services/grantsApi';

interface DashboardProps {
    grants: (Grant | SimilarGrant)[];
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    currentView: 'all' | 'search' | 'similar';
    baseGrant: { id: number; title: string } | null;
    onSearchSubmit: (query: string) => void;
    onFetchAllGrants: () => void;
    onSearchSimilarGrants: (grantId: number, grantTitle: string) => Promise<void>;
}

const Dashboard = ({
    grants, isLoading, error, searchQuery, currentView, baseGrant,
    onSearchSubmit, onFetchAllGrants, onSearchSimilarGrants
}: DashboardProps) => {
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Header>
                <Group h="100%" px="md" justify="space-between">
                    <Group>
                        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
                        <Title order={2}>GrantMatch</Title>
                    </Group>

                    <Box hiddenFrom="sm">
                        <NavLink 
                            label="Home" 
                            leftSection={<IconHome2 size={16}/>} 
                            active={currentView === 'all'}
                            onClick={onFetchAllGrants} 
                        />
                        <NavLink 
                            label="Saved" 
                            leftSection={<IconStar size={16}/>} 
                        />
                    </Box>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                <Text fw={500} mb="xs">Filters</Text>
                <GrantsFilters />
                
                <NavLink 
                    label="All Grants"
                    leftSection={<IconHome2 size={16}/>}
                    active={currentView === 'all'}
                    onClick={() => onFetchAllGrants()} 
                />
                <NavLink 
                    label="Search" 
                    leftSection={<IconSearch size={16}/>} 
                    active={currentView === 'search'} 
                />
            </AppShell.Navbar>

            <AppShell.Main>
                {/* Existing conditional rendering logic goes here */}
                <div className="flex gap-2 mb-4">
                    <SearchBar 
                        onSearch={onSearchSubmit} 
                        isLoading={isLoading} 
                    />
                </div>
                
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
                    view={currentView}
                    searchQuery={searchQuery}
                    onSearchSimilarGrants={onSearchSimilarGrants}
                    // onSummarize={handleSummarize}
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
            </AppShell.Main>
        </AppShell>
    )
};

export default Dashboard;