import apiClient from '../../../shared/api/apiClient';

export const goalsApi = {
    getBooks: () => apiClient.get('/api/books/with-goals'),
    getStreak: () => apiClient.get('/api/stats/streak'),
};
