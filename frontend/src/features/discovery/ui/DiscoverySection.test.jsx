import { act, fireEvent, render, screen } from '@testing-library/react';
import { forwardRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DiscoverySection from './DiscoverySection';
import * as AnimationProviderModule from '../../../app/providers/AnimationProvider';

const mockMutateAsync = vi.fn();
const mockFlyBook = vi.fn();

vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key }),
}));

vi.mock('../model/useAddDiscoveryBook.jsx', () => ({
    useAddDiscoveryBook: () => ({
        mutateAsync: mockMutateAsync,
    }),
}));

vi.mock('../../../shared/ui/BookCover', () => ({
    default: forwardRef(({ book }, ref) => <div ref={ref}>{book.title}</div>),
}));

describe('DiscoverySection', () => {
    const book = {
        title: 'Discovery Book',
        authors: ['Author'],
        isbn: '9781234567890',
        coverUrl: 'http://test.com/cover.jpg',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(AnimationProviderModule, 'useAnimation').mockReturnValue({
            flyBook: mockFlyBook,
        });
    });

    const renderSection = () => render(
        <DiscoverySection
            title="By author"
            subtitle="Author"
            iconType="author"
            books={[book]}
            emptyMessage="No books"
        />
    );

    it('does not trigger the fly animation when adding the book fails', async () => {
        mockMutateAsync.mockRejectedValue(new Error('Duplicate book'));
        renderSection();

        await act(async () => {
            fireEvent.click(screen.getByRole('button'));
        });

        expect(mockMutateAsync).toHaveBeenCalledWith(book);
        expect(mockFlyBook).not.toHaveBeenCalled();
    });
});
