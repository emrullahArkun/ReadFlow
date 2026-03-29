import { render, screen, fireEvent, act } from '@testing-library/react';
import { forwardRef } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchResultCard from './SearchResultCard';
import * as AnimationContextModule from '../../../app/providers/AnimationProvider';

// Mock translations
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

// Mock googleBooks utils
vi.mock('../../../shared/lib/coverUtils', () => ({
    getOpenLibraryCoverUrl: (isbn) => isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg` : '',
}));

vi.mock('../../../shared/ui/BookCover', () => ({
    default: forwardRef(({ book }, ref) => (
        <div ref={book.coverUrl === 'no-ref' ? undefined : ref}>
            {book.title} cover
        </div>
    )),
}));

describe('SearchResultCard', () => {
    const mockBook = {
        title: 'Test Book',
        authors: ['Test Author'],
        isbn: '9781234567890',
        coverUrl: 'http://test.com/img.jpg',
        publishYear: 2023,
        pageCount: 200,
    };

    const mockFlyBook = vi.fn();
    const mockOnAdd = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(AnimationContextModule, 'useAnimation').mockReturnValue({
            flyBook: mockFlyBook
        });
    });

    const renderCard = (book = mockBook) => {
        return render(
            <SearchResultCard book={book} onAdd={mockOnAdd} />
        );
    };

    it('triggers animation and calls onAdd', async () => {
        renderCard();
        const card = screen.getByRole('button');

        await act(async () => {
            fireEvent.click(card);
        });

        expect(mockFlyBook).toHaveBeenCalled();
        expect(mockOnAdd).toHaveBeenCalledWith(mockBook);
    });

    it('renders book title and author metadata below the cover', () => {
        renderCard();

        expect(screen.getByText('Test Book')).toBeInTheDocument();
        expect(screen.getByText('Test Author')).toBeInTheDocument();
    });

    it('renders a string author without array access', () => {
        renderCard({
            ...mockBook,
            authors: 'Solo Author',
        });

        expect(screen.getByText('Solo Author')).toBeInTheDocument();
    });

    it('falls back to Unknown Author when no author is available', () => {
        renderCard({
            ...mockBook,
            authors: null,
        });

        expect(screen.getByText('Unknown Author')).toBeInTheDocument();
    });

    it('does not trigger the animation when adding the book fails', async () => {
        mockOnAdd.mockRejectedValue(new Error('Duplicate book'));
        renderCard();
        const card = screen.getByRole('button');

        await act(async () => {
            fireEvent.click(card);
        });

        expect(mockOnAdd).toHaveBeenCalledWith(mockBook);
        expect(mockFlyBook).not.toHaveBeenCalled();
    });

    it('triggers handleAddClick on Enter key press', async () => {
        renderCard();
        const card = screen.getByRole('button');

        await act(async () => {
            fireEvent.keyDown(card, { key: 'Enter' });
        });
        expect(mockOnAdd).toHaveBeenCalled();
    });

    it('triggers handleAddClick on Space key press', async () => {
        mockOnAdd.mockClear();
        renderCard();
        const card = screen.getByRole('button');

        await act(async () => {
            fireEvent.keyDown(card, { key: ' ' });
        });
        expect(mockOnAdd).toHaveBeenCalled();
    });

    it('ignores keydown for other keys', () => {
        mockOnAdd.mockClear();
        renderCard();
        const card = screen.getByRole('button');

        fireEvent.keyDown(card, { key: 'Escape' });
        expect(mockOnAdd).not.toHaveBeenCalled();
    });

    it('prevents multiple additive requests (double click guard)', async () => {
        mockOnAdd.mockClear();
        let resolveAdd;
        mockOnAdd.mockImplementation(() => new Promise((resolve) => {
            resolveAdd = resolve;
        }));

        renderCard();
        const card = screen.getByRole('button');

        await act(async () => {
            fireEvent.click(card);
        });
        expect(mockOnAdd).toHaveBeenCalledTimes(1);

        await act(async () => {
            fireEvent.click(card);
        });
        expect(mockOnAdd).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveAdd();
        });
    });

    it('skips the fly animation when the cover ref is unavailable', async () => {
        renderCard({
            ...mockBook,
            coverUrl: 'no-ref',
        });

        await act(async () => {
            fireEvent.click(screen.getByRole('button'));
        });

        expect(mockOnAdd).toHaveBeenCalledWith(expect.objectContaining({
            coverUrl: 'no-ref',
        }));
        expect(mockFlyBook).not.toHaveBeenCalled();
    });
});
