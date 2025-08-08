// import { Fragment } from 'react';
import { AppShell, Burger, Group, Text, Title, NavLink, Box, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconStar, IconAlertCircle } from '@tabler/icons-react';

// Import existing components and logic
import SearchBar from './SearchBar';
import GrantsResults from './GrantsResults';
import GrantsFilters from './GrantsFilters';
import type { Grant, SimilarGrant } from '../services/grantsApi';

interface DashboardProps {
    grants: (Grant | SimilarGrant)[];
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    summarizingGrantId?: number | null;
    currentView: 'all' | 'search' | 'similar' | 'initial';
    onSearchSubmit: (query: string) => void;
    onFetchAllGrants: () => void;
    onSearchSimilarGrants: (grantId: number, grantTitle: string) => Promise<void>;
    onSummarize: (grantId: number) => void;
    onResetToInitial: () => void;
}

const Dashboard = ({
    grants, isLoading, error, searchQuery, summarizingGrantId, currentView,
    onSearchSubmit, onFetchAllGrants, onSearchSimilarGrants, onSummarize, onResetToInitial
}: DashboardProps) => {
    const [opened, { toggle }] = useDisclosure();

    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="xs"
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
                {/* Search bar */}
                <Box mb="md" px="sm">
                    <SearchBar 
                        onSearch={onSearchSubmit} 
                        isLoading={isLoading} 
                    />
                </Box>
                
                {currentView === 'search' && searchQuery && (
                    <Alert mb="md" variant="light" color="primary-blue" mx="sm">
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
                        mx="sm"
                    >
                        {error}
                    </Alert>
                )}

                {/* Main content */}
                {!error && currentView !== 'initial' && (
                    <Box px="sm">
                        <GrantsResults 
                            grants={grants}
                            loading={isLoading}
                            summarizingGrantId={summarizingGrantId}
                            view={currentView as 'all' | 'search' | 'similar'}
                            searchQuery={searchQuery}
                            onSearchSimilarGrants={onSearchSimilarGrants}
                            onSummarize={onSummarize}
                        />
                    </Box>
                )}

                {/* Empty state for all grants view */}
                {!isLoading && !error && grants && grants.length === 0 && currentView === 'all' && (
                    <Box ta="center" my="xl" c="text-secondary.0" mx="sm">
                        <Text size="lg" mb="xs" c="text-primary.0" fw={600}>No grants found</Text>
                        <Text size="sm">Try adjusting your filters or search criteria.</Text>
                    </Box>              
                )}

                {/* Empty state for search */}
                {!isLoading && !error && grants && grants.length === 0 && currentView === 'search' && (
                    <Box ta="center" my="xl" c="text-secondary.0" mx="sm">
                        <Text size="lg" mb="xs" c="text-primary.0" fw={600}>No results found</Text>
                        <Text size="sm">Try a different search query or browse all grants.</Text>
                    </Box>              
                )}
            </AppShell.Main>
        </AppShell>
    )
};

export default Dashboard;



