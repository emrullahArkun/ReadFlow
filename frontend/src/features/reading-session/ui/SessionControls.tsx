import { Button, SimpleGrid } from '@chakra-ui/react';
import { FaPause, FaPlay, FaStop } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

type SessionControlsProps = {
    isPaused: boolean;
    resumeSession: () => Promise<void>;
    pauseSession: () => Promise<void>;
    handleStopClick: () => void;
    isController: boolean;
    isBusy: boolean;
};

function SessionControls({
    isPaused,
    resumeSession,
    pauseSession,
    handleStopClick,
    isController,
    isBusy,
}: SessionControlsProps) {
    const { t } = useTranslation();

    return (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w="full">
            {isPaused ? (
                <Button
                    size="lg"
                    w="full"
                    h={{ base: '60px', md: '64px' }}
                    leftIcon={<FaPlay />}
                    onClick={resumeSession}
                    isDisabled={!isController || isBusy}
                    isLoading={isBusy}
                    fontSize="md"
                    fontWeight="700"
                    borderRadius="2xl"
                    bg="#d9bc92"
                    color="#18120f"
                    boxShadow="0 14px 24px rgba(8, 6, 4, 0.18)"
                    _hover={{ transform: 'translateY(-1px)', bg: '#e6ccaa' }}
                    transition="all 0.15s"
                >
                    {t('readingSession.controls.resume')}
                </Button>
            ) : (
                <Button
                    size="lg"
                    bg="#95a17f"
                    color="#18120f"
                    w="full"
                    h={{ base: '60px', md: '64px' }}
                    leftIcon={<FaPause />}
                    onClick={pauseSession}
                    isDisabled={!isController || isBusy}
                    isLoading={isBusy}
                    fontSize="md"
                    fontWeight="700"
                    borderRadius="2xl"
                    boxShadow="0 14px 24px rgba(8, 6, 4, 0.18)"
                    _hover={{ transform: 'translateY(-1px)', bg: '#a9b695' }}
                    transition="all 0.15s"
                >
                    {t('readingSession.controls.pause')}
                </Button>
            )}

            <Button
                size="lg"
                w="full"
                h={{ base: '60px', md: '64px' }}
                leftIcon={<FaStop />}
                onClick={handleStopClick}
                isDisabled={!isController || isBusy}
                isLoading={isBusy}
                color="#fff4ef"
                borderRadius="2xl"
                bg="linear-gradient(180deg, rgba(207, 109, 88, 0.96) 0%, rgba(168, 72, 58, 0.96) 100%)"
                boxShadow="0 14px 24px rgba(74, 22, 14, 0.28)"
                _hover={{
                    bg: 'linear-gradient(180deg, rgba(220, 122, 101, 0.98) 0%, rgba(182, 82, 67, 0.98) 100%)',
                    transform: 'translateY(-1px)',
                }}
                fontSize="md"
                fontWeight="700"
            >
                {t('readingSession.controls.stop')}
            </Button>
        </SimpleGrid>
    );
}

export default SessionControls;
