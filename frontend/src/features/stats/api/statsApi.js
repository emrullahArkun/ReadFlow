import apiClient from '../../../api/apiClient';

const statsApi = {
    getOverview: () => apiClient.get('/api/stats/overview'),
    getAchievements: () => apiClient.get('/api/stats/achievements'),
};

export default statsApi;
