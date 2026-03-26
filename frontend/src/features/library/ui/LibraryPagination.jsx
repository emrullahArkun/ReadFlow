import { Flex, IconButton, Text } from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function LibraryPagination({
    page,
    totalPages,
    onPreviousPage,
    onNextPage,
}) {
    const { t } = useTranslation();

    if (totalPages <= 1) {
        return null;
    }

    return (
        <Flex justify="center" align="center" mt={10} gap={4}>
            <IconButton
                icon={<FaChevronLeft />}
                onClick={onPreviousPage}
                isDisabled={page === 0}
                color="white"
                variant="ghost"
                fontSize="lg"
                aria-label={t('common.previousPage')}
                _hover={{ bg: 'whiteAlpha.100' }}
            />
            <Text color="gray.500" fontSize="sm">
                {page + 1} / {totalPages}
            </Text>
            <IconButton
                icon={<FaChevronRight />}
                onClick={onNextPage}
                isDisabled={page >= totalPages - 1}
                color="white"
                variant="ghost"
                fontSize="lg"
                aria-label={t('common.nextPage')}
                _hover={{ bg: 'whiteAlpha.100' }}
            />
        </Flex>
    );
}

export default LibraryPagination;
