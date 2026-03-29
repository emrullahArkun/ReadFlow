import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useBookSearch } from './useBookSearch';
import { discoveryApi } from '../../discovery/api';
import * as AuthModelModule from '../../auth/model';

const mockMutateAsync = vi.fn();

vi.mock('./useAddSearchResultToLibrary.jsx', () => ({
    useAddSearchResultToLibrary: () => ({
        mutateAsync: mockMutateAsync,
    }),
}));

vi.mock('../../discovery/api', () => ({
    discoveryApi: {
        search: vi.fn(),
        logSearch: vi.fn(),
        getByRecentSearches: vi.fn(),
    },
}));

describe('useBookSearch', () => {
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
                mutations: { retry: false },
            },
        });

        vi.spyOn(AuthModelModule, 'useAuth').mockReturnValue({
            token: 'token',
            user: { email: 'reader@example.com' },
        });

        discoveryApi.getByRecentSearches.mockResolvedValue({ queries: ['Dune', 'Sapiens'], books: [] });
        discoveryApi.search.mockResolvedValue({ items: [{ title: 'Dune' }], totalItems: 1 });
        discoveryApi.logSearch.mockResolvedValue(null);
        mockMutateAsync.mockResolvedValue({ id: 1 });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        queryClient.clear();
    });

    it('loads recent searches for the authenticated user', async () => {
        const { result } = renderHook(() => useBookSearch(), { wrapper });

        await waitFor(() => {
            expect(result.current.recentSearches).toEqual(['Dune', 'Sapiens']);
        });

        expect(discoveryApi.getByRecentSearches).toHaveBeenCalledTimes(1);
    });

    it('opens history only when recent searches exist and closes it on submit', async () => {
        const { result } = renderHook(() => useBookSearch(), { wrapper });

        await waitFor(() => {
            expect(result.current.recentSearches).toHaveLength(2);
        });

        act(() => {
            result.current.openHistory();
        });
        expect(result.current.isHistoryOpen).toBe(true);

        act(() => {
            result.current.searchBooks('  Dune Messiah  ');
        });

        await waitFor(() => {
            expect(discoveryApi.search).toHaveBeenCalledWith('Dune Messiah', 0, 36);
        });

        expect(result.current.isHistoryOpen).toBe(false);
        expect(result.current.query).toBe('Dune Messiah');
        expect(discoveryApi.logSearch).toHaveBeenCalledWith('Dune Messiah');
    });

    it('lets the user pick a recent search and applies it immediately', async () => {
        const { result } = renderHook(() => useBookSearch(), { wrapper });

        await waitFor(() => {
            expect(result.current.recentSearches).toContain('Dune');
        });

        act(() => {
            result.current.openHistory();
            result.current.selectRecentSearch('Dune');
        });

        await waitFor(() => {
            expect(discoveryApi.search).toHaveBeenCalledWith('Dune', 0, 36);
        });

        expect(result.current.query).toBe('Dune');
        expect(result.current.isHistoryOpen).toBe(false);
    });

    it('does not fetch or open history when the user is unauthenticated', async () => {
        vi.spyOn(AuthModelModule, 'useAuth').mockReturnValue({
            token: null,
            user: null,
        });

        const { result } = renderHook(() => useBookSearch(), { wrapper });

        await waitFor(() => {
            expect(result.current.recentSearches).toEqual([]);
        });

        act(() => {
            result.current.openHistory();
        });

        expect(discoveryApi.getByRecentSearches).not.toHaveBeenCalled();
        expect(result.current.isHistoryOpen).toBe(false);
    });
});
