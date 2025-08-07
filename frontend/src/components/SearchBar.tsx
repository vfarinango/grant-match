import { useState } from "react";
import { TextInput, ActionIcon, Group } from '@mantine/core'; 
import { IconArrowRight } from '@tabler/icons-react';


interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
    compact?: boolean;
}

const SearchBar = ({ onSearch, isLoading, compact = false }: SearchBarProps) => {
    const [query, setQuery] = useState<string>("");
    const [isFocused, setIsFocused] = useState<boolean>(false);

    const onSearchSubmit = () => {
        onSearch(query);
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
        <Group 
            wrap="nowrap" 
            style={{ 
                width: '100%'}}
        >

            <TextInput
                placeholder={isFocused ? "" :compact ? "Search" : "Search grants"}
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                disabled={isLoading} 
                style={{ flexGrow: 1 }}
                size={compact ? "sm" : "md"}
                styles={compact ? {
                    input: {
                        minHeight: '32px',
                    }
                } : undefined}
            />
            <ActionIcon
                onClick={onSearchSubmit}
                disabled={isLoading || query.trim() === ''}
                loading={isLoading}
                size="xl"
                variant="filled"
                color="primary-blue"
                aria-label="Search"
            >
                <IconArrowRight size={20} />
            </ActionIcon>
        </Group>
        // </Box>
    );
}

export default SearchBar;
