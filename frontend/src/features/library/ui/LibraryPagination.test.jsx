import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import LibraryPagination from './LibraryPagination';
import '../../../app/i18n';

describe('LibraryPagination', () => {
    it('uses generic labels and clamps to a single page when no context label is provided', () => {
        render(
            <LibraryPagination
                page={4}
                totalPages={0}
                onPreviousPage={vi.fn()}
                onNextPage={vi.fn()}
            />
        );

        expect(screen.getByText('1 / 1')).toBeInTheDocument();
        expect(screen.getByLabelText('Previous Page')).toBeDisabled();
        expect(screen.getByLabelText('Next Page')).toBeDisabled();
    });

    it('uses contextual labels and triggers the next callback when more pages exist', async () => {
        const user = userEvent.setup();
        const onNextPage = vi.fn();

        render(
            <LibraryPagination
                page={0}
                totalPages={2}
                onPreviousPage={vi.fn()}
                onNextPage={onNextPage}
                contextLabel="Current Reads"
            />
        );

        const nextButton = screen.getByLabelText('Next page for Current Reads');

        expect(screen.getByLabelText('Previous page for Current Reads')).toBeDisabled();
        expect(nextButton).not.toBeDisabled();

        await user.click(nextButton);

        expect(onNextPage).toHaveBeenCalledTimes(1);
    });

    it('disables the next button and keeps the previous button active on the last page', () => {
        render(
            <LibraryPagination
                page={1}
                totalPages={2}
                onPreviousPage={vi.fn()}
                onNextPage={vi.fn()}
                contextLabel="Waiting for You"
            />
        );

        expect(screen.getByLabelText('Previous page for Waiting for You')).not.toBeDisabled();
        expect(screen.getByLabelText('Next page for Waiting for You')).toBeDisabled();
    });
});
