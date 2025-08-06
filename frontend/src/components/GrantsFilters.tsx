import { Box, Text, Checkbox, RangeSlider, Group, rem } from '@mantine/core';
import { IconCalendar, IconBuildingBank, IconTag } from '@tabler/icons-react';

// For now, using dummy data for filter options.
// Add to backend or be dynamically generated.
const deadlineOptions = [
    { value: '30days', label: 'Next 30 days' },
    { value: '90days', label: 'Next 90 days' },
    { value: 'thisYear', label: 'This year' },
];

const organizationTypeOptions = [
    { value: 'nonProfit', label: 'Non-profit' },
    { value: 'startup', label: 'Startup' },
    { value: 'academic', label: 'Academic' },
];

const GrantsFilters = () => {
    return (
        <Box>
        {/* Amount Range Filter */}
        <Text fw={500} mb="xs" mt="md" size="sm">
            <Group gap="xs">
                <IconBuildingBank size={16} /> Amount Range
            </Group>
        </Text>
        <RangeSlider
            defaultValue={[0, 100]}
            min={0}
            max={100}
            step={10}
            label={(value) => `$${value * 1000}`} // Example: $0 - $100,000
            thumbSize={18}
            styles={{
            track: { height: rem(4) },
            thumb: { borderWidth: rem(1), height: rem(18), width: rem(18) },
            }}
            mb="lg"
        />

        {/* Deadline Filter */}
        <Text fw={500} mb="xs" size="sm">
            <Group gap="xs">
                <IconCalendar size={16} /> Deadline
            </Group>
        </Text>
        <Checkbox.Group defaultValue={[]} mb="lg">
            {deadlineOptions.map((option) => (
            <Checkbox key={option.value} value={option.value} label={option.label} size="sm" />
            ))}
        </Checkbox.Group>

        {/* Organization Type Filter */}
        <Text fw={500} mb="xs" size="sm">
            <Group gap="xs">
                <IconTag size={16} /> Organization Type
            </Group>
        </Text>
        <Checkbox.Group defaultValue={[]} mb="lg">
            {organizationTypeOptions.map((option) => (
            <Checkbox key={option.value} value={option.value} label={option.label} size="sm" />
            ))}
        </Checkbox.Group>

        {/* Focus Area Filter (Placeholder - could be a multi-select or text input) */}
        <Text fw={500} mb="xs" size="sm">
            <Group gap="xs">
                <IconTag size={16} /> Focus Area
            </Group>
        </Text>
        <Text size="sm" c="dimmed">
            (Placeholder for focus area filters)
        </Text>
        </Box>
    );
};

export default GrantsFilters;