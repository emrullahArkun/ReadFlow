import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FaCheck } from 'react-icons/fa';
import ConfirmDialog from './ConfirmDialog';

vi.mock('@chakra-ui/react', () => {
    const passthrough = (Tag: keyof JSX.IntrinsicElements = 'div') => ({ children, ...props }) => (
        <Tag {...props}>{children}</Tag>
    );

    return {
        AlertDialog: ({ isOpen, children }) => (isOpen ? <div role="alertdialog">{children}</div> : null),
        AlertDialogBody: passthrough(),
        AlertDialogFooter: passthrough(),
        AlertDialogHeader: passthrough(),
        AlertDialogContent: passthrough(),
        AlertDialogOverlay: passthrough(),
        Button: ({ children, onClick, bg, _hover, ...props }) => (
            <button type="button" onClick={onClick} data-bg={bg} data-hover-bg={_hover?.bg} {...props}>
                {children}
            </button>
        ),
        Icon: ({ as: IconComponent, color }) => (
            <span data-testid="dialog-icon" data-color={color}>
                {IconComponent ? <IconComponent /> : null}
            </span>
        ),
        Flex: passthrough(),
        Text: passthrough('p'),
    };
});

vi.mock('../theme/useThemeTokens', () => ({
    useThemeTokens: () => ({
        textColor: '#f8f4ec',
        overlayBg: 'rgba(0,0,0,0.7)',
        modalBg: '#161616',
        modalBorder: '#333333',
        modalSubtleBg: '#222222',
        modalMutedText: '#bbbbbb',
        modalShadow: '0 12px 32px rgba(0,0,0,0.3)',
    }),
}));

describe('ConfirmDialog', () => {
    const baseProps = {
        isOpen: true,
        onClose: vi.fn(),
        onConfirm: vi.fn(),
        title: 'Delete book',
        body: 'This cannot be undone.',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
    };

    it('does not render anything while closed', () => {
        render(<ConfirmDialog {...baseProps} isOpen={false} />);

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('renders the default destructive variant and wires both actions', () => {
        render(<ConfirmDialog {...baseProps} />);

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

        expect(baseProps.onClose).toHaveBeenCalledTimes(1);
        expect(baseProps.onConfirm).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute(
            'data-bg',
            'linear-gradient(180deg, rgba(156, 79, 62, 0.96) 0%, rgba(114, 50, 41, 0.96) 100%)',
        );
        expect(screen.getByTestId('dialog-icon')).toHaveAttribute('data-color', 'red.300');
    });

    it('uses the alternate palette and custom icon when a non-red variant is requested', () => {
        render(
            <ConfirmDialog
                {...baseProps}
                confirmColorScheme="gold"
                icon={FaCheck}
                iconColor="green.200"
            />,
        );

        expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute(
            'data-bg',
            'linear-gradient(180deg, rgba(243, 199, 133, 0.96) 0%, rgba(167, 127, 92, 0.94) 100%)',
        );
        expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute(
            'data-hover-bg',
            'linear-gradient(180deg, rgba(249, 209, 148, 0.98) 0%, rgba(182, 138, 101, 0.96) 100%)',
        );
        expect(screen.getByTestId('dialog-icon')).toHaveAttribute('data-color', 'green.200');
    });
});
