import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBook, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

import { useAnimation } from '../../context/AnimationContext';
import { useReadingSessionContext } from '../../context/ReadingSessionContext';
import LanguageSwitcher from './LanguageSwitcher';
import './Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const { registerTarget } = useAnimation();
    const { activeSession } = useReadingSessionContext();

    const isStatsPage = location.pathname.match(/\/books\/\d+\/stats/);
    const isSessionPage = location.pathname.match(/\/books\/\d+\/session/);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/' || location.pathname === '/discovery';
        return location.pathname === path;
    };

    const navItems = [
        { to: '/', label: t('navbar.discovery') },
        { to: '/goals', label: t('navbar.goals') },
        { to: '/search', label: t('navbar.search') },
        { to: '/my-books', label: t('navbar.myBooks'), ref: registerTarget },
    ];

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaBook /> {t('navbar.brand')}
                </Link>
            </div>
            <div className="navbar-menu">
                {user ? (
                    <>
                        <div className="navbar-nav">
                            {navItems.map(item => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    className={`navbar-item${isActive(item.to) ? ' active' : ''}`}
                                    ref={item.ref || null}
                                >
                                    <span className="navbar-text">{item.label}</span>
                                    {isActive(item.to) && (
                                        <motion.div
                                            layoutId="nav-indicator"
                                            className="nav-indicator"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            ))}

                            <AnimatePresence>
                                {activeSession && (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 'auto', opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        style={{ display: 'flex', overflow: 'hidden', height: '100%' }}
                                    >
                                        <Link
                                            to={`/books/${activeSession.bookId}/session`}
                                            className={`navbar-item${isSessionPage ? ' active' : ''}`}
                                        >
                                            <span className="navbar-text">{t('navbar.session')}</span>
                                            {isSessionPage && (
                                                <motion.div
                                                    layoutId="nav-indicator"
                                                    className="nav-indicator"
                                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                                />
                                            )}
                                        </Link>
                                    </motion.div>
                                )}

                                {(isStatsPage && !isSessionPage) && (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: 'auto', opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                                        style={{ display: 'flex', overflow: 'hidden', height: '100%' }}
                                    >
                                        <Link
                                            to={location.pathname}
                                            className="navbar-item active"
                                        >
                                            <span className="navbar-text">{t('navbar.stats')}</span>
                                            <motion.div
                                                layoutId="nav-indicator"
                                                className="nav-indicator"
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="navbar-separator" />

                        <button onClick={handleLogout} className="navbar-item logout-btn">
                            <FaSignOutAlt />
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="navbar-item">
                        <FaSignInAlt /> {t('navbar.login')}
                    </Link>
                )}
                <LanguageSwitcher />
            </div>
        </nav>
    );
}

export default Navbar;
