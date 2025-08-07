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

    const onSearchSubmit = () => {
        onSearch(query);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            onSearchSubmit();
        }
    };

    return (
        <div className="flex items-center gap-2 p-4">
            {/* Mantine Components: TextInput and Button */}
            <Group wrap="nowrap" className="w-full max-w-xl">
                <TextInput
                    placeholder={compact ? "Search grants..." : "'Grants for environmental protection in urban areas...'"}
                    value={query}
                    onChange={(event) => setQuery(event.currentTarget.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading} 
                    className="flex-grow"
                    size={compact ? "sm" : "md"}
                    styles={compact ? {
                        input: {
                            minHeight: '32px',
                        }
                    } : undefined}
                />
                {/* <Button
                    onClick={onSearchSubmit} 
                    disabled={isLoading}
                    loading={isLoading}
                    size={compact ? "sm" : "md"}
                    variant={compact ? "light" : "filled"}
                >
                    Search
                </Button>    */}
                <ActionIcon
                    onClick={onSearchSubmit}
                    disabled={isLoading || query.trim() === ''}
                    loading={isLoading}
                    size="xl"
                    variant="filled"
                    aria-label="Search"
                >
                    <IconArrowRight size={20} />
                </ActionIcon>

            </Group>
        </div>
    );
}

export default SearchBar;
