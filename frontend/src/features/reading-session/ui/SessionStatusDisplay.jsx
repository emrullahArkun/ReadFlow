import { Box, HStack, Icon, Text } from '@chakra-ui/react';
import { FaBookOpen } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { READING_SESSION_PHASES } from '../model/readingSessionMachine';

function SessionStatusDisplay({
    brandColor,
    formattedTime,
    isPaused,
    isBusy,
    sessionPhase,
}) {
    const { t } = useTranslation();

    return (
        <>
            <HStack align="center" color={brandColor} spacing={2}>
                <Icon as={FaBookOpen} boxSize={3.5} />
                <Text fontWeight="600" letterSpacing="wider" textTransform="uppercase" fontSize="xs">
                    {t('readingSession.activeSession')}
                </Text>
            </HStack>

            <Box>
                <Text
                    fontSize={{ base: '6xl', md: '8xl' }}
                    fontWeight="bold"
                    fontFamily="monospace"
                    color={isPaused ? 'gray.500' : 'white'}
                    lineHeight="1"
                >
                    {formattedTime}
                </Text>
                <Text
                    color={isPaused ? 'orange.300' : 'gray.500'}
                    mt={2}
                    fontWeight="500"
                    fontSize="sm"
                    letterSpacing="wide"
                >
                    {getSessionStatusLabel({ isPaused, isBusy, sessionPhase, t })}
                </Text>
            </Box>
        </>
    );
}

function getSessionStatusLabel({ isPaused, isBusy, sessionPhase, t }) {
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
