import apiClient from '../../../shared/api/apiClient';

export const readingSessionBooksApi = {
    getById: (bookId) => apiClient.get(`/api/books/${bookId}`),
};
