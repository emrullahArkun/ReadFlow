import {
    Box,
    Flex,
    Grid,
    GridItem,
    Spinner,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useThemeTokens } from '../../../shared/theme/useThemeTokens';
import PageErrorState from '../../../shared/ui/PageErrorState';
import { useHomeFocusData } from '../model/useHomeFocusData';
import HomeHero from '../ui/HomeHero';
import HomeCurrentBookPanel from '../ui/HomeCurrentBookPanel';
import HomeSidebar from '../ui/HomeSidebar';
import HomeNextUpPanel from '../ui/HomeNextUpPanel';
import HomeGoalsPanel from '../ui/HomeGoalsPanel';

const HomePage = () => {
    const { t } = useTranslation();
    const {
        cardBg,
        textColor,
        subTextColor,
        mutedTextColor,
        brandColor,
        borderColor,
        subtleBorderColor,
        panelInsetBg,
        panelShadow,
    } = useThemeTokens();
    const {
        activeSession,
        currentBook,
        queuedBooks,
        activeGoalBooks,
        activeGoalCount,
        streak,
        activeBooksCount,
        completedBooksCount,
        weekDays,
        lastActivity,
        readingRhythm,
        todaySuggestion,
        resumeSuggestion,
        greetingKey,
        loading,
        isError,
        error,
        refresh,
    } = useHomeFocusData();

    if (loading) {
        return (
            <Flex justify="center" align="center" h="calc(100vh - 80px)">
                <Spinner size="xl" color={brandColor} thickness="4px" />
            </Flex>
        );
    }

    if (isError) {
        return (
            <PageErrorState
                title={t('myBooks.error', { message: error || t('stats.error') })}
                onRetry={refresh}
                retryLabel={t('common.retry')}
            />
        );
    }

    const lastActivityText = lastActivity.type === 'today'
        ? t('home.lastActivityToday', { pages: lastActivity.pages, title: lastActivity.title })
        : lastActivity.type === 'yesterday'
            ? t('home.lastActivity', { pages: lastActivity.pages, title: lastActivity.title })
            : t('home.lastActivityNone');

    const readingDaysThisWeek = weekDays.filter((d) => d.pagesRead > 0).length;

    const panelStyles = {
        bg: cardBg,
        border: '1px solid',
        borderColor,
        borderRadius: '2xl',
        boxShadow: panelShadow,
    };
    const insetStyles = {
        bg: panelInsetBg,
        border: '1px solid',
        borderColor: subtleBorderColor,
        borderRadius: 'xl',
    };

    return (
        <Box px={{ base: 4, md: 8 }} py={{ base: 5, md: 8 }} maxW="1180px" mx="auto" minH="calc(100vh - 80px)">
            <HomeHero
                greetingKey={greetingKey}
                lastActivityText={lastActivityText}
                readingDaysThisWeek={readingDaysThisWeek}
                activeBooksCount={activeBooksCount}
                streak={streak}
                panelStyles={panelStyles}
                brandColor={brandColor}
                textColor={textColor}
                subTextColor={subTextColor}
                mutedTextColor={mutedTextColor}
            />

            <Grid templateColumns={{ base: '1fr', xl: '1.55fr 0.95fr' }} gap={6} mb={8}>
                <GridItem>
                    <HomeCurrentBookPanel
                        currentBook={currentBook}
                        activeSession={activeSession}
                        activeBooksCount={activeBooksCount}
                        activeGoalCount={activeGoalCount}
                        completedBooksCount={completedBooksCount}
                        panelStyles={panelStyles}
                        insetStyles={insetStyles}
                        brandColor={brandColor}
                        textColor={textColor}
                        subTextColor={subTextColor}
                        mutedTextColor={mutedTextColor}
                        subtleBorderColor={subtleBorderColor}
                    />
                </GridItem>

                <GridItem>
                    <HomeSidebar
                        todaySuggestion={todaySuggestion}
                        readingRhythm={readingRhythm}
                        resumeSuggestion={resumeSuggestion}
                        weekDays={weekDays}
                        streak={streak}
                        panelStyles={panelStyles}
                        brandColor={brandColor}
                        textColor={textColor}
                        subTextColor={subTextColor}
                        mutedTextColor={mutedTextColor}
                    />
                </GridItem>
            </Grid>

            <Grid templateColumns={{ base: '1fr', xl: '1.2fr 0.8fr' }} gap={6}>
                <GridItem>
                    <HomeNextUpPanel
                        queuedBooks={queuedBooks}
                        panelStyles={panelStyles}
                        insetStyles={insetStyles}
                        textColor={textColor}
                        subTextColor={subTextColor}
                        mutedTextColor={mutedTextColor}
                        borderColor={borderColor}
                    />
                </GridItem>

                <GridItem>
                    <HomeGoalsPanel
                        activeGoalBooks={activeGoalBooks}
                        panelStyles={panelStyles}
                        insetStyles={insetStyles}
                        brandColor={brandColor}
                        subTextColor={subTextColor}
                        mutedTextColor={mutedTextColor}
                    />
                </GridItem>
            </Grid>
        </Box>
    );
};

export default HomePage;
