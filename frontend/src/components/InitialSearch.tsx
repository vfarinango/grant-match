// src/components/InitialSearch.tsx
import { Group, Title, Text, TextInput, ActionIcon } from '@mantine/core';
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
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <Title order={1} className="text-4xl font-bold mb-2 text-center"
                style={{ fontFamily: 'Geist Sans, sans-serif' }}>
                Find your GrantMatch
            </Title>
            <Text className="text-gray-600 mb-8 text-center"
                style={{ fontFamily: 'Geist Sans, sans-serif' }}>
                Ask detailed questions for the best recommendations
            </Text>

            <Group wrap="nowrap" className="w-full max-w-xl">
                <TextInput
                    placeholder="Find anything"
                    className="flex-grow"
                    value={query}
                    onChange={(event) => setQuery(event.currentTarget.value)}
                    onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                    disabled={isLoading}
                    leftSection={<IconSearch size={16} />}
                />
                <ActionIcon
                    variant="filled"
                    size="xl"
                    aria-label="Search"
                    onClick={handleSearch}
                    disabled={isLoading || query.trim() === ''}
                >
                    <IconArrowRight size={20} />
                </ActionIcon>
            </Group>

            <div className="mt-8 text-center">
                {recommendedQueries.map((recQuery, index) => (
                    <Group key={index} gap="xs" className="my-2 cursor-pointer" onClick={() => onSearchSubmit(recQuery)}>
                        <IconSearch size={16} className="text-gray-400" />
                        <Text className="text-gray-600">{recQuery}</Text>
                    </Group>
                ))}
            </div>
        </div>
    );
};

export default InitialSearch;