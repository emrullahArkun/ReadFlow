import {
    Badge,
    Box,
    Button,
    ButtonGroup,
    Card,
    Flex,
    Progress,
    SimpleGrid,
    Text,
    VStack,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import type { ReadingSessionPhase } from '../../../shared/types/sessions';
import { useTranslation } from 'react-i18next';
import SessionControls from './SessionControls';
import SessionRemoteAlert from './SessionRemoteAlert';
import SessionStatusDisplay from './SessionStatusDisplay';
import SessionStopConfirm from './SessionStopConfirm';

const MotionCard = motion(Card);
const MotionGlow = motion(Box);

type SessionTimerCardProps = {
    cardBg: string;
    brandColor: string;
    sessionPhase: ReadingSessionPhase;
    isBusy: boolean;
    isPaused: boolean;
    formattedTime: string;
    isController: boolean;
    takeControl: () => void;
    showStopConfirm: boolean;
    endPage: string;
    setEndPage: (value: string) => void;
    bookTitle: string;
    authorName: string;
    currentPageNumber: number;
    pageCount: number | null;
    currentPage: string;
    subTextColor: string;
    mutedTextColor: string;
    borderColor: string;
    panelInsetBg: string;
    focusModeEnabled: boolean;
    onToggleFocusMode: () => void;
    ambientMode: 'quiet' | 'warm' | 'night';
    onAmbientModeChange: (mode: 'quiet' | 'warm' | 'night') => void;
    handleConfirmStop: () => Promise<void>;
    handleStopCancel: () => void;
    resumeSession: () => Promise<void>;
    pauseSession: () => Promise<void>;
    handleStopClick: () => void;
};

const SessionTimerCard = ({
    cardBg,
    brandColor,
    sessionPhase,
    isBusy,
    isPaused,
    formattedTime,
    isController,
    takeControl,
    showStopConfirm,
    endPage,
    setEndPage,
    bookTitle,
    authorName,
    currentPageNumber,
    pageCount,
    currentPage,
    subTextColor,
    mutedTextColor,
    borderColor,
    panelInsetBg,
    focusModeEnabled,
    onToggleFocusMode,
    ambientMode,
    onAmbientModeChange,
    handleConfirmStop,
    handleStopCancel,
    resumeSession,
    pauseSession,
    handleStopClick
}: SessionTimerCardProps) => {
    const { t } = useTranslation();
    const progressPercent = pageCount ? Math.round((currentPageNumber / pageCount) * 100) : 0;
    const pagesLeft = pageCount ? Math.max(pageCount - currentPageNumber, 0) : null;

    const getAmbientCopy = () => {
        if (isPaused) {
            return t('readingSession.ambience.paused');
        }

        if (ambientMode === 'warm') {
            return t('readingSession.ambience.warm', { title: bookTitle });
        }

        if (ambientMode === 'night') {
            return t('readingSession.ambience.night', { title: bookTitle });
        }

        return t('readingSession.ambience.quiet', { title: bookTitle });
    };

    return (
        <MotionCard
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={borderColor}
            boxShadow="0 24px 42px rgba(8, 6, 4, 0.22)"
            p={{ base: 5, md: 6 }}
            position="relative"
            overflow="visible"
            flex="1"
            minH="full"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.12 }}
        >
            <MotionGlow
                position="absolute"
                top="-90px"
                left="50%"
                transform="translateX(-50%)"
                w={{ base: '220px', md: '300px' }}
                h={{ base: '220px', md: '300px' }}
                borderRadius="full"
                bg="radial-gradient(circle, rgba(197,154,92,0.16) 0%, rgba(197,154,92,0) 68%)"
                animate={{ scale: [0.96, 1.03, 0.96], opacity: [0.55, 0.9, 0.55] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                pointerEvents="none"
            />

            <Flex direction="column" gap={{ base: 3, md: 4 }} h="full" position="relative" zIndex={1}>
                <Flex
                    w="full"
                    justify="space-between"
                    align={{ base: 'start', lg: 'center' }}
                    gap={3}
                    direction={{ base: 'column', lg: 'row' }}
                >
                    <VStack spacing={1} align="start" maxW="52ch">
                        <Badge bg="rgba(197, 154, 92, 0.12)" color="#d9bc92" fontSize="0.62rem" letterSpacing="0.12em">
                            {t('readingSession.focusMode')}
                        </Badge>
                        <Text color="#f4ead7" fontWeight="700" fontFamily="heading" fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.08">
                            {bookTitle}
                        </Text>
                        <Text color={subTextColor} fontSize="0.9rem">
                            {authorName}
                        </Text>
                    </VStack>

                    <Flex gap={2} wrap="wrap" justify={{ base: 'flex-start', lg: 'flex-end' }}>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onToggleFocusMode}
                            borderRadius="full"
                        >
                            {focusModeEnabled ? t('readingSession.controls.showContext') : t('readingSession.controls.enterFocus')}
                        </Button>
                        <ButtonGroup isAttached size="sm" variant="outline" alignSelf={{ base: 'stretch', lg: 'center' }}>
                            {(['quiet', 'warm', 'night'] as const).map((mode) => (
                                <Button
                                    key={mode}
                                    onClick={() => onAmbientModeChange(mode)}
                                    borderColor={ambientMode === mode ? '#c59a5c' : borderColor}
                                    bg={ambientMode === mode ? 'rgba(197, 154, 92, 0.12)' : 'transparent'}
                                    color={ambientMode === mode ? '#f4ead7' : 'rgba(217, 204, 182, 0.76)'}
                                    _hover={{ bg: 'rgba(248, 236, 214, 0.05)' }}
                                >
                                    {t(`readingSession.ambientModes.${mode}`)}
                                </Button>
                            ))}
                        </ButtonGroup>
                    </Flex>
                </Flex>

                <Box
                    w="full"
                    bg={panelInsetBg}
                    borderRadius="xl"
                    p={{ base: 3.5, md: 4 }}
                    border="1px solid"
                    borderColor={borderColor}
                >
                    <VStack spacing={2} align="stretch">
                        <Flex justify="space-between" align="center" gap={3} flexWrap="wrap">
                            <Text color={subTextColor} fontSize="0.88rem" lineHeight="1.6">
                                {focusModeEnabled
                                    ? t('readingSession.focusModeHint')
                                    : t('readingSession.cozyLine', { author: authorName })}
                            </Text>
                            <Text color={mutedTextColor} fontSize="0.68rem" textTransform="uppercase" letterSpacing="0.14em" fontWeight="700">
                                {pageCount ? `${progressPercent}%` : '—'}
                            </Text>
                        </Flex>
                        <Progress
                            value={pageCount ? (currentPageNumber / pageCount) * 100 : 0}
                            size="sm"
                            borderRadius="full"
                            bg="rgba(248, 236, 214, 0.08)"
                        />
                    </VStack>
                </Box>

                <SimpleGrid columns={3} spacing={3} w="full">
                    <Box bg={panelInsetBg} borderRadius="xl" p={{ base: 3, md: 3.5 }} border="1px solid" borderColor={borderColor}>
                        <Text color={mutedTextColor} fontSize="0.62rem" textTransform="uppercase" letterSpacing="0.14em" mb={1}>
                            {t('readingSession.metrics.currentPage')}
                        </Text>
                        <Text color={brandColor} fontSize={{ base: '1.2rem', md: '1.45rem' }} fontWeight="700" fontFamily="heading" lineHeight="1">
                            {currentPageNumber}
                        </Text>
                    </Box>
                    <Box bg={panelInsetBg} borderRadius="xl" p={{ base: 3, md: 3.5 }} border="1px solid" borderColor={borderColor}>
                        <Text color={mutedTextColor} fontSize="0.62rem" textTransform="uppercase" letterSpacing="0.14em" mb={1}>
                            {t('readingSession.metrics.pagesLeft')}
                        </Text>
                        <Text color="#95a17f" fontSize={{ base: '1.2rem', md: '1.45rem' }} fontWeight="700" fontFamily="heading" lineHeight="1">
                            {pagesLeft ?? '—'}
                        </Text>
                    </Box>
                    <Box bg={panelInsetBg} borderRadius="xl" p={{ base: 3, md: 3.5 }} border="1px solid" borderColor={borderColor}>
                        <Text color={mutedTextColor} fontSize="0.62rem" textTransform="uppercase" letterSpacing="0.14em" mb={1}>
                            {t('readingSession.metrics.progress')}
                        </Text>
                        <Text color="#f4ead7" fontSize={{ base: '1.2rem', md: '1.45rem' }} fontWeight="700" fontFamily="heading" lineHeight="1">
                            {pageCount ? `${progressPercent}%` : '—'}
                        </Text>
                    </Box>
                </SimpleGrid>

                <Box
                    w="full"
                    bg={panelInsetBg}
                    borderRadius="2xl"
                    p={{ base: 4, md: 4.5 }}
                    border="1px solid"
                    borderColor={borderColor}
                    flex="1"
                    minH="0"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                >
                    <Box w="full" textAlign="center">
                        <SessionStatusDisplay
                            brandColor={brandColor}
                            formattedTime={formattedTime}
                            isPaused={isPaused}
                            isBusy={isBusy}
                            sessionPhase={sessionPhase}
                        />
                    </Box>
                </Box>

                {!isController && (
                    <SessionRemoteAlert takeControl={takeControl} />
                )}

                {!showStopConfirm && (
                    <Box
                        w="full"
                        bg="rgba(248, 236, 214, 0.06)"
                        borderRadius="2xl"
                        border="1px solid"
                        borderColor="rgba(217, 188, 146, 0.16)"
                        p={{ base: 3, md: 4 }}
                        boxShadow="0 16px 36px rgba(8, 6, 4, 0.24)"
                    >
                        <Text
                            color={subTextColor}
                            fontSize="0.86rem"
                            lineHeight="1.6"
                            mb={3}
                        >
                            {getAmbientCopy()}
                        </Text>
                        <SessionControls
                            isPaused={isPaused}
                            resumeSession={resumeSession}
                            pauseSession={pauseSession}
                            handleStopClick={handleStopClick}
                            isController={isController}
                            isBusy={isBusy}
                        />
                    </Box>
                )}

                {showStopConfirm && (
                    <SessionStopConfirm
                        endPage={endPage}
                        setEndPage={setEndPage}
                        currentPage={currentPage}
                        handleConfirmStop={handleConfirmStop}
                        handleStopCancel={handleStopCancel}
                    />
                )}
            </Flex>
        </MotionCard>
    );
};

export default SessionTimerCard;
