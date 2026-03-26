import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAddDiscoveryBook } from './useAddDiscoveryBook';

const mockToast = vi.fn();
const mockClose = vi.fn();
const mockCreate = vi.fn();
const mockBuildLibraryBookPayload = vi.fn((book) => ({ isbn: book.isbn, title: book.title }));

vi.mock('../../auth/model', () => ({
    useAuth: () => ({
        token: 'test-token',
        user: { email: 'reader@example.com' },
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

vi.mock('@chakra-ui/react', async () => {
    const actual = await vi.importActual('@chakra-ui/react');
    return {
        ...actual,
        useToast: () => {
            mockToast.close = mockClose;
            return mockToast;
        },
    };
});

vi.mock('../../library/api', () => ({
    booksApi: {
        create: (...args) => mockCreate(...args),
    },
    buildLibraryBookPayload: (...args) => mockBuildLibraryBookPayload(...args),
}));

const createQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
    },
});

describe('useAddDiscoveryBook', () => {
    let queryClient;

    const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = createQueryClient();
        mockCreate.mockResolvedValue({ id: 99 });
    });

    it('removes the added book from cached discovery sections without invalidating discovery', async () => {
        queryClient.setQueryData(['discovery', 'reader@example.com'], {
            byAuthor: {
                authors: ['Author'],
                books: [
                    { isbn: 'keep-author', title: 'Keep Author' },
                    { isbn: 'remove-me', title: 'Remove Me' },
                ],
            },
            byCategory: {
                categories: ['Category'],
                books: [
                    { isbn: 'remove-me', title: 'Remove Me' },
                    { isbn: 'keep-category', title: 'Keep Category' },
                ],
            },
            bySearch: {
                queries: ['query'],
                books: [
                    { isbn: 'keep-search', title: 'Keep Search' },
                    { isbn: 'remove-me', title: 'Remove Me' },
                ],
            },
        });

        const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
        const { result } = renderHook(() => useAddDiscoveryBook(), { wrapper });

        await act(async () => {
            await result.current.mutateAsync({ isbn: 'remove-me', title: 'Remove Me' });
        });

        await waitFor(() => {
            expect(queryClient.getQueryData(['discovery', 'reader@example.com']).byAuthor.books)
                .toEqual([{ isbn: 'keep-author', title: 'Keep Author' }]);
        });

        const discoveryData = queryClient.getQueryData(['discovery', 'reader@example.com']);
        expect(discoveryData.byCategory.books).toEqual([{ isbn: 'keep-category', title: 'Keep Category' }]);
        expect(discoveryData.bySearch.books).toEqual([{ isbn: 'keep-search', title: 'Keep Search' }]);
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['myBooks'] });
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['ownedIsbns', 'reader@example.com'] });
        expect(invalidateSpy).not.toHaveBeenCalledWith({ queryKey: ['discovery'] });
        expect(mockBuildLibraryBookPayload).toHaveBeenCalledWith({ isbn: 'remove-me', title: 'Remove Me' });
        expect(mockClose).toHaveBeenCalledWith('add-book-toast');
        expect(mockToast).toHaveBeenCalled();
    });
});
