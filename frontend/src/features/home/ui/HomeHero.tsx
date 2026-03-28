import {
    Box,
    Flex,
    Heading,
    SimpleGrid,
    Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

interface HomeHeroProps {
    greetingKey: string;
    lastActivityText: string;
    readingDaysThisWeek: number;
    activeBooksCount: number;
    streak: { currentStreak: number };
    panelStyles: Record<string, unknown>;
    brandColor: string;
    textColor: string;
    subTextColor: string;
    mutedTextColor: string;
}

const HomeHero = ({
    greetingKey,
    lastActivityText,
    readingDaysThisWeek,
    activeBooksCount,
    streak,
    panelStyles,
    brandColor,
    textColor,
    subTextColor,
    mutedTextColor,
}: HomeHeroProps) => {
    const { t } = useTranslation();

    return (
        <Flex
            justify="space-between"
            align={{ base: 'flex-start', xl: 'flex-end' }}
            direction={{ base: 'column', xl: 'row' }}
            gap={6}
            mb={8}
        >
            <Box maxW="44rem">
                <Text
                    color={brandColor}
                    fontSize="0.72rem"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="0.16em"
                    mb={3}
                >
                    {t('home.focusBadge')}
                </Text>
                <Heading
                    color={textColor}
                    fontSize={{ base: '2.5rem', md: '3.25rem' }}
                    lineHeight={{ base: '0.98', md: '0.94' }}
                    mb={3}
                >
                    {t(greetingKey)}
                </Heading>
                <Text color={subTextColor} fontSize={{ base: 'md', md: 'lg' }} lineHeight="1.8" maxW="38rem">
                    {lastActivityText}
                </Text>
            </Box>

            <Box
                {...panelStyles}
                w={{ base: '100%', xl: '320px' }}
                px={5}
                py={4}
            >
                <Text fontSize="0.68rem" fontWeight="700" color={mutedTextColor} textTransform="uppercase" letterSpacing="0.16em" mb={3}>
                    {t('home.ledgerTitle')}
                </Text>
                <SimpleGrid columns={3} spacing={3}>
                    <Box>
                        <Text color={brandColor} fontSize="2xl" fontFamily="heading" lineHeight="1">
                            {readingDaysThisWeek}
                        </Text>
                        <Text color={mutedTextColor} fontSize="xs" textTransform="uppercase" letterSpacing="0.14em">
                            {t('home.streak.days')}
                        </Text>
                    </Box>
                    <Box>
                        <Text color="#95a17f" fontSize="2xl" fontFamily="heading" lineHeight="1">
                            {activeBooksCount}
                        </Text>
                        <Text color={mutedTextColor} fontSize="xs" textTransform="uppercase" letterSpacing="0.14em">
                            {t('home.activeBooks')}
                        </Text>
                    </Box>
                    <Box>
                        <Text color={textColor} fontSize="2xl" fontFamily="heading" lineHeight="1">
                            {streak.currentStreak}
                        </Text>
                        <Text color={mutedTextColor} fontSize="xs" textTransform="uppercase" letterSpacing="0.14em">
                            {t('home.streak.current')}
                        </Text>
                    </Box>
                </SimpleGrid>
            </Box>
        </Flex>
    );
};

export default HomeHero;
