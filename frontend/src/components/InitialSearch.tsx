import { Group, Title, Text, TextInput, ActionIcon, Box } from '@mantine/core';
import { IconSearch, IconArrowRight } from '@tabler/icons-react';
import { useState } from 'react';

interface InitialSearchProps {
    onSearchSubmit: (query: string) => void;
    isLoading: boolean;
}

const recommendedQueries = [
    'Grants for non-profit software developer programs',
    'Funding for local community projects',
    'Grants for environmental research',
];

const InitialSearch = ({ onSearchSubmit, isLoading }: InitialSearchProps) => {
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        if (query.trim() !== '') {
            onSearchSubmit(query);
        }
    };
    
    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 60px)'
            }}
            p="md"
        >
            <Title 
                order={1} 
                size="h1"
                mb="xs"
                ta="center"
                c="text-primary.0"
            >
                Find your GrantMatch
            </Title>
            
            <Text 
                c="text-secondary.0" 
                mb="xl" 
                ta="center"
                size="lg"
            >
                Ask detailed questions for the best recommendations
            </Text>

            <Group 
                wrap="nowrap" 
                style={{ width: '100%', maxWidth: '36rem' }}
            >
                <TextInput
                    placeholder="Find anything"
                    style={{ flexGrow: 1 }}
                    value={query}
                    onChange={(event) => setQuery(event.currentTarget.value)}
                    onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                    disabled={isLoading}
                    leftSection={<IconSearch size={16} />}
                />
                <ActionIcon
                    variant="filled"
                    size="xl"
                    color="primary-blue"
                    aria-label="Search"
                    onClick={handleSearch}
                    disabled={isLoading || query.trim() === ''}
                >
                    <IconArrowRight size={20} />
                </ActionIcon>
            </Group>

            <Box mt="xl" ta="center">
                {recommendedQueries.map((recQuery, index) => (
                    <Group 
                        key={index} 
                        gap="xs" 
                        my="sm" 
                        style={{ 
                            cursor: 'pointer',
                            justifyContent: 'center'
                        }} 
                        onClick={() => onSearchSubmit(recQuery)}
                    >
                        <IconSearch size={16} color="var(--mantine-color-text-secondary-0)" />
                        <Text c="text-secondary.0">{recQuery}</Text>
                    </Group>
                ))}
            </Box>
        </Box>
    );
};

export default InitialSearch;

// Claude edit
// import { AppShell, Burger, Group, Text, Box, Alert, ActionIcon, Tooltip } from '@mantine/core';
// import { useDisclosure } from '@mantine/hooks';
// import { IconSearch, IconStar, IconAlertCircle } from '@tabler/icons-react';

// import SearchBar from './SearchBar';
// import GrantsResults from './GrantsResults';

// import type { Grant, SimilarGrant } from '../services/grantsApi';

// interface InitialSearchProps {
//     grants: (Grant | SimilarGrant)[];
//     isLoading: boolean;
//     error: string | null;
//     searchQuery: string;
//     currentView: 'all' | 'search' | 'similar' | 'initial';
//     baseGrant: { id: number; title: string } | null;
//     onSearchSubmit: (query: string) => void;
//     onFetchAllGrants: () => void;
//     onSearchSimilarGrants: (grantId: number, grantTitle: string) => Promise<void>;
// }

// const InitialSearch = ({
//     grants, isLoading, error, searchQuery, currentView, baseGrant,
//     onSearchSubmit, onFetchAllGrants, onSearchSimilarGrants
// }: InitialSearchProps) => {
//     const [opened, { toggle }] = useDisclosure();

//     return (
//         <AppShell
//             header={{ height: 60 }}
//             navbar={{ width: 80, breakpoint: 'sm', collapsed: { mobile: !opened } }}
//             padding="md"
//         >
//             <AppShell.Header>
//                 <Group h="100%" px="lg" justify="space-between">
//                     <Group gap="md">
//                         <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
//                         {/* Logo placeholder */}
//                         <Box
//                             w={120}
//                             h={32}
//                             bg="background-light.0"
//                             style={{ 
//                                 borderRadius: 'var(--mantine-radius-md)',
//                                 display: 'flex',
//                                 alignItems: 'center',
//                                 justifyContent: 'center',
//                                 border: '1px solid var(--mantine-color-gray-2)'
//                             }}
//                         >
//                             <Text size="xs" c="text-secondary.0" fw={500}>LOGO</Text>
//                         </Box>
//                     </Group>

//                     {/* Header search bar for desktop */}
//                     <Box visibleFrom="sm">
//                         <SearchBar 
//                             onSearch={onSearchSubmit} 
//                             isLoading={isLoading}
//                             compact={true}
//                         />
//                     </Box>
//                 </Group>
//             </AppShell.Header>

//             <AppShell.Navbar p="sm" style={{ 
//                 display: 'flex', 
//                 flexDirection: 'column', 
//                 alignItems: 'center',
//                 backgroundColor: 'var(--mantine-color-background-light-0)'
//             }}>
//                 {/* Thin navbar with just icons */}
//                 <Tooltip label="Search" position="right" withArrow>
//                     <ActionIcon 
//                         variant="light" 
//                         size="lg"
//                         mb="md"
//                         onClick={onFetchAllGrants}
//                         color="primary-blue"
//                         style={{
//                             '&:hover': {
//                                 backgroundColor: 'var(--mantine-color-primary-blue-1)'
//                             }
//                         }}
//                     >
//                         <IconSearch size={20} />
//                     </ActionIcon>
//                 </Tooltip>
                
//                 <Tooltip label="Saved" position="right" withArrow>
//                     <ActionIcon 
//                         variant="light" 
//                         size="lg"
//                         disabled={true}
//                         color="primary-blue"
//                     >
//                         <IconStar size={20} />
//                     </ActionIcon>
//                 </Tooltip>
//             </AppShell.Navbar>

//             <AppShell.Main style={{ backgroundColor: 'var(--mantine-color-background-base-0)' }}>
//                 {/* Mobile search bar */}
//                 <Box hiddenFrom="sm" mb="lg">
//                     <SearchBar 
//                         onSearch={onSearchSubmit} 
//                         isLoading={isLoading} 
//                     />
//                 </Box>

//                 {/* Welcome message when no search has been made */}
//                 {currentView === 'initial' && (
//                     <Box ta="center" mt="xl" pt="xl">
//                         <Text 
//                             size="2.5rem" 
//                             fw={700} 
//                             mb="md" 
//                             c="text-primary.0"
//                             style={{ fontFamily: 'Geist Sans, sans-serif' }}
//                         >
//                             Find your GrantMatch
//                         </Text>
//                         <Text 
//                             c="text-secondary.0" 
//                             mb="xl" 
//                             size="lg"
//                         >
//                             Ask detailed questions for the best recommendations
//                         </Text>
                        
//                         {/* Suggested searches */}
//                         <Box mt="xl" pt="lg">
//                             <Text size="sm" c="text-secondary.0" mb="lg" fw={500}>Try searching for:</Text>
//                             <Box style={{ display: 'flex', flexDirection: 'column', gap: 'var(--mantine-spacing-sm)' }}>
//                                 {[
//                                     'Grants for non-profit software developer programs',
//                                     'Environmental research funding',
//                                     'Community education initiatives'
//                                 ].map((suggestion, index) => (
//                                     <Text 
//                                         key={index}
//                                         size="sm" 
//                                         c="primary-blue.3"
//                                         style={{ 
//                                             cursor: 'pointer',
//                                             padding: 'var(--mantine-spacing-xs)',
//                                             borderRadius: 'var(--mantine-radius-sm)',
//                                             transition: 'all 0.2s ease'
//                                         }}
//                                         onClick={() => onSearchSubmit(suggestion)}
//                                         className="hover:bg-primary-blue-50"
//                                     >
//                                         {suggestion}
//                                     </Text>
//                                 ))}
//                             </Box>
//                         </Box>
//                     </Box>
//                 )}

//                 {/* Context indicators */}
//                 {currentView === 'similar' && baseGrant && (
//                     <Alert mb="lg" variant="light" color="primary-blue">
//                         <Text size="sm" c="text-primary.0">
//                             Showing grants similar to: <Text span fw={600} c="primary-blue.3">{baseGrant.title}</Text>
//                         </Text>
//                     </Alert>
//                 )}

//                 {currentView === 'search' && searchQuery && (
//                     <Alert mb="lg" variant="light" color="primary-blue">
//                         <Text size="sm" c="text-primary.0">
//                             Search results for: <Text span fw={600} c="primary-blue.3">"{searchQuery}"</Text>
//                         </Text>
//                     </Alert>
//                 )}

//                 {/* Error handling */}
//                 {error && (
//                     <Alert 
//                         icon={<IconAlertCircle size={16} />} 
//                         title="Error" 
//                         color="red" 
//                         mb="lg"
//                     >
//                         {error}
//                     </Alert>
//                 )}

//                 {/* Main content */}
//                 {!error && currentView !== 'initial' && (
//                     <GrantsResults 
//                         grants={grants}
//                         loading={isLoading}
//                         view={currentView as 'all' | 'search' | 'similar'}
//                         searchQuery={searchQuery}
//                         onSearchSimilarGrants={onSearchSimilarGrants}
//                     />
//                 )}

//                 {/* Empty states */}
//                 {!isLoading && !error && grants && grants.length === 0 && currentView !== 'initial' && (
//                     <Box ta="center" my="xl" py="xl">
//                         <Text size="lg" mb="xs" c="text-primary.0" fw={600}>No results found</Text>
//                         <Text size="sm" c="text-secondary.0">Try a different search query or adjust your criteria.</Text>
//                     </Box>              
//                 )}
//             </AppShell.Main>
//         </AppShell>
//     );
// };

// export default InitialSearch;