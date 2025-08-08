import { useState } from "react";
import { TextInput, ActionIcon, Group } from '@mantine/core'; 
import { IconArrowRight, IconSearch } from '@tabler/icons-react';


interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
    // compact?: boolean;
}

const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
    const [query, setQuery] = useState<string>("");
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const onSearchSubmit = () => {
        onSearch(query);
    };

    // The button should be visually disabled when the query is empty or loading
    const isButtonDisabled = isLoading || query.trim() === '';

    const handleSearchSubmit = () => {
        // Perform a check here to prevent an empty search
        if (!isButtonDisabled) {
            onSearch(query);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            onSearchSubmit();
        }
    };
    
    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        setIsFocused(false);
    };

    return (
        <Group wrap="nowrap" style={{ width: '100%'}}>
            <TextInput
                placeholder={isFocused ? "" : "Find anything"}
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={isLoading} 
                style={{ flexGrow: 1 }}
                size="md"
                leftSection={<IconSearch size={16} />}
            />
            <ActionIcon
                onClick={handleSearchSubmit}
                loading={isLoading}
                size="xl"
                variant="filled"
                color="primary-blue"
                aria-label="Search"
                style={{
                    cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
                    opacity: isButtonDisabled ? 0.5 : 1,
                    pointerEvents: isButtonDisabled ? 'none' : 'auto',
                }}
            >
                <IconArrowRight size={20} />
            </ActionIcon>
        </Group>
        // </Box>
    );
}

export default SearchBar;
