import { Card, Text, Badge, Button, Group, Stack, Anchor } from '@mantine/core';
// import { IconCalendar, IconCurrencyDollar, IconBuilding } from '@tabler/icons-react';

const Grant = ( {
    id,
    title, 
    description, 
    deadline, 
    funding_amount, 
    source, 
    source_url, 
    focus_areas, 
    posted_date 
    } ) => {

        const formatCurrency = (amount: number | undefined): string => {
            if (!amount) return 'Amount not specified';
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }).format(amount);
        };

        const formatDate = (dateString: string | undefined): string => {
            if (!dateString) return 'Date not specified';
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        };

        return (
            <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="sm">
                    <Group justify="space-between" align="flex-start">
                        <div className="flex-1">
                            <Text fw={600} size="lg" className="mb-2">
                                {title}
                            </Text>
                            <Text size="sm" c="dimmed" lineClamp={3}>
                                {description}
                            </Text>
                        </div>

                        <div className="text-right min-w-fit ml-4">
                            <Text size="xs" c="dimmed">Posted</Text>
                            <Text size="sm">{formatDate(posted_date)}</Text>
                            <Text size="xs" c="dimmed" className="mt-2">Deadline</Text>
                            <Text size="sm" fw={500}>
                            {formatDate(deadline)}
                            </Text>
                        </div>

                    </Group>

                    <Group gap="lg" className="mt-3">
                        <Group gap="xs">
                            {/*<IconCurrencyDollar size={16} className="text-green-600" />*/}
                            <div>
                                <Text size="xs" c="dimmed">Funding Amount</Text>
                                <Text size="sm" fw={500}>
                                    {formatCurrency(funding_amount)}
                                </Text>
                            </div>
                        </Group>
                        <Group gap='xs'>
                            {/* <IconCalendar size={16} className="text-blue-600" /> */}
                            <div>
                                <Text size="xs" c="dimmed">Deadline</Text>
                                <Text size="sm" fw={500}>
                                    {formatDate(deadline)}
                                </Text>
                            </div>
                        </Group>

                        {source && (
                            <div>
                                <Text size="xs" c="dimmed">Source</Text>
                                <Badge variant="light" size="sm" className="mt-1">
                                    {source}
                                </Badge>
                            </div>
                        )}
                    </Group>

                    {focus_areas && focus_areas.length > 0 && (
                    <Group gap="xs" className="mt-2">
                        <Text size="xs" c="dimmed">Focus Areas:</Text>
                        {focus_areas.map((area, index) => (
                            <Badge key={index} variant="outline" size="xs">
                                {area}
                            </Badge>
                        ))}
                    </Group>
                    )}

                    <Group justify="space-between" className="mt-4 pt-3 border-t border-gray-100">
                        <Group gap="sm">
                            <Button variant="filled" size="sm">
                                Summarize
                            </Button>
                            <Button variant="outline" size="sm">
                                Search Similar
                            </Button>
                        </Group>

                        {source_url && (
                            <Anchor href={source_url} target="_blank" size="sm">
                                Official Link →
                            </Anchor>
                        )}
                    </Group>
                </Stack>
            </Card>
        );
};

export default Grant;
// Summarize grant feature Frontend: 
// Write the resultList Component
// Write the Grant Component
// Within the Grant component, include conditional logic that displays the summary if the summary button is pressed and a summary exists. 
// If the summary doesn’t exist, it calls a function from App.ts that sends a patch request to the backend to add a summary to the grant.