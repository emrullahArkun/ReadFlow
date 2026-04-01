import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import SearchForm from './SearchForm';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('SearchForm', () => {
    it('lets the user choose a recent search with ArrowDown and Enter', () => {
        const setQuery = vi.fn();
        const onSearch = vi.fn();
        const onOpenHistory = vi.fn();
        const onCloseHistory = vi.fn();
        const onSelectRecentSearch = vi.fn();

        render(
            <SearchForm
                query=""
                setQuery={setQuery}
                onSearch={onSearch}
                recentSearches={['Dune', 'Sapiens']}
                isHistoryOpen
                onOpenHistory={onOpenHistory}
                onCloseHistory={onCloseHistory}
                onSelectRecentSearch={onSelectRecentSearch}
            />
        );

        const input = screen.getByPlaceholderText('search.placeholder');

        fireEvent.keyDown(input, { key: 'ArrowDown' });

        expect(screen.getByRole('button', { name: /Dune/i })).toHaveAttribute('aria-selected', 'true');

        fireEvent.keyDown(input, { key: 'Enter' });

        expect(onSelectRecentSearch).toHaveBeenCalledWith('Dune');
        expect(onSearch).not.toHaveBeenCalled();
    });
});
