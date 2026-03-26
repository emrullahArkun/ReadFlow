import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/model';
import { booksApi, buildLibraryBookPayload } from '../../library/api';

const TOAST_STYLE = {
    containerStyle: { marginTop: '80px' },
    position: 'top',
    duration: 3000,
};

const ToastMessage = ({ bgColor, children }) => (
    <div style={{
        backgroundColor: bgColor,
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontWeight: '600',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
    }}>
        {children}
    </div>
);

const removeBookFromDiscoverySection = (section, isbn) => ({
    ...section,
    books: (section?.books || []).filter((book) => book.isbn !== isbn),
});

export const useAddDiscoveryBook = () => {
    const { token, user } = useAuth();
    const toast = useToast();
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (book) => {
            if (!token) {
                throw new Error(t('search.toast.loginRequired'));
            }

            return booksApi.create(buildLibraryBookPayload(book));
        },
        onSuccess: (_, addedBook) => {
            queryClient.setQueryData(['discovery', user?.email], (currentDiscovery) => {
                if (!currentDiscovery) {
                    return currentDiscovery;
                }

                return {
                    byAuthor: removeBookFromDiscoverySection(currentDiscovery.byAuthor, addedBook.isbn),
                    byCategory: removeBookFromDiscoverySection(currentDiscovery.byCategory, addedBook.isbn),
                    bySearch: removeBookFromDiscoverySection(currentDiscovery.bySearch, addedBook.isbn),
                };
            });
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
            queryClient.invalidateQueries({ queryKey: ['ownedIsbns', user?.email] });
            toast.close('add-book-toast');
            toast({
                id: 'add-book-toast',
                ...TOAST_STYLE,
                render: () => (
                    <ToastMessage bgColor="#38A169">
                        {t('search.toast.successTitle')}
                    </ToastMessage>
                )
            });
        },
        onError: (err) => {
            const isDuplicate = err.status === 409;
            const message = isDuplicate ? t('search.toast.duplicate') : (err.message || t('search.toast.addFailed'));
            const bgColor = isDuplicate ? '#DD6B20' : '#E53E3E';

            toast.close('add-book-toast');
            toast({
                id: 'add-book-toast',
                ...TOAST_STYLE,
                render: () => (
                    <ToastMessage bgColor={bgColor}>
                        {message}
                    </ToastMessage>
                )
            });
        }
    });
};
