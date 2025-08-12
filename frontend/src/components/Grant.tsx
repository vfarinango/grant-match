import { Card, Text, Badge, Button, Group, Stack, Anchor, Box, Divider, Loader } from '@mantine/core';
import { IconSearch, IconFileText } from '@tabler/icons-react'; //IconCalendar, IconCurrencyDollar, IconBuilding,
import type { Grant, SimilarGrant } from "../services/grantsApi";
import React from 'react'; // Import React for the synthetic event type

const formatCurrency = (amount: number | undefined): string => {
    if (!amount) return 'Amount not specified';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString: Date | string | undefined): string => {
    if (!dateString) return 'Date not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};


const isSimilarGrant = (grant: Grant | SimilarGrant): grant is SimilarGrant => {
    return (grant as SimilarGrant).similarity_score !== undefined;
}

interface GrantProps {
    grant: Grant | SimilarGrant;
    onSearchSimilarGrants: (grantId: number, grantTitle: string) => void;
    onSummarize: (grantId: number) => void;
    view: 'all' | 'search' | 'similar';
    isBeingSummarized?: boolean;
    onSelectGrant: (grantId: number) => void;
}

const GrantComponent = ({ grant, onSearchSimilarGrants, onSummarize, view, isBeingSummarized, onSelectGrant }: GrantProps) => {
    const handleSimilarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        console.log('Similar click handler called', { grantId: grant.id, grantTitle: grant.title });
        
        if (grant.id && grant.title) {
            onSearchSimilarGrants(grant.id, grant.title);
        }
    };
    
    // debug log
    console.log(`Grant ${grant.id}: isBeingSummarized =`, isBeingSummarized);
    const handleSummarizeClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        console.log(`Clicking summarize for grant ${grant.id}`);
        if (grant.id) {
            onSummarize(grant.id);
        }
    };

    const tagsToShow = grant.focus_area_titles.slice(0, 4); // Display only the first 5 tags
    const hasMoreTags = grant.focus_area_titles.length > 4;

    return (
        <Card 
            shadow="sm" 
            padding="lg" 
            radius="md" 
            withBorder
            style={{ cursor: 'pointer' }}
        >
            <Box onClick={() => onSelectGrant(grant.id)}>
                <Stack gap="sm">
                    <Group justify="space-between" align="flex-start">
                        <Box style={{ flex: 1 }}>
                            <Text fw={600} size="lg" mb="xs" c="text-primary.0">
                                {grant.title}
                            </Text>

                            <Text size="sm" c="text-secondary.0" lineClamp={3}>
                                {grant.description}
                            </Text>
                        </Box>

                        <Box ta="right" style={{ minWidth: 'fit-content' }} ml="md">
                            {/* Reordered: Post Date is now first */}
                            <Text size="xs" c="text-secondary.0">Posted</Text>
                            <Text size="sm" c="text-primary.0" mb="xs">{formatDate(grant.posted_date)}</Text>
                            {/* Reordered: Due Date is now under Post Date */}
                            <Text size="xs" c="text-secondary.0">Deadline</Text>
                            <Text size="sm" fw={500} c="text-primary.0">{formatDate(grant.deadline)}</Text>
                        </Box>
                    </Group>

                    <Group gap="lg" mt="sm">
                        <Box>
                            <Text size="xs" c="text-secondary.0">Funding Amount</Text>
                            <Text size="sm" fw={500} c="text-primary.0">
                                {formatCurrency(grant.funding_amount)}
                            </Text>
                        </Box>

                        {/* New: Display the agency field */}
                        <Box>
                            <Text size="xs" c="text-secondary.0">Agency</Text>
                            <Text size="sm" fw={500} c="text-primary.0">
                                {grant.agency || 'Not Specified'}
                            </Text>
                        </Box>
                        
                        <Box>
                            <Text size="xs" c="text-secondary.0">Deadline</Text>
                            <Text size="sm" fw={500} c="text-primary.0">
                                {formatDate(grant.deadline)}
                            </Text>
                        </Box>

                        {grant.source && (
                            <Box>
                                <Text size="xs" c="text-secondary.0">Source</Text>
                                <Badge variant="light" size="sm" mt="2px" color="primary-blue">
                                    {grant.source}
                                </Badge>
                            </Box>
                        )}

                        {/* Conditionally display relevance score for search results */}
                        {isSimilarGrant(grant) && (
                            <Box>
                                <Text size="xs" c="text-secondary.0">Relevance</Text>
                                <Badge color="cyan" variant="light" size="sm" mt="2px">
                                    {grant.similarity_score.toFixed(2)}
                                </Badge>
                            </Box>
                        )}
                    </Group>

                    {/* New: Loop through and display focus_area_titles */}
                    {grant.focus_area_titles && grant.focus_area_titles.length > 0 && (
                        <Group gap="xs" mt="sm">
                            <Text size="xs" c="text-secondary.0">Focus Areas:</Text>
                            {tagsToShow.map((title, index) => (
                                <Badge key={index} variant="outline" size="xs" color="primary-blue">
                                    {title}
                                </Badge>
                            ))}
                            {hasMoreTags && (
                                <Badge variant="outline" size="xs" color="primary-blue">
                                    +{grant.focus_area_titles.length - 5} more
                                </Badge>
                            )}
                        </Group>
                    )}

                    {/* SUMMARY SECTION */}
                    {grant.summary && (
                        <Box mt="sm">
                            <Divider mb="sm" color="gray.2" />
                            <Text size="xs" c="text-secondary.0" fw={600} mb="xs">Summary:</Text>
                            <Text size="sm" c="text-primary.0" style={{ 
                                backgroundColor: '#f8f9ff', 
                                padding: '12px', 
                                borderRadius: '8px',
                                border: '1px solid #e7f0ff'
                            }}>
                                {grant.summary}
                            </Text>
                        </Box>
                    )}

                    <Box>
                        <Divider my="sm" color="gray.2" />
                        
                        <Group justify="space-between">
                            <Group gap="sm">
                                <Button 
                                    variant="filled" 
                                    size="sm" 
                                    color="primary-blue"
                                    onClick={handleSummarizeClick}
                                    leftSection={isBeingSummarized ? <Loader size={14} color="white" /> : <IconFileText size={14} />}
                                    disabled={isBeingSummarized}
                                >
                                    {isBeingSummarized ? 'Summarizing...' : (grant.summary ? 'Re-summarize' : 'Summarize')}
                                </Button>
                                
                                {/* Conditionally display "Search Similar" button */}
                                {view != 'similar' && (
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        color="primary-blue"
                                        onClick={handleSimilarClick}
                                        leftSection={<IconSearch size={14} />}
                                        
                                    >
                                        Find Similar
                                    </Button>
                                )}
                            </Group>

                            {grant.source_url && (
                                <Anchor 
                                    href={grant.source_url} 
                                    target="_blank" 
                                    size="sm"
                                    c="primary-blue.3"
                                    onClick={(event) => event.stopPropagation()} 
                                >
                                    Apply →
                                </Anchor>
                            )}
                        </Group>
                    </Box>
                </Stack>

            </Box>
        </Card>
    );
};

export default GrantComponent;
// Summarize grant feature Frontend: 
// Write the resultList Component
// Write the Grant Component
// Within the Grant component, include conditional logic that displays the summary if the summary button is pressed and a summary exists. 
// If the summary doesn’t exist, it calls a function from App.ts that sends a patch request to the backend to add a summary to the grant.