import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMyBooks } from '../model/useMyBooks';
import ConfirmDialog from '../../../shared/ui/ConfirmDialog';
import MyBookCard from '../ui/MyBookCard';
import LibraryActionsBar from '../ui/LibraryActionsBar';
import LibraryEmptyState from '../ui/LibraryEmptyState';
import LibraryPagination from '../ui/LibraryPagination';
import {
    Flex,
    Center,
    Box,
    useToast,
    useDisclosure,
} from '@chakra-ui/react';

function LibraryPage() {
    const { t } = useTranslation();

    const {
        books,
        loading,
        error,
        selectedBooks,
        toggleSelection,
        deleteSelected,
        deleteAll,
        updateBookProgress,
        page,
        setPage,
        totalPages,
        deleteError
    } = useMyBooks();

    const toast = useToast();

    // Dialog States
    const { isOpen: isDeleteAllOpen, onOpen: onDeleteAllOpen, onClose: onDeleteAllClose } = useDisclosure();
    const { isOpen: isDeleteSelectedOpen, onOpen: onDeleteSelectedOpen, onClose: onDeleteSelectedClose } = useDisclosure();

    useEffect(() => {
        if (deleteError) {
            toast({
                title: t('myBooks.error', { message: deleteError.message }),
                status: 'error',
                duration: 5000,
                isClosable: true
            });
        }
    }, [deleteError, toast, t]);

    const confirmDeleteSelected = () => {
        deleteSelected();
        onDeleteSelectedClose();
    };

    const confirmDeleteAll = () => {
        deleteAll();
        onDeleteAllClose();
    };

    if (loading && page === 0 && books.length === 0) return <Center h="200px" color="white">{t('myBooks.loading')}</Center>;
    if (error) return <Center h="200px" color="red.300">{t('myBooks.error', { message: error })}</Center>;

    return (
        <Box w="100%" px={{ base: 4, md: 8 }} py={6} minH="calc(100vh - 80px)">
            <LibraryActionsBar
                selectedCount={selectedBooks.size}
                onDeleteSelected={onDeleteSelectedOpen}
                onDeleteAll={onDeleteAllOpen}
            />

            {books.length === 0 ? (
                <LibraryEmptyState />
            ) : (
                <>
                    <Flex wrap="wrap" gap={6} justify="flex-start" alignContent="flex-start">
                        {books.map(book => (
                            <Box key={book.id} w={{ base: "calc(50% - 12px)", sm: "200px" }} flexShrink={0}>
                                <MyBookCard
                                    book={book}
                                    isSelected={selectedBooks.has(book.id)}
                                    onToggleSelect={toggleSelection}
                                    onUpdateProgress={updateBookProgress}
                                />
                            </Box>
                        ))}
                    </Flex>

                    <LibraryPagination
                        page={page}
                        totalPages={totalPages}
                        onPreviousPage={() => setPage((currentPage) => Math.max(0, currentPage - 1))}
                        onNextPage={() => setPage((currentPage) => Math.min(totalPages - 1, currentPage + 1))}
                    />

                    <ConfirmDialog
                        isOpen={isDeleteSelectedOpen}
                        onClose={onDeleteSelectedClose}
                        onConfirm={confirmDeleteSelected}
                        title={t('myBooks.confirmDeleteSelectedTitle')}
                        body={t('myBooks.confirmDeleteSelected', { count: selectedBooks.size })}
                        confirmLabel={t('common.delete')}
                        cancelLabel={t('common.cancel')}
                    />

                    <ConfirmDialog
                        isOpen={isDeleteAllOpen}
                        onClose={onDeleteAllClose}
                        onConfirm={confirmDeleteAll}
                        title={t('myBooks.confirmDeleteAllTitle')}
                        body={t('myBooks.confirmDeleteAll')}
                        confirmLabel={t('common.deleteAll')}
                        cancelLabel={t('common.cancel')}
                    />
                </>
            )}
        </Box>
    );
}

export default LibraryPage;
