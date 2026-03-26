import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';
import { ROUTES } from './routes';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import MainLayout from '../layouts/MainLayout';

const SearchPage = lazy(() => import('../../features/search/pages/SearchPage'));
const DiscoveryPage = lazy(() => import('../../features/discovery/pages/DiscoveryPage'));
const GoalsPage = lazy(() => import('../../features/goals/pages/GoalsPage'));
const LibraryPage = lazy(() => import('../../features/library/pages/LibraryPage'));
const BookStatsPage = lazy(() => import('../../features/library/pages/BookStatsPage'));
const ReadingSessionPage = lazy(() => import('../../features/reading-session/pages/ReadingSessionPage'));
const StatsOverviewPage = lazy(() => import('../../features/stats/pages/StatsOverviewPage'));
const AchievementsPage = lazy(() => import('../../features/stats/pages/AchievementsPage'));
const LoginPage = lazy(() => import('../../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../../features/auth/pages/RegisterPage'));

const PageLoader = () => (
    <Center h="100vh" w="full" bg="transparent">
        <Spinner size="xl" color="teal.200" thickness="4px" />
    </Center>
);

const AppRouter = () => {
    return (
        <Router>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route element={<MainLayout />}>
                            <Route path={ROUTES.HOME} element={<SearchPage />} />
                            <Route path={ROUTES.SEARCH} element={<SearchPage />} />
                        </Route>

                        <Route element={<MainLayout fullWidth={true} />}>
                            <Route path={ROUTES.DISCOVERY} element={<DiscoveryPage />} />
                            <Route path={ROUTES.GOALS} element={<GoalsPage />} />
                            <Route path={ROUTES.MY_BOOKS} element={<LibraryPage />} />
                            <Route path={ROUTES.STATS} element={<StatsOverviewPage />} />
                            <Route path={ROUTES.ACHIEVEMENTS} element={<AchievementsPage />} />
                            <Route path={ROUTES.BOOK_STATS(':id')} element={<BookStatsPage />} />
                            <Route path={ROUTES.BOOK_SESSION(':id')} element={<ReadingSessionPage />} />
                        </Route>
                    </Route>

                    <Route
                        path={ROUTES.LOGIN}
                        element={(
                            <PublicRoute>
                                <LoginPage />
                            </PublicRoute>
                        )}
                    />
                    <Route
                        path={ROUTES.REGISTER}
                        element={(
                            <PublicRoute>
                                <RegisterPage />
                            </PublicRoute>
                        )}
                    />
                </Routes>
            </Suspense>
        </Router>
    );
};

export default AppRouter;
