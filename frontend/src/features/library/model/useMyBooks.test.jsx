import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMyBooks } from './useMyBooks';
import { useAuth } from '../../auth/model/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { booksApi } from '../api/booksApi';

vi.mock('../../auth/model/AuthContext', () => ({
    useAuth: vi.fn(),
}));

vi.mock('../api/booksApi', () => ({
    booksApi: {
        getAll: vi.fn(),
        delete: vi.fn(),
        deleteAll: vi.fn(),
        updateProgress: vi.fn(),
        updateStatus: vi.fn(),
    },
}));

describe('useMyBooks wrapper tests', () => {
    let queryClient;

    const wrapper = ({ children }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false }
            }
        });
        useAuth.mockReturnValue({ token: 'test-token' });

        booksApi.getAll.mockResolvedValue({ content: [{ id: 1, title: 'Book 1' }], totalPages: 1 });
        booksApi.delete.mockResolvedValue({});
        booksApi.deleteAll.mockResolvedValue({});
        booksApi.updateProgress.mockResolvedValue({});
        booksApi.updateStatus.mockResolvedValue({});
    });

    it('should initialize and return books', async () => {
        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(result.current.books).toHaveLength(1);
        });

        expect(result.current.books[0].title).toBe('Book 1');
        expect(result.current.selectedBooks.size).toBe(0);
    });

    it('should fetch all pages of the library', async () => {
        booksApi.getAll.mockImplementation(async (page) => {
            if (page === 0) {
                return { content: [{ id: 1, title: 'Page 1 Book' }], totalPages: 3 };
            }

            if (page === 1) {
                return { content: [{ id: 2, title: 'Page 2 Book' }], totalPages: 3 };
            }

            return { content: [{ id: 3, title: 'Page 3 Book' }], totalPages: 3 };
        });

        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(result.current.books).toHaveLength(3);
        });

        expect(booksApi.getAll).toHaveBeenNthCalledWith(1, 0, 100);
        expect(booksApi.getAll).toHaveBeenCalledWith(1, 100);
        expect(booksApi.getAll).toHaveBeenCalledWith(2, 100);
    });

    it('should request the remaining pages after the first page in parallel', async () => {
        let releaseSecondPage;
        booksApi.getAll.mockImplementation((page) => {
            if (page === 0) {
                return Promise.resolve({ content: [{ id: 1, title: 'Page 1 Book' }], totalPages: 3 });
            }

            if (page === 1) {
                return new Promise((resolve) => {
                    releaseSecondPage = () => resolve({ content: [{ id: 2, title: 'Page 2 Book' }], totalPages: 3 });
                });
            }

            return Promise.resolve({ content: [{ id: 3, title: 'Page 3 Book' }], totalPages: 3 });
        });

        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(booksApi.getAll).toHaveBeenCalledWith(1, 100);
            expect(booksApi.getAll).toHaveBeenCalledWith(2, 100);
        });

        expect(result.current.loading).toBe(true);

        await act(async () => {
            releaseSecondPage();
        });

        await waitFor(() => {
            expect(result.current.books).toHaveLength(3);
        });
    });

    it('should allow toggling selection', async () => {
        const { result } = renderHook(() => useMyBooks(), { wrapper });
        act(() => {
            result.current.toggleSelection(1);
        });
        expect(result.current.selectedBooks.has(1)).toBe(true);
        act(() => {
            result.current.toggleSelection(1);
        });
        expect(result.current.selectedBooks.has(1)).toBe(false);
    });

    it('should call delete mutation', async () => {
        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(result.current.books).toHaveLength(1);
        });

        act(() => {
            result.current.deleteBook(1);
        });

        await waitFor(() => {
            expect(booksApi.delete).toHaveBeenCalledWith(1);
        });
    });

    it('should optimistically remove book before API resolves', async () => {
        let resolveDelete;
        booksApi.delete.mockImplementation(() => new Promise((resolve) => {
            resolveDelete = resolve;
        }));

        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(result.current.books).toHaveLength(1);
        });

        act(() => {
            result.current.deleteBook(1);
        });

        // Book should be gone via optimistic update, before API resolves
        await waitFor(() => {
            expect(result.current.books).toHaveLength(0);
        });

        // API has not resolved yet, but UI already updated
        expect(booksApi.delete).toHaveBeenCalledWith(1);

        // Now resolve the API call
        await act(async () => {
            resolveDelete();
        });
    });

    it('should call deleteAll mutation', async () => {
        const { result } = renderHook(() => useMyBooks(), { wrapper });
        await waitFor(() => expect(result.current.books).toHaveLength(1));

        act(() => {
            result.current.deleteAll();
        });

        await waitFor(() => {
            expect(booksApi.deleteAll).toHaveBeenCalled();
        });
    });

    it('should handle failed deleteAll properly', async () => {
        booksApi.deleteAll.mockRejectedValue(new Error('Delete all err'));
        const { result } = renderHook(() => useMyBooks(), { wrapper });
        await waitFor(() => expect(result.current.books).toHaveLength(1));

        act(() => {
            result.current.deleteAll();
        });

        await waitFor(() => {
            expect(booksApi.deleteAll).toHaveBeenCalled();
        });
    });

    it('should update progress', async () => {
        const { result } = renderHook(() => useMyBooks(), { wrapper });
        await waitFor(() => expect(result.current.books).toHaveLength(1));

        act(() => {
            result.current.updateBookProgress(1, 45);
        });

        await waitFor(() => {
            expect(booksApi.updateProgress).toHaveBeenCalledWith(1, 45);
        });
    });

    it('should handle failed update progress properly', async () => {
        booksApi.updateProgress.mockRejectedValue(new Error('Progress err'));
        const { result } = renderHook(() => useMyBooks(), { wrapper });
        await waitFor(() => expect(result.current.books).toHaveLength(1));

        act(() => {
            result.current.updateBookProgress(1, 45);
        });

        await waitFor(() => {
            expect(booksApi.updateProgress).toHaveBeenCalledWith(1, 45);
        });
    });

    it('should handle optimistic empty data if not token', async () => {
        useAuth.mockReturnValue({ token: null });
        const { result } = renderHook(() => useMyBooks(), { wrapper });

        expect(result.current.books).toHaveLength(0);
        expect(booksApi.getAll).not.toHaveBeenCalled();
    });

    it('should surface an error when the API returns null for the first page', async () => {
        booksApi.getAll.mockResolvedValue(null);
        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.books).toHaveLength(0);
        expect(result.current.error).toBe('Failed to load library');
    });

    it('should handle empty content payloads without crashing pagination', async () => {
        booksApi.getAll.mockResolvedValue({ content: null, totalPages: 0 });
        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.books).toHaveLength(0);
        expect(booksApi.getAll).toHaveBeenCalledTimes(1);
    });

    it('should surface an error when any later page is invalid', async () => {
        booksApi.getAll.mockImplementation(async (page) => {
            if (page === 0) {
                return { content: [{ id: 1, title: 'Page 1 Book' }], totalPages: 2 };
            }

            return null;
        });

        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.books).toHaveLength(0);
        expect(result.current.error).toBe('Failed to load library');
    });

    it('should call updateStatus mutation', async () => {
        const { result } = renderHook(() => useMyBooks(), { wrapper });
        await waitFor(() => expect(result.current.books).toHaveLength(1));

        act(() => {
            result.current.updateBookStatus(1, true);
        });

        await waitFor(() => {
            expect(booksApi.updateStatus).toHaveBeenCalledWith(1, true);
        });
    });

    it('should handle failed updateStatus properly', async () => {
        booksApi.updateStatus.mockRejectedValue(new Error('Status err'));
        const { result } = renderHook(() => useMyBooks(), { wrapper });
        await waitFor(() => expect(result.current.books).toHaveLength(1));

        act(() => {
            result.current.updateBookStatus(1, true);
        });

        await waitFor(() => {
            expect(booksApi.updateStatus).toHaveBeenCalledWith(1, true);
        });
    });

    it('should call deleteSelected and wait for promises', async () => {
        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(result.current.books).toHaveLength(1);
        });

        act(() => {
            result.current.toggleSelection(1);
        });

        await act(async () => {
            await result.current.deleteSelected();
        });

        expect(booksApi.delete).toHaveBeenCalledWith(1);
    });

    it('should handle failed deleteSelected properly', async () => {
        booksApi.delete.mockRejectedValue(new Error('Failed deletion'));
        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(result.current.books).toHaveLength(1);
        });

        act(() => {
            result.current.toggleSelection(1);
        });

        await act(async () => {
            await result.current.deleteSelected();
        });

        expect(booksApi.delete).toHaveBeenCalledWith(1);
    });

    it('should expose the selected-delete error with highest priority', async () => {
        booksApi.delete.mockRejectedValue(new Error('Failed deletion'));
        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(result.current.books).toHaveLength(1);
        });

        act(() => {
            result.current.toggleSelection(1);
        });

        act(() => {
            result.current.deleteSelected();
        });

        await waitFor(() => {
            expect(result.current.deleteError?.message).toBe('Some deletions failed');
        });
    });

    it('should handle mutate onError gracefully', async () => {
        booksApi.delete.mockRejectedValue(new Error('Delete err'));
        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(result.current.books).toHaveLength(1);
        });

        act(() => {
            result.current.deleteBook(1);
        });

        await waitFor(() => {
            expect(booksApi.delete).toHaveBeenCalledWith(1);
        });
    });

    it('should remove a deleted book from the selected set immediately', async () => {
        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(result.current.books).toHaveLength(1);
        });

        act(() => {
            result.current.toggleSelection(1);
        });

        expect(result.current.selectedBooks.has(1)).toBe(true);

        act(() => {
            result.current.deleteBook(1);
        });

        expect(result.current.selectedBooks.has(1)).toBe(false);
    });

    it('should clear selected books after deleteAll settles', async () => {
        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(result.current.books).toHaveLength(1);
        });

        act(() => {
            result.current.toggleSelection(1);
        });

        expect(result.current.selectedBooks.has(1)).toBe(true);

        act(() => {
            result.current.deleteAll();
        });

        await waitFor(() => {
            expect(booksApi.deleteAll).toHaveBeenCalled();
            expect(result.current.selectedBooks.size).toBe(0);
        });
    });

    it('should expose the delete-all error when bulk delete has not failed', async () => {
        booksApi.deleteAll.mockRejectedValue(new Error('Delete all err'));
        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(result.current.books).toHaveLength(1);
        });

        act(() => {
            result.current.deleteAll();
        });

        await waitFor(() => {
            expect(result.current.deleteError?.message).toBe('Delete all err');
        });
    });

    it('should expose the single-delete error when no bulk delete errors exist', async () => {
        booksApi.delete.mockRejectedValue(new Error('Delete err'));
        const { result } = renderHook(() => useMyBooks(), { wrapper });

        await waitFor(() => {
            expect(result.current.books).toHaveLength(1);
        });

        act(() => {
            result.current.deleteBook(1);
        });

        await waitFor(() => {
            expect(result.current.deleteError?.message).toBe('Delete err');
        });
    });
});
