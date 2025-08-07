/// Dashboard.tsx code:
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
    currentView: 'all' | 'search' | 'similar' | 'initial';
    baseGrant: { id: number; title: string } | null;
    onSearchSubmit: (query: string) => void;
    onFetchAllGrants: () => void;
    onSearchSimilarGrants: (grantId: number, grantTitle: string) => Promise<void>;
    onResetToInitial: () => void;
}

const Dashboard = ({
    grants, isLoading, error, searchQuery, currentView, baseGrant,
    onSearchSubmit, onFetchAllGrants, onSearchSimilarGrants, onResetToInitial
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
                        <Title 
                            order={2} 
                            c="text-primary.0"
                            style={{ cursor: 'pointer' }}
                            onClick={onResetToInitial}
                        >
                            GrantMatch
                        </Title>
                    </Group>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                {/* Navigation Links */}
                <Box mb="md">
                    <NavLink 
                        label="Home"
                        leftSection={<IconHome2 size={16}/>}
                        active={false}
                        onClick={onResetToInitial}
                    />
                    <NavLink 
                        label="Search"
                        leftSection={<IconSearch size={16}/>}
                        active={currentView === 'all'}
                        onClick={onFetchAllGrants}
                    />
                    <NavLink 
                        label="Saved" 
                        leftSection={<IconStar size={16}/>}
                        disabled={true}
                    />
                </Box>

                {/* Filters Section */}
                <Box>
                    <Text fw={500} mb="xs" size="sm" c="text-secondary.0">Filters</Text>
                    <GrantsFilters />
                </Box>
            </AppShell.Navbar>

            <AppShell.Main>
                {/* Mobile search bar */}
                <Box hiddenFrom="sm" mb="md">
                    <SearchBar 
                        onSearch={onSearchSubmit} 
                        isLoading={isLoading} 
                    />
                </Box>

                {/* Desktop search bar */}
                <Box visibleFrom="sm" mb="md">
                    <SearchBar 
                        onSearch={onSearchSubmit} 
                        isLoading={isLoading} 
                    />
                </Box>
                
                {currentView === 'similar' && baseGrant && (
                    <Alert mb="md" variant="light" color="primary-blue">
                        <Text size="sm" c="text-primary.0">
                            Showing grants similar to: <Text span fw={500} c="primary-blue.3">{baseGrant.title}</Text>
                        </Text>
                    </Alert>
                )}

                {currentView === 'search' && searchQuery && (
                    <Alert mb="md" variant="light" color="primary-blue">
                        <Text size="sm" c="text-primary.0">
                            Search results for: <Text span fw={500} c="primary-blue.3">"{searchQuery}"</Text>
                        </Text>
                    </Alert>
                )}

                {/* Error handling */}
                {error && (
                    <Alert 
                        icon={<IconAlertCircle size={16} />} 
                        title="Error" 
                        color="red" 
                        mb="md"
                    >
                        {error}
                    </Alert>
                )}

                {/* Main content */}
                {!error && currentView !== 'initial' && (
                    <GrantsResults 
                        grants={grants}
                        loading={isLoading}
                        view={currentView as 'all' | 'search' | 'similar'}
                        searchQuery={searchQuery}
                        onSearchSimilarGrants={onSearchSimilarGrants}
                    />
                )}

                {/* Empty state for all grants view */}
                {!isLoading && !error && grants && grants.length === 0 && currentView === 'all' && (
                    <Box ta="center" my="xl" c="text-secondary.0">
                        <Text size="lg" mb="xs" c="text-primary.0" fw={600}>No grants found</Text>
                        <Text size="sm">Try adjusting your filters or search criteria.</Text>
                    </Box>              
                )}

                {/* Empty state for search */}
                {!isLoading && !error && grants && grants.length === 0 && currentView === 'search' && (
                    <Box ta="center" my="xl" c="text-secondary.0">
                        <Text size="lg" mb="xs" c="text-primary.0" fw={600}>No results found</Text>
                        <Text size="sm">Try a different search query or browse all grants.</Text>
                    </Box>              
                )}
            </AppShell.Main>
        </AppShell>
    )
};

export default Dashboard;



