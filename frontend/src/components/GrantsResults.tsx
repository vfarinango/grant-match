import { Text, Stack } from '@mantine/core';
import type { Grant } from "../services/grantsApi";
import GrantComponent from './Grant';

interface GrantsResultsProps {
  grants: Grant[];
  loading: boolean;
  searchQuery: string;
}

const GrantsResults = ({ grants, loading, searchQuery }: GrantsResultsProps) => {

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!grants || grants.length === 0 ) {
      return (
        <div className="text-center py-12">
          <Text size="lg" c="dimmed">
            {searchQuery ? `No grants found for "${searchQuery}"` : 'No grants available'}
          </Text>
          {searchQuery && (
            <Text size="sm" c="dimmed" className="mt-2">
              Try different keywords or broader search terms
            </Text>        
          )}
        </div>
    );
  }
  


  return (
      <Stack gap="md" className="mt-6">
        <Text size="sm" c="dimmed">
          {grants.length} grant{grants.length !== 1 ? 's' : ''} found
          {searchQuery && ` for "${searchQuery}"`}
        </Text>  

        {grants.map((grant) => (
          <GrantComponent 
            key={grant.id} 
            id={grant.id}
            title={grant.title}
            description={grant.description}
            deadline={grant.deadline}
            funding_amount={grant.funding_amount}
            source={grant.source}
            source_url={grant.source_url}
            focus_areas={grant.focus_areas}
            posted_date={grant.posted_date}
          />
        ))}
      </Stack>
  );
};

export default GrantsResults;