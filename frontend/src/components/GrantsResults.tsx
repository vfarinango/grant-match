import { Text, Stack } from '@mantine/core';
import type { Grant, SimilarGrant } from "../services/grantsApi";
import GrantComponent from './Grant';

interface GrantsResultsProps {
  grants: (Grant | SimilarGrant)[];
  loading: boolean;
  view: 'all' | 'search' | 'similar';
  searchQuery?: string;
  onSearchSimilar: (grantId: number, grantTitle: string) => Promise<void>;
}

const GrantsResults = ({ grants, loading, view, searchQuery, onSearchSimilar }: GrantsResultsProps) => {

  const renderHeader = () => {
    const countMessage = `${grants.length} grant${grants.length !== 1 ? 's' : ''}`;

    switch (view) {
      case 'all':
        return `${countMessage} available`;
      case 'search':
        return `${countMessage} found for your search`;
      case 'similar':
        return `${countMessage} similar grants found`;
      default:
        return countMessage;
    }
  };

  const renderEmptyState = () => {
    let message = 'No grants available';
    if (view === 'search' && searchQuery) {
        message = `No grants found for "${searchQuery}"`;
    } else if (view === 'similar') {
        message = `No similar grants found.`;
    }
    return (
        <div className="text-center py-12">
            <Text size="lg" c="dimmed">{message}</Text>
        </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!grants || grants.length === 0 ) {
    return renderEmptyState();
  }
  


  return (
      <Stack gap="md" className="mt-6">
        <Text size="sm" c="dimmed">
          {renderHeader()}
        </Text>  

        {grants.map((grant) => (
          <GrantComponent 
            key={grant.id} 
            grant={grant}
            onSearchSimilar={onSearchSimilar}
            view={view}
          />
        ))}
      </Stack>
  );
};

export default GrantsResults;