import { Modal, Text, Stack, Box, Loader, Center, ScrollArea } from '@mantine/core';
import type { SimilarGrant } from "../services/grantsApi";
import GrantComponent from './Grant';

interface SimilarGrantsModalProps {
    similarGrants: SimilarGrant[];
    baseGrant: { id: number; title: string } | null;
    onClose: () => void;
    opened: boolean;
    loading: boolean;
    onSearchSimilarGrants: (grantId: number, grantTitle: string) => Promise<void>;
    }

    const SimilarGrantsModal = ({ 
    opened, 
    onClose, 
    similarGrants, 
    loading, 
    baseGrant,
    onSearchSimilarGrants,
    }: SimilarGrantsModalProps) => {

        console.log('Modal props:', { opened, loading, similarGrants, baseGrant });
    
        const renderContent = () => {
            if (loading) {
            return (
                <Center py="xl">
                    <Loader size="lg" color="primary-blue" />
                </Center>
            );
            }

            if (!similarGrants || similarGrants.length === 0) {
            return (
                <Box ta="center" py="xl">
                    <Text size="lg" c="text-secondary.0">No similar grants found.</Text>
                </Box>
            );
            }

            return (
                <Stack gap="md">
                    <Text size="sm" c="text-secondary.0">
                        {similarGrants.length} similar grant{similarGrants.length !== 1 ? 's' : ''} found
                    </Text>
                    
                    {similarGrants.map((grant) => (
                    <GrantComponent 
                        key={grant.id} 
                        grant={grant}
                        onSearchSimilarGrants={onSearchSimilarGrants}
                        view="similar"
                    />
                    ))}
                </Stack>
            );
        };

        return (
            <Modal
                opened={opened} //The modal is open if this component is rendered
                onClose={onClose}
                size="xl"
                zIndex={9999} 
                title={
                    <Text size="lg" fw={600} c="text-primary.0">
                    {baseGrant ? `Similar grants for '${baseGrant.title}'` : 'Similar grants'}
                    </Text>
                }
                scrollAreaComponent={ScrollArea.Autosize}
                >
                {renderContent()}
            </Modal>
        );
};

export default SimilarGrantsModal;
