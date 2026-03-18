import { useMemo } from 'react';
import { Box, Text, Flex, VStack } from '@chakra-ui/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

const COLORS = [
    '#81E6D9', '#63B3ED', '#F6AD55', '#FC8181',
    '#B794F4', '#68D391', '#F687B3', '#90CDF4',
];

const GENRE_MAP_DE = {
    'fiction': 'Belletristik',
    'non-fiction': 'Sachbuch',
    'nonfiction': 'Sachbuch',
    'mystery': 'Krimi',
    'thriller': 'Thriller',
    'romance': 'Romantik',
    'science fiction': 'Science-Fiction',
    'sci-fi': 'Sci-Fi',
    'fantasy': 'Fantasy',
    'horror': 'Horror',
    'biography': 'Biografie',
    'autobiography': 'Autobiografie',
    'history': 'Geschichte',
    'philosophy': 'Philosophie',
    'psychology': 'Psychologie',
    'science': 'Wissenschaft',
    'poetry': 'Lyrik',
    'drama': 'Drama',
    'adventure': 'Abenteuer',
    'children': 'Kinderbuch',
    "children's literature": 'Kinderliteratur',
    'young adult': 'Jugendbuch',
    'comics': 'Comics',
    'graphic novels': 'Graphic Novels',
    'cooking': 'Kochen',
    'travel': 'Reise',
    'art': 'Kunst',
    'music': 'Musik',
    'religion': 'Religion',
    'politics': 'Politik',
    'economics': 'Wirtschaft',
    'education': 'Bildung',
    'self-help': 'Ratgeber',
    'health': 'Gesundheit',
    'sports': 'Sport',
    'nature': 'Natur',
    'humor': 'Humor',
    'crime': 'Krimi',
    'detective': 'Detektiv',
    'suspense': 'Spannung',
    'historical fiction': 'Historischer Roman',
    'literary fiction': 'Literarische Fiktion',
    'contemporary': 'Gegenwartsliteratur',
    'classic': 'Klassiker',
    'classics': 'Klassiker',
    'dystopia': 'Dystopie',
    'war': 'Krieg',
    'manga': 'Manga',
    'essays': 'Essays',
    'journalism': 'Journalismus',
    'true crime': 'True Crime',
    'family': 'Familie',
    'love': 'Liebe',
    'animals': 'Tiere',
    'technology': 'Technologie',
    'business': 'Business',
    'memoir': 'Memoiren',
};

const translateGenre = (genre, lang) => {
    if (lang !== 'de') return genre;
    return GENRE_MAP_DE[genre.toLowerCase()] || genre;
};

const CustomTooltip = ({ active, payload, t }) => {
    if (!active || !payload?.length) return null;
    const { name, value } = payload[0];
    return (
        <Box bg="gray.900" px={3} py={2} borderRadius="lg" border="1px solid" borderColor="whiteAlpha.100">
            <Text fontSize="xs" color="white" fontWeight="600">{name}</Text>
            <Text fontSize="xs" color="teal.200">
                {value} {value === 1 ? t('stats.genre.book') : t('stats.genre.books')}
            </Text>
        </Box>
    );
};

const GenreDonutChart = ({ genreDistribution = [] }) => {
    const { t, i18n } = useTranslation();

    const data = useMemo(() =>
        genreDistribution.map(g => ({
            name: translateGenre(g.genre, i18n.language),
            value: g.count,
        })),
        [genreDistribution, i18n.language]
    );

    if (data.length === 0) {
        return (
            <Flex h="180px" align="center" justify="center">
                <Text fontSize="sm" color="gray.500">{t('stats.genre.empty')}</Text>
            </Flex>
        );
    }

    return (
        <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={4} w="full">
            <Box w="180px" h="180px" flexShrink={0}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip t={t} />} />
                    </PieChart>
                </ResponsiveContainer>
            </Box>

            <VStack align="start" spacing={1} flex={1}>
                {data.map((entry, i) => (
                    <Flex key={entry.name} align="center" gap={2}>
                        <Box w="10px" h="10px" borderRadius="2px" bg={COLORS[i % COLORS.length]} flexShrink={0} />
                        <Text fontSize="xs" color="gray.300" noOfLines={1}>{entry.name}</Text>
                        <Text fontSize="xs" color="gray.500">({entry.value})</Text>
                    </Flex>
                ))}
            </VStack>
        </Flex>
    );
};

export default GenreDonutChart;
