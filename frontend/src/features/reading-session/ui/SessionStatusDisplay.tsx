import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import { FaBookOpen } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { READING_SESSION_PHASES } from '../model/readingSessionMachine';
import type { ReadingSessionPhase } from '../../../shared/types/sessions';

type TranslationFn = (key: string) => string;

type SessionStatusDisplayProps = {
    brandColor: string;
    formattedTime: string;
    isPaused: boolean;
    isBusy: boolean;
    sessionPhase: ReadingSessionPhase;
};

function SessionStatusDisplay({
    brandColor,
    formattedTime,
    isPaused,
    isBusy,
    sessionPhase,
}: SessionStatusDisplayProps) {
    const { t } = useTranslation();

    return (
        <VStack align="stretch" spacing={2} pt={{ base: 1, md: 2 }} pl={{ base: 1, md: 2 }}>
            <HStack align="center" color={brandColor} spacing={2}>
                <Icon as={FaBookOpen} boxSize={3.5} />
                <Text fontWeight="700" letterSpacing="0.14em" textTransform="uppercase" fontSize="0.68rem">
                    {t('readingSession.activeSession')}
                </Text>
            </HStack>

            <Box>
                <Text
                    fontSize={{ base: '3.35rem', md: '4.4rem', xl: '5rem' }}
                    fontWeight="bold"
                    fontFamily="heading"
                    letterSpacing="-0.04em"
                    color={isPaused ? 'rgba(217, 204, 182, 0.56)' : '#f4ead7'}
                    lineHeight="0.94"
                >
                    {formattedTime}
                </Text>
                <Text
                    color={isPaused ? brandColor : 'rgba(217, 204, 182, 0.58)'}
                    mt={1.5}
                    fontWeight="600"
                    fontSize="0.72rem"
                    letterSpacing="0.12em"
                    textTransform="uppercase"
                >
                    {getSessionStatusLabel({ isPaused, isBusy, sessionPhase, t })}
                </Text>
            </Box>
        </VStack>
    );
}

function getSessionStatusLabel({
    isPaused,
    isBusy,
    sessionPhase,
    t,
}: {
    isPaused: boolean;
    isBusy: boolean;
    sessionPhase: ReadingSessionPhase;
    t: TranslationFn;
}) {
    if (isPaused) {
        return t('readingSession.paused');
    }

    if (isBusy && sessionPhase === READING_SESSION_PHASES.STOPPING) {
        return t('readingSession.controls.stop');
    }

    if (isBusy && sessionPhase === READING_SESSION_PHASES.PAUSING) {
        return t('readingSession.controls.pause');
    }

    if (isBusy && sessionPhase === READING_SESSION_PHASES.RESUMING) {
        return t('readingSession.controls.resume');
    }

    return t('readingSession.readingPrompt');
}

export default SessionStatusDisplay;
