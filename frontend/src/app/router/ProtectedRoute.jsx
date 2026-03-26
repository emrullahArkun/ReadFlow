import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/model';
import { ROUTES } from './routes';
import { ReadingSessionProvider } from '../../features/reading-session/model/ReadingSessionContext';
import AuthGateLoader from './AuthGateLoader';

const ProtectedRoute = ({ requireAdmin }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <AuthGateLoader />;
    }

    if (!user) {
        return <Navigate to={ROUTES.LOGIN} replace state={{ from: location }} />;
    }

    if (requireAdmin && user.role !== 'ADMIN') {
        return <Navigate to={ROUTES.HOME} replace />;
    }

    return (
        <ReadingSessionProvider>
            <Outlet />
        </ReadingSessionProvider>
    );
};

export default ProtectedRoute;
