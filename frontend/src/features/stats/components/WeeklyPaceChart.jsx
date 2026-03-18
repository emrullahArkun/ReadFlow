import { useMemo } from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useTranslation } from 'react-i18next';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <Box bg="gray.900" px={3} py={2} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="10px" color="gray.400" textTransform="uppercase">{label}</Text>
            <Text fontSize="xs" color="teal.200" fontWeight="600">{payload[0].value} pages</Text>
        </Box>
    );
};

const WeeklyPaceChart = ({ dailyActivity = [] }) => {
    const { t, i18n } = useTranslation();

    const weeklyData = useMemo(() => {
        const now = new Date();
        const weeks = 12;
        const buckets = [];

        for (let w = weeks - 1; w >= 0; w--) {
            const weekEnd = new Date(now);
            weekEnd.setDate(now.getDate() - w * 7);
            const weekStart = new Date(weekEnd);
            weekStart.setDate(weekEnd.getDate() - 6);

            buckets.push({
                start: weekStart,
                end: weekEnd,
                label: weekStart.toLocaleDateString(i18n.language, { day: 'numeric', month: 'short' }),
                pages: 0,
            });
        }

        for (const entry of dailyActivity) {
            const d = new Date(entry.date);
            for (const bucket of buckets) {
                if (d >= bucket.start && d <= bucket.end) {
                    bucket.pages += entry.pagesRead;
                    break;
                }
            }
        }

        return buckets.map(b => ({ name: b.label, pages: b.pages }));
    }, [dailyActivity, i18n.language]);

    const hasData = weeklyData.some(w => w.pages > 0);

    if (!hasData) {
        return (
            <Flex h="160px" align="center" justify="center">
                <Text fontSize="sm" color="gray.500">{t('stats.weeklyPace.empty')}</Text>
            </Flex>
        );
    }

    return (
        <Box w="full" h="180px">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#718096', fontSize: 10 }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#718096', fontSize: 10 }}
                        width={40}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar
                        dataKey="pages"
                        fill="#81E6D9"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                    />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};

export default WeeklyPaceChart;
