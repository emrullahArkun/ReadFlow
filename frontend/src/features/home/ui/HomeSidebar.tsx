import {
    Box,
    Flex,
    Heading,
    Icon,
    Stack,
    Text,
} from '@chakra-ui/react';
import { FaFire } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import type { TodaySuggestion, ResumeSuggestion } from '../model/homeInsights';
import type { WeekDay } from '../model/useHomeFocusData';

interface ReadingRhythm {
    enoughData: boolean;
    hasAnySessions: boolean;
    preferredTimeOfDay: string;
    preferredSessionLength: string;
    averageMinutesPerSession: number;
    averagePagesPerSession: number;
    sessionsLast14: number;
    activeDaysLast14: number;
    consistency: string;
}

interface HomeSidebarProps {
    todaySuggestion: TodaySuggestion;
    readingRhythm: ReadingRhythm;
    resumeSuggestion: ResumeSuggestion;
    weekDays: WeekDay[];
    streak: { currentStreak: number };
    panelStyles: Record<string, unknown>;
    brandColor: string;
    textColor: string;
    subTextColor: string;
    mutedTextColor: string;
}

const HomeSidebar = ({
    todaySuggestion,
    readingRhythm,
    resumeSuggestion,
    weekDays,
    streak,
    panelStyles,
    brandColor,
    textColor,
    subTextColor,
    mutedTextColor,
}: HomeSidebarProps) => {
    const { t } = useTranslation();

    const readingDaysThisWeek = weekDays.filter((d) => d.pagesRead > 0).length;
    const weekDayLabels = t('home.weekDays', { returnObjects: true }) as string[];
    const maxWeekPages = Math.max(...weekDays.map((day) => day.pagesRead), 1);

    return (
        <Stack spacing={4} h="100%">
            <Box {...panelStyles} p={5}>
                <Text fontSize="0.68rem" color={mutedTextColor} textTransform="uppercase" letterSpacing="0.16em" fontWeight="700" mb={2}>
                    {t('home.todaySuggestion.label')}
                </Text>
                <Heading size="md" color={textColor} mb={2} lineHeight="1.3">
                    {todaySuggestion.kind === 'finish'
                        ? t('home.todaySuggestion.finishTitle', {
                            pages: todaySuggestion.suggestedPages,
                            title: todaySuggestion.title,
                        })
                        : todaySuggestion.kind === 'continue'
                            ? t('home.todaySuggestion.progressTitle', {
                                pages: todaySuggestion.suggestedPages,
                                title: todaySuggestion.title,
                            })
                            : t('home.todaySuggestion.emptyTitle')}
                </Heading>
                <Text color={subTextColor} fontSize="sm" lineHeight="1.8">
                    {todaySuggestion.kind === 'finish'
                        ? t('home.todaySuggestion.finishBody', { title: todaySuggestion.title })
                        : todaySuggestion.kind === 'continue'
                            ? t('home.todaySuggestion.progressBody', {
                                targetPage: todaySuggestion.targetPage,
                                remaining: todaySuggestion.remainingPages,
                            })
                            : t('home.todaySuggestion.emptyBody')}
                </Text>
            </Box>

            <Box {...panelStyles} p={5}>
                <Text fontSize="0.68rem" color={mutedTextColor} textTransform="uppercase" letterSpacing="0.16em" fontWeight="700" mb={2}>
                    {t('home.rhythm.label')}
                </Text>
                <Heading size="md" color={textColor} mb={2} lineHeight="1.3">
                    {readingRhythm.enoughData
                        ? t('home.rhythm.summaryTitle', {
                            timeOfDay: t(`home.rhythm.timeOfDay.${readingRhythm.preferredTimeOfDay}`),
                        })
                        : readingRhythm.hasAnySessions
                            ? t('home.rhythm.buildingTitle')
                            : t('home.rhythm.emptyTitle')}
                </Heading>
                <Text color={subTextColor} fontSize="sm" lineHeight="1.8" mb={4}>
                    {readingRhythm.enoughData
                        ? t('home.rhythm.summaryBody', {
                            sessionLength: t(`home.rhythm.sessionLength.${readingRhythm.preferredSessionLength}`),
                            minutes: readingRhythm.averageMinutesPerSession,
                            pages: readingRhythm.averagePagesPerSession,
                        })
                        : readingRhythm.hasAnySessions
                            ? t('home.rhythm.buildingBody', {
                                sessions: readingRhythm.sessionsLast14,
                                days: readingRhythm.activeDaysLast14,
                            })
                            : t('home.rhythm.emptyBody')}
                </Text>
                <Flex justify="space-between" align="center" mb={4}>
                    <Text fontSize="xs" color={mutedTextColor}>
                        {readingRhythm.hasAnySessions
                            ? t(`home.rhythm.consistency.${readingRhythm.consistency}`)
                            : t('home.rhythm.consistency.empty')}
                    </Text>
                    <Flex align="center" gap={1.5}>
                        {streak.currentStreak > 0 && <Icon as={FaFire} color={brandColor} boxSize={3} />}
                        <Text fontSize="xs" fontWeight="600" color={streak.currentStreak > 0 ? brandColor : mutedTextColor}>
                            {streak.currentStreak} {t('home.streak.current')}
                        </Text>
                    </Flex>
                </Flex>
                <Flex justify="space-between" align="end" gap={2}>
                    {weekDays.map((day, i) => (
                        <Flex key={day.date} direction="column" align="center" gap={2} flex="1">
                            <Box
                                w="100%"
                                maxW="30px"
                                h={`${day.pagesRead > 0 ? Math.max(16, Math.round((day.pagesRead / maxWeekPages) * 42)) : 10}px`}
                                minH="10px"
                                borderRadius="sm"
                                bg={day.pagesRead > 0 ? 'linear-gradient(180deg, rgba(197, 154, 92, 0.95) 0%, rgba(134, 95, 52, 0.95) 100%)' : 'rgba(248, 236, 214, 0.08)'}
                                border="1px solid"
                                borderColor={day.pagesRead > 0 ? 'rgba(217, 188, 146, 0.32)' : 'rgba(217, 188, 146, 0.08)'}
                            />
                            <Text fontSize="10px" color={mutedTextColor} fontWeight="600" textTransform="uppercase" letterSpacing="0.08em">
                                {weekDayLabels[i]}
                            </Text>
                        </Flex>
                    ))}
                </Flex>
                <Text fontSize="xs" color={mutedTextColor} mt={3}>
                    {readingDaysThisWeek}/7 {t('home.streak.days')}
                </Text>
            </Box>

            <Box {...panelStyles} p={5}>
                <Text fontSize="0.68rem" color={mutedTextColor} textTransform="uppercase" letterSpacing="0.16em" fontWeight="700" mb={2}>
                    {t('home.restart.label')}
                </Text>
                <Heading size="md" color={textColor} mb={2} lineHeight="1.3">
                    {resumeSuggestion.kind === 'current'
                        ? t('home.restart.currentTitle', { title: resumeSuggestion.title })
                        : resumeSuggestion.kind === 'queued'
                            ? t('home.restart.queuedTitle', { title: resumeSuggestion.title })
                            : t('home.restart.emptyTitle')}
                </Heading>
                <Text color={subTextColor} fontSize="sm" lineHeight="1.8">
                    {resumeSuggestion.kind === 'current'
                        ? t('home.restart.currentBody', { page: resumeSuggestion.currentPage })
                        : resumeSuggestion.kind === 'queued'
                            ? t('home.restart.queuedBody')
                            : t('home.restart.emptyBody')}
                </Text>
            </Box>
        </Stack>
    );
};

export default HomeSidebar;
