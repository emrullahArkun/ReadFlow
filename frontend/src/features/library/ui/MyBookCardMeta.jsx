import { Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

function MyBookCardMeta({ title, authorText, currentPage, pageCount }) {
    const { t } = useTranslation();

    return (
        <VStack align="start" spacing={0} mt={2} px={1}>
            <Text
                fontSize="sm"
                fontWeight="600"
                color="white"
                noOfLines={1}
                lineHeight="1.3"
            >
                {title}
            </Text>
            {authorText && (
                <Text fontSize="xs" color="gray.500" noOfLines={1}>
                    {authorText}
                </Text>
            )}
            {pageCount > 0 && (
                <Text fontSize="xs" color="gray.400" mt={0.5}>
                    {t('bookStats.pageProgress', {
                        current: currentPage ?? 0,
                        total: pageCount,
                    })}
                </Text>
            )}
        </VStack>
    );
}

export default MyBookCardMeta;
