import { Button, Flex } from '@chakra-ui/react';
import { FaTrash, FaTrashAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

function LibraryActionsBar({
    selectedCount,
    onDeleteSelected,
    onDeleteAll,
}) {
    const { t } = useTranslation();

    return (
        <Flex justify="flex-end" align="center" mb={6} wrap="wrap" gap={3}>
            {selectedCount > 0 && (
                <Button
                    size="sm"
                    leftIcon={<FaTrash />}
                    onClick={onDeleteSelected}
                    bg="whiteAlpha.100"
                    color="red.300"
                    border="1px solid"
                    borderColor="red.800"
                    _hover={{ bg: 'red.900', borderColor: 'red.700' }}
                    _active={{ bg: 'red.800' }}
                >
                    {t('myBooks.deleteSelectedCount', { count: selectedCount })}
                </Button>
            )}
            <Button
                size="sm"
                leftIcon={<FaTrashAlt />}
                onClick={onDeleteAll}
                bg="whiteAlpha.100"
                color="gray.300"
                border="1px solid"
                borderColor="whiteAlpha.200"
                _hover={{ color: 'red.300', bg: 'whiteAlpha.200', borderColor: 'red.800' }}
                _active={{ bg: 'whiteAlpha.300' }}
            >
                {t('myBooks.deleteAll')}
            </Button>
        </Flex>
    );
}

export default LibraryActionsBar;
