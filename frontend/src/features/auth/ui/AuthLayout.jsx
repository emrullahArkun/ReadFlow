import { useTranslation } from 'react-i18next';
import { MdLibraryBooks, MdTimer, MdShowChart } from 'react-icons/md';
import { GiBookshelf } from 'react-icons/gi';
import { Card } from '../../../shared/ui/Card';
import LanguageSwitcher from '../../../app/navigation/LanguageSwitcher';
import './AuthLayout.css';

export const AuthLayout = ({ children, title, icon, variant = 'default' }) => {
    const { t } = useTranslation();

    return (
        <div className={`auth-layout auth-layout--${variant}`}>
            <div className="auth-layout__language-switcher">
                <LanguageSwitcher variant="auth" />
            </div>

            <div className="auth-layout__brand">
                <div className="auth-layout__brand-content">
                    <span className="auth-layout__brand-kicker">{t('auth.brand.kicker')}</span>
                    <div className="auth-layout__logo-large">
                        <span className="auth-layout__icon-wrapper">
                            <GiBookshelf />
                        </span>
                        <span className="auth-layout__brand-name">{t('auth.brand.appName')}</span>
                    </div>
                    <p className="auth-layout__tagline">
                        {t('auth.brand.tagline')}
                    </p>

                    <div className="auth-layout__journal-card">
                        <span className="auth-layout__journal-label">{t('auth.brand.journalTitle')}</span>
                        <p className="auth-layout__journal-copy">{t('auth.brand.journalCopy')}</p>
                    </div>

                    <ul className="auth-layout__features">
                        {[
                            { icon: MdLibraryBooks, title: 'auth.brand.features.track', desc: 'auth.brand.features.trackDesc' },
                            { icon: MdTimer, title: 'auth.brand.features.time', desc: 'auth.brand.features.timeDesc' },
                            { icon: MdShowChart, title: 'auth.brand.features.visualize', desc: 'auth.brand.features.visualizeDesc' }
                        ].map((feature, index) => (
                            <li key={index}>
                                <div className="auth-layout__feature-header">
                                    <feature.icon className="auth-layout__feature-icon" />
                                    <span>{t(feature.title)}</span>
                                </div>
                                <div className="auth-layout__feature-tooltip">
                                    <div className="auth-layout__tooltip-desc">{t(feature.desc)}</div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <blockquote className="auth-layout__quote">
                        <p className="auth-layout__quote-text">{t('auth.brand.quote')}</p>
                        <footer className="auth-layout__quote-source">{t('auth.brand.quoteSource')}</footer>
                    </blockquote>
                </div>
                <div className="auth-layout__decorative-icon">
                    <GiBookshelf />
                </div>
            </div>

            <div className="auth-layout__form-area">
                <div className="auth-layout__form-shell">
                    <Card className="auth-layout__card">
                        <div className="auth-layout__header">
                            {icon && <span className="auth-layout__mobile-icon">{icon}</span>}
                            <h2 className="auth-layout__title">{title}</h2>
                        </div>
                        {children}
                    </Card>
                </div>
            </div>
        </div>
    );
};
