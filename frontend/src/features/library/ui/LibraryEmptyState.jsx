import { Box, Button, Center, Icon, Text } from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../app/router/routes';

function LibraryEmptyState() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Center flexDirection="column" py={16}>
            <Box
                textAlign="center"
                py={12}
                px={8}
                bg="whiteAlpha.50"
                borderRadius="2xl"
                border="1px dashed"
                borderColor="whiteAlpha.200"
                maxW="400px"
            >
                <Icon as={FaSearch} color="gray.400" boxSize={10} mb={4} />
                <Text color="gray.300" fontSize="lg" mb={2}>{t('myBooks.empty.line1')}</Text>
                <Text color="gray.400" fontSize="sm" mb={5}>{t('myBooks.empty.line2')}</Text>
                <Button
                    size="sm"
                    colorScheme="teal"
                    variant="outline"
                    onClick={() => navigate(ROUTES.SEARCH)}
                >
                    {t('search.button')}
                </Button>
            </Box>
        </Center>
    );
}

export default LibraryEmptyState;
