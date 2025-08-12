import { AppShell, Burger, Group, Text, Title, NavLink, Box, Alert } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconSearch, IconStar, IconAlertCircle, IconAsterisk } from '@tabler/icons-react';
import { ButterflyIcon } from './ButterflyIcon';


// Import existing components and logic
import SearchBar from './SearchBar';
import GrantsResults from './GrantsResults';
import GrantsFilters from './GrantsFilters';
import DetailedGrant from './DetailedGrant';
import type { Grant, SimilarGrant } from '../services/grantsApi';

interface DashboardProps {
    grants: (Grant | SimilarGrant)[];
    isLoading: boolean;
    error: string | null;
    searchQuery: string;
    summarizingGrantId?: number | null;
    currentView: 'all' | 'search' | 'similar' | 'initial' | 'detail';
    onSearchSubmit: (query: string) => void;
    onFetchAllGrants: () => void;
    onSearchSimilarGrants: (grantId: number, grantTitle: string) => Promise<void>;
    onSummarize: (grantId: number) => void;
    onResetToInitial: () => void;
    onSelectGrant: (grantId: number) => void;
    selectedGrant?: Grant | SimilarGrant | null;
    onBackToResults: () => void;
    onSummarizeForDetailedView: (grantId: number) => void; // New prop
    detailedGrantSummary: string | null; // New prop
}

const Dashboard = ({
    grants, isLoading, error, searchQuery, summarizingGrantId, currentView,
    onSearchSubmit, onFetchAllGrants, onSearchSimilarGrants, onSummarize, onResetToInitial, onSelectGrant,
    selectedGrant, onBackToResults, onSummarizeForDetailedView, detailedGrantSummary
}: DashboardProps) => {
    const [opened, { toggle }] = useDisclosure();

    // Determine the content to render inside the main section
    const renderMainContent = () => {
        if (currentView === 'detail' && selectedGrant) {
            return (
                <DetailedGrant
                    grant={selectedGrant}
                    onBackToResults={onBackToResults}
                    isBeingSummarized={summarizingGrantId === selectedGrant.id}
                    onSummarizeForDetailedView={onSummarizeForDetailedView} // Pass down
                    detailedGrantSummary={detailedGrantSummary} // Pass down
                />
            );
        }

        // Display alerts and results based on search or 'all' view
        const showSearchAlert = currentView === 'search' && searchQuery && !error;
        const showGrantsResults = !error && currentView !== 'initial' && grants.length > 0;
        const showEmptyState = !isLoading && !error && grants.length === 0 && currentView !== 'initial';

        return (
            <Box>
                {showSearchAlert && (
                    <Alert 
                        mb="sm" 
                        variant="light" 
                        color="primary-blue.1" 
                        mx="sm"
                    >

                        <Group gap="sm" wrap="nowrap">
                            <IconAsterisk size={16}/>
                            <Text size="sm" c="primary-blue">
                                Search results for: <Text span fw={500} c="primary-blue">"{searchQuery}"</Text>
                            </Text>
                        </Group>
                    </Alert>
                )}

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

                {showGrantsResults && (
                    <Box px="sm">
                        <GrantsResults
                            grants={grants}
                            loading={isLoading}
                            summarizingGrantId={summarizingGrantId}
                            view={currentView as 'all' | 'search' | 'similar'}
                            searchQuery={searchQuery}
                            onSearchSimilarGrants={onSearchSimilarGrants}
                            onSummarize={onSummarize}
                            onSelectGrant={onSelectGrant}
                        />
                    </Box>
                )}

                {showEmptyState && (
                    <Box ta="center" my="xl" c="text-secondary.0" mx="sm">
                        <Text size="lg" mb="xs" c="text-primary.0" fw={600}>
                            {currentView === 'all' ? 'No grants found' : 'No results found'}
                        </Text>
                        <Text size="sm">
                            {currentView === 'all' ? 'Try adjusting your filters or search criteria.' : 'Try a different search query or browse all grants.'}
                        </Text>
                    </Box>
                )}
            </Box>
        );
    };
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
                        <ButterflyIcon size={32} />
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
                <Box mb="md">
                    <NavLink
                        label="Search"
                        leftSection={<IconSearch size={16}/>}
                        active={currentView === 'all' || currentView === 'search'}
                        onClick={onFetchAllGrants}
                    />
                    <NavLink
                        label="Saved"
                        leftSection={<IconStar size={16}/>}
                        disabled={true}
                    />
                </Box>
                <Box>
                    <Text fw={500} mb="xs" size="sm" c="text-secondary.0">Filters</Text>
                    <GrantsFilters />
                </Box>
            </AppShell.Navbar>

            <AppShell.Main>
                <Box mb="md" px="sm">
                    <SearchBar
                        onSearch={onSearchSubmit}
                        isLoading={isLoading}
                    />
                </Box>
                {renderMainContent()}
            </AppShell.Main>
        </AppShell>
    );
};

export default Dashboard;
