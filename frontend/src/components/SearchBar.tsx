import { useState } from "react";
import { TextInput, Button } from '@mantine/core'; 


interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
}

const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
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
            <TextInput
                placeholder="'Grants for environmental protection in urban areas...'"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading} 
                className="flex-grow"
            />
            <Button
                onClick={onSearchSubmit} 
                disabled={isLoading}
                loading={isLoading}
            >
                Search
            </Button>   
        </div>
    );
}

export default SearchBar;
