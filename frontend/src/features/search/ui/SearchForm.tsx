import { useEffect, useId, useRef, type ChangeEvent, type FormEvent } from 'react';
import { FaHistory, FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import styles from './SearchForm.module.css';

type SearchFormProps = {
    query: string;
    setQuery: (value: string) => void;
    onSearch: () => void;
    recentSearches: string[];
    isHistoryOpen: boolean;
    onOpenHistory: () => void;
    onCloseHistory: () => void;
    onSelectRecentSearch: (query: string) => void;
};

const SearchForm = ({
    query,
    setQuery,
    onSearch,
    recentSearches,
    isHistoryOpen,
    onOpenHistory,
    onCloseHistory,
    onSelectRecentSearch,
}: SearchFormProps) => {
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const historyListId = useId();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearch();
    };

    useEffect(() => {
        if (!isHistoryOpen) {
            return undefined;
        }

        const handlePointerDown = (event: MouseEvent) => {
            if (containerRef.current?.contains(event.target as Node)) {
                return;
            }

            onCloseHistory();
        };

        const handleFocusIn = (event: FocusEvent) => {
            if (containerRef.current?.contains(event.target as Node)) {
                return;
            }

            onCloseHistory();
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onCloseHistory();
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('focusin', handleFocusIn);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('focusin', handleFocusIn);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isHistoryOpen, onCloseHistory]);

    return (
        <div className={styles.searchShell} ref={containerRef}>
            <form onSubmit={handleSubmit} className={styles.searchForm}>
                <FaSearch className={styles.searchIcon} />
                <input
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onFocus={onOpenHistory}
                    aria-expanded={isHistoryOpen && recentSearches.length > 0}
                    aria-controls={historyListId}
                    placeholder={t('search.placeholder')}
                    className={styles.searchInput}
                />
            </form>

            {isHistoryOpen && recentSearches.length > 0 && (
                <div className={styles.historyPanel}>
                    <ul id={historyListId} className={styles.historyList} aria-label={t('search.recentSearches')}>
                        {recentSearches.map((recentSearch) => (
                            <li key={recentSearch}>
                                <button
                                    type="button"
                                    className={styles.historyItem}
                                    onClick={() => onSelectRecentSearch(recentSearch)}
                                >
                                    <FaHistory className={styles.historyIcon} />
                                    <span>{recentSearch}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchForm;
