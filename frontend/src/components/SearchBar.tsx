import { useState } from "react";
import { TextInput, Button } from '@mantine/core'; 


interface SearchBarProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
}

const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
    const [query, setQuery] = useState<string>("");

    const handleSearchSubmit = () => {
        onSearch(query);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    return (
        <div className="flex items-center gap-2 p-4">
            {/* Mantine Components: TextInput and Button */}
            <TextInput
                placeholder="'Education grants for nonprofits...'"
                value={query}
                onChange={(event) => setQuery(event.currentTarget.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading} 
                className="flex-grow"
            />
            <Button
                onClick={handleSearchSubmit} 
                disabled={isLoading}
                loading={isLoading}
            >
                Search
            </Button>   
        </div>
    );
}

export default SearchBar;
