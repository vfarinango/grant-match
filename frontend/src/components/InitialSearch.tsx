import { Group, Title, Text, Box } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import SearchBar from './SearchBar';

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
    return (
        <Box
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 50px)'
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

            {/* Reusing the SearchBar component here */}
            <Box style={{ width: '100%', maxWidth: '36rem' }}>
                <SearchBar
                    onSearch={onSearchSubmit}
                    isLoading={isLoading}
                />
            </Box>

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

