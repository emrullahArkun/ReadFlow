import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Portal,
    Box,
    Button,
    Container,
    Spinner,
    Flex,
} from '@chakra-ui/react';
import { FaArrowLeft } from 'react-icons/fa';
import { useReadingSessionPageLogic } from '../model/useReadingSessionPageLogic';
import { useThemeTokens } from '../../../shared/theme/useThemeTokens';
import SessionCompletionOverlay from '../ui/SessionCompletionOverlay';
import SessionTimerCard from '../ui/SessionTimerCard';
import { ROUTES } from '../../../app/router/routes';

type AmbientMode = 'quiet' | 'warm' | 'night';

const AMBIENT_STYLES: Record<AmbientMode, { topGlow: string; bottomGlow: string }> = {
    quiet: {
        topGlow: 'radial-gradient(circle, rgba(149,161,127,0.18) 0%, rgba(149,161,127,0) 68%)',
        bottomGlow: 'radial-gradient(circle, rgba(197,154,92,0.14) 0%, rgba(197,154,92,0) 70%)',
    },
    warm: {
        topGlow: 'radial-gradient(circle, rgba(197,154,92,0.2) 0%, rgba(197,154,92,0) 68%)',
        bottomGlow: 'radial-gradient(circle, rgba(126,97,62,0.16) 0%, rgba(126,97,62,0) 70%)',
    },
    night: {
        topGlow: 'radial-gradient(circle, rgba(154,170,196,0.16) 0%, rgba(154,170,196,0) 68%)',
        bottomGlow: 'radial-gradient(circle, rgba(78,90,112,0.18) 0%, rgba(78,90,112,0) 70%)',
    },
};

const ReadingSessionPage = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [focusModeEnabled, setFocusModeEnabled] = useState(false);
    const [ambientMode, setAmbientMode] = useState<AmbientMode>('quiet');

    const {
        book,
        fetchingBook,
        sessionLoading,
        sessionPhase,
        isBusy,
        formattedTime,
        isPaused,
        resumeSession,
        pauseSession,
        isController,
        takeControl,
        showStopConfirm,
        endPage,
        setEndPage,
        handleStopClick,
        handleStopCancel,
        handleConfirmStop,
        completionSummary,
    } = useReadingSessionPageLogic(id);

    const { bgColor, cardBg, textColor, subTextColor, mutedTextColor, brandColor, borderColor, panelInsetBg } = useThemeTokens();
    const ambientStyle = AMBIENT_STYLES[ambientMode];

    useEffect(() => {
        if (!completionSummary) {
            return;
        }

        const timer = window.setTimeout(() => {
            navigate(ROUTES.MY_BOOKS);
        }, 3500);

        return () => window.clearTimeout(timer);
    }, [completionSummary, navigate]);

    if (fetchingBook || sessionLoading) {
        return (
            <Flex justify="center" align="center" h="100vh" bg={bgColor}>
                <Spinner size="xl" color={brandColor} thickness="4px" />
            </Flex>
        );
    }

    if (!book) {
        return <Box textAlign="center" py={20} color={textColor}>{t('bookStats.notFound')}</Box>;
    }

    return (
        <Box
            bg={bgColor}
            minH="calc(100vh - 60px)"
            px={{ base: 4, md: 8 }}
            py={{ base: 3, md: 5 }}
            overflow="hidden"
            display="flex"
            flexDirection="column"
            position="relative"
        >
            {completionSummary && (
                <Portal>
                    <SessionCompletionOverlay
                        summary={completionSummary}
                        pageCount={book.pageCount}
                    />
                </Portal>
            )}

            <Box
                position="absolute"
                top="-120px"
                right="-80px"
                w="360px"
                h="360px"
                borderRadius="full"
                bg={ambientStyle.topGlow}
                filter="blur(24px)"
                pointerEvents="none"
            />
            <Box
                position="absolute"
                bottom="-140px"
                left="-90px"
                w="420px"
                h="420px"
                borderRadius="full"
                bg={ambientStyle.bottomGlow}
                filter="blur(32px)"
                pointerEvents="none"
            />

            <Container
                maxW="1080px"
                flex="1"
                minH="0"
                display="flex"
                flexDirection="column"
                position="relative"
                zIndex={1}
            >
                <Flex
                    align={{ base: 'stretch', md: 'center' }}
                    justify="space-between"
                    gap={3}
                    direction={{ base: 'column', md: 'row' }}
                    mb={{ base: 3, md: 4 }}
                >
                    <Button
                        onClick={() => navigate(ROUTES.MY_BOOKS)}
                        leftIcon={<FaArrowLeft />}
                        alignSelf={{ base: 'flex-start', md: 'center' }}
                        variant="ghost"
                        color={subTextColor}
                        borderRadius="full"
                        px={4}
                        _hover={{ bg: 'rgba(248, 236, 214, 0.06)', color: textColor }}
                    >
                        {t('navbar.myBooks')}
                    </Button>
                    <Box
                        px={4}
                        py={2.5}
                        borderRadius="full"
                        border="1px solid"
                        borderColor="rgba(217, 188, 146, 0.14)"
                        bg="rgba(24, 18, 14, 0.42)"
                        color={brandColor}
                        fontSize="0.68rem"
                        fontWeight="700"
                        letterSpacing="0.16em"
                        textTransform="uppercase"
                        alignSelf={{ base: 'flex-start', md: 'center' }}
                    >
                        {t('readingSession.focusBadge')}
                    </Box>
                </Flex>

                <SessionTimerCard
                    cardBg={cardBg}
                    brandColor={brandColor}
                    sessionPhase={sessionPhase}
                    isBusy={isBusy}
                    isPaused={isPaused}
                    formattedTime={formattedTime}
                    isController={isController}
                    takeControl={takeControl}
                    showStopConfirm={showStopConfirm}
                    endPage={endPage}
                    setEndPage={setEndPage}
                    bookTitle={book.title}
                    authorName={book.authorName}
                    currentPageNumber={book.currentPage ?? 0}
                    pageCount={book.pageCount}
                    currentPage={String(book.currentPage ?? 0)}
                    subTextColor={subTextColor}
                    mutedTextColor={mutedTextColor}
                    borderColor={borderColor}
                    panelInsetBg={panelInsetBg}
                    focusModeEnabled={focusModeEnabled}
                    onToggleFocusMode={() => setFocusModeEnabled((currentValue) => !currentValue)}
                    ambientMode={ambientMode}
                    onAmbientModeChange={setAmbientMode}
                    handleConfirmStop={handleConfirmStop}
                    handleStopCancel={handleStopCancel}
                    resumeSession={resumeSession}
                    pauseSession={pauseSession}
                    handleStopClick={handleStopClick}
                />
            </Container>
        </Box>
    );
};

export default ReadingSessionPage;
