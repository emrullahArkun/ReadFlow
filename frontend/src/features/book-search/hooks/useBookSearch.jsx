import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAddBookToLibrary } from '../../books/hooks/useAddBookToLibrary';
import discoveryApi from '../../discovery/api/discoveryApi';

// Constants for debounced logging
const LOG_DEBOUNCE_MS = 2000; // Wait 2 seconds after last keystroke
const MIN_QUERY_LENGTH = 3;  // Minimum 3 characters to log

export const useBookSearch = () => {
    const [query, setQuery] = useState('');
    const [searchTerm, setSearchTerm] = useState(''); // Only updates on Enter/button click
    const { token } = useAuth();

    // Track last logged query to prevent duplicates
    const lastLoggedQuery = useRef('');
    const logTimeoutRef = useRef(null);

    // Debounced search logging - logs after user stops typing for 2 seconds
    useEffect(() => {
        if (logTimeoutRef.current) {
            clearTimeout(logTimeoutRef.current);
        }

        const trimmedQuery = query.trim();

        if (trimmedQuery.length >= MIN_QUERY_LENGTH &&
            trimmedQuery.toLowerCase() !== lastLoggedQuery.current.toLowerCase() &&
            token) {

            logTimeoutRef.current = setTimeout(() => {
                discoveryApi.logSearch(trimmedQuery).then(() => {
                    lastLoggedQuery.current = trimmedQuery;
                }).catch(() => {
                    // Silently ignore logging errors
                });
            }, LOG_DEBOUNCE_MS);
        }

        return () => {
            if (logTimeoutRef.current) {
                clearTimeout(logTimeoutRef.current);
            }
        };
    }, [query, token]);

    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetching,
        isLoading
    } = useInfiniteQuery({
        queryKey: ['books', searchTerm],
        queryFn: async ({ pageParam = 0 }) => {
            if (!searchTerm.trim()) return { items: [], totalItems: 0 };
            return discoveryApi.search(searchTerm.trim(), pageParam, 36);
        },
        getNextPageParam: (lastPage, allPages) => {
            const loadedItems = allPages.flatMap(p => p.items || []).length;
            if (loadedItems < (lastPage.totalItems || 0)) {
                return loadedItems;
            }
            return undefined;
        },
        enabled: !!searchTerm.trim(),
        initialPageParam: 0
    });

    const results = data ? data.pages.flatMap(page => page.items || []) : [];

    const addBookMutation = useAddBookToLibrary();

    // Clear results when input is emptied
    useEffect(() => {
        if (!query.trim()) {
            setSearchTerm('');
        }
    }, [query]);

    const searchBooks = (e) => {
        if (e) e.preventDefault();
        setSearchTerm(query.trim());
    };

    return {
        query, setQuery,
        results,
        error: error ? error.message : null,
        hasMore: hasNextPage,
        loading: isLoading || isFetching,
        searchBooks,
        loadMore: fetchNextPage,
        addBookToLibrary: addBookMutation.mutateAsync,
    };
};
