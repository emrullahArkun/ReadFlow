import { useEffect, useReducer } from 'react';
import { ROUTES } from '../../../app/router/routes';
import {
    createInitialStopFlowState,
    READING_SESSION_STOP_EVENTS,
    readingSessionStopReducer,
} from './readingSessionStopMachine';

export const useReadingSessionStopFlow = ({
    book,
    isPaused,
    isBusy,
    pauseSession,
    resumeSession,
    stopSession,
    navigate,
    toast,
    t,
    setHasStopped,
}) => {
    const [state, dispatch] = useReducer(readingSessionStopReducer, undefined, createInitialStopFlowState);
    const { isOpen: showStopConfirm, endPage, resumeOnCancel } = state;

    useEffect(() => {
        if (book) {
            dispatch({
                type: READING_SESSION_STOP_EVENTS.BOOK_SYNCED,
                currentPage: book.currentPage,
            });
        }
    }, [book?.currentPage]);

    const handleStopClick = () => {
        if (isBusy) {
            return;
        }

        if (!isPaused) {
            pauseSession();
        }

        dispatch({
            type: READING_SESSION_STOP_EVENTS.STOP_REQUESTED,
            wasPaused: isPaused,
        });
    };

    const handleStopCancel = () => {
        if (resumeOnCancel) {
            resumeSession();
        }

        dispatch({ type: READING_SESSION_STOP_EVENTS.STOP_CANCELLED });
    };

    const handleConfirmStop = async () => {
        const pageNum = parseInt(endPage, 10);
        if (Number.isNaN(pageNum) || pageNum < 0) {
            return;
        }

        if (book.pageCount && pageNum > book.pageCount) {
            toast({
                title: t('readingSession.alerts.pageExceeds', { total: book.pageCount }),
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        const startPage = book.currentPage || 0;
        const pagesRead = pageNum - startPage;

        setHasStopped(true);
        const success = await stopSession(new Date(), pageNum);

        if (success) {
            toast({
                title: t('readingSession.alerts.summary', { pages: pagesRead > 0 ? pagesRead : 0 }),
                status: 'success',
                duration: 5000,
                isClosable: true,
            });
            navigate(ROUTES.MY_BOOKS);
            return;
        }

        setHasStopped(false);
        if (resumeOnCancel) {
            resumeSession();
        }
        dispatch({ type: READING_SESSION_STOP_EVENTS.STOP_FAILED });
        toast({
            title: t('readingSession.alerts.stopError'),
            status: 'error',
            duration: 5000,
            isClosable: true,
        });
    };

    return {
        showStopConfirm,
        endPage,
        setEndPage: (value) => dispatch({ type: READING_SESSION_STOP_EVENTS.END_PAGE_CHANGED, value }),
        handleStopClick,
        handleStopCancel,
        handleConfirmStop,
    };
};
