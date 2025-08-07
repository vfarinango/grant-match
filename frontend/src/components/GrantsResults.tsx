import { Text, Stack, Box, Loader, Center } from '@mantine/core';
import type { Grant, SimilarGrant } from "../services/grantsApi";
import GrantComponent from './Grant';

interface GrantsResultsProps {
  grants: (Grant | SimilarGrant)[];
  loading: boolean;
  view: 'all' | 'search' | 'similar';
  searchQuery?: string;
  onSearchSimilarGrants: (grantId: number, grantTitle: string) => Promise<void>;
}

const GrantsResults = ({ grants, loading, view, searchQuery, onSearchSimilarGrants }: GrantsResultsProps) => {

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
        <Box ta="center" py="xl">
            <Text size="lg" c="text-secondary.0">{message}</Text>
        </Box>
    );
  };

  if (loading) {
    return (
      <Center py="xl">
        <Loader size="lg" color="primary-blue" />
      </Center>
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
            onSearchSimilarGrants={onSearchSimilarGrants}
            view={view}
          />
        ))}
      </Stack>
  );
};

export default GrantsResults;