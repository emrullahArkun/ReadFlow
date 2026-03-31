import { useState } from 'react';
import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/model';
import { booksApi } from '../api';
import type { Book } from '../../../shared/types/books';

const FETCH_PAGE_SIZE = 100;

type BooksQueryKey = readonly ['myBooks', string | null];
type MutationContext = {
    previousData?: Book[] | undefined;
};

type BookId = number;
type UpdateProgressVars = {
    id: number;
    currentPage: number;
};
type UpdateStatusVars = {
    id: number;
    completed: boolean;
};

const createOptimisticMutation = <TVars,>(
    queryClient: QueryClient,
    queryKey: BooksQueryKey,
    mutationFn: (vars: TVars) => Promise<unknown>,
    updater: (prev: Book[], vars: TVars) => Book[]
) => ({
    mutationFn,
    onMutate: async (vars: TVars): Promise<MutationContext> => {
        await queryClient.cancelQueries({ queryKey: ['myBooks'] });
        const previousData = queryClient.getQueryData<Book[]>(queryKey);
        if (previousData) {
            queryClient.setQueryData<Book[]>(queryKey, updater(previousData, vars));
        }
        return { previousData };
    },
    onError: (_err: Error, _vars: TVars, context: MutationContext | undefined) => {
        if (context?.previousData) {
            queryClient.setQueryData<Book[]>(queryKey, context.previousData);
        }
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['myBooks'] });
    },
});

const fetchAllBooks = async (): Promise<Book[]> => {
    const firstPage = await booksApi.getAll(0, FETCH_PAGE_SIZE);

    if (!firstPage) {
        throw new Error('Failed to load library');
    }

    const totalPages = Math.max(firstPage.totalPages || 0, 1);
    const firstPageBooks = firstPage.content || [];

    if (totalPages === 1) {
        return firstPageBooks;
    }

    const remainingPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) => booksApi.getAll(index + 1, FETCH_PAGE_SIZE))
    );

    if (remainingPages.some((page) => !page)) {
        throw new Error('Failed to load library');
    }

    return [
        ...firstPageBooks,
        ...remainingPages.flatMap((page) => page?.content || []),
    ];
};

export const useMyBooks = () => {
    const [selectedBooks, setSelectedBooks] = useState<Set<number>>(new Set());
    const { token } = useAuth();
    const queryClient = useQueryClient();

    const queryKey: BooksQueryKey = ['myBooks', token];

    const { data, isLoading: loading, error } = useQuery<Book[], Error>({
        queryKey,
        queryFn: async () => {
            if (!token) return [];
            return fetchAllBooks();
        },
        enabled: !!token,
    });

    const books = data || [];

    const deleteMutation = useMutation<unknown, Error, BookId, MutationContext>(
        createOptimisticMutation(
            queryClient,
            queryKey,
            async (id) => booksApi.delete(id),
            (prev, id) => prev.filter((book) => book.id !== id)
        )
    );

    const deleteAllMutation = useMutation<unknown, Error, void, MutationContext>({
        ...createOptimisticMutation(
            queryClient,
            queryKey,
            async () => booksApi.deleteAll(),
            () => []
        ),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
            setSelectedBooks(new Set());
        },
    });

    const updateProgressMutation = useMutation<unknown, Error, UpdateProgressVars, MutationContext>(
        createOptimisticMutation(
            queryClient,
            queryKey,
            async ({ id, currentPage }) => booksApi.updateProgress(id, currentPage),
            (prev, { id, currentPage }) => prev.map((book) => book.id === id ? { ...book, currentPage } : book)
        )
    );

    const updateStatusMutation = useMutation<unknown, Error, UpdateStatusVars, MutationContext>(
        createOptimisticMutation(
            queryClient,
            queryKey,
            async ({ id, completed }) => booksApi.updateStatus(id, completed),
            (prev, { id, completed }) => prev.map((book) => book.id === id ? { ...book, completed } : book)
        )
    );

    const toggleSelection = (id: number) => {
        setSelectedBooks((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const deleteBook = (id: number) => {
        deleteMutation.mutate(id);
        setSelectedBooks((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const deleteSelectedMutation = useMutation<unknown, Error, number[], MutationContext>({
        ...createOptimisticMutation(
            queryClient,
            queryKey,
            async (ids) => {
                const results = await Promise.allSettled(ids.map((id) => booksApi.delete(id)));
                if (results.some((result) => result.status === 'rejected')) {
                    throw new Error('Some deletions failed');
                }
            },
            (prev, ids) => prev.filter((book) => !ids.includes(book.id))
        ),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
            setSelectedBooks(new Set());
        },
    });

    const deleteSelected = () => {
        deleteSelectedMutation.mutate(Array.from(selectedBooks));
    };

    const deleteAll = () => {
        deleteAllMutation.mutate();
    };

    const updateBookProgress = (id: number, currentPage: number) => {
        updateProgressMutation.mutate({ id, currentPage });
    };

    const updateBookStatus = (id: number, completed: boolean) => {
        updateStatusMutation.mutate({ id, completed });
    };

    const deleteError = deleteSelectedMutation.error ?? deleteAllMutation.error ?? deleteMutation.error;

    return {
        books,
        loading,
        error: error ? error.message : null,
        selectedBooks,
        toggleSelection,
        deleteBook,
        deleteSelected,
        deleteAll,
        updateBookProgress,
        updateBookStatus,
        deleteError,
        updateProgressError: updateProgressMutation.error,
    };
};
