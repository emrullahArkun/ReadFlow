export const createInitialStopFlowState = () => ({
    endPage: '',
    isOpen: false,
    resumeOnCancel: false,
});

export const READING_SESSION_STOP_EVENTS = {
    BOOK_SYNCED: 'BOOK_SYNCED',
    STOP_REQUESTED: 'STOP_REQUESTED',
    END_PAGE_CHANGED: 'END_PAGE_CHANGED',
    STOP_CANCELLED: 'STOP_CANCELLED',
    STOP_FAILED: 'STOP_FAILED',
};

export const readingSessionStopReducer = (state, event) => {
    switch (event.type) {
        case READING_SESSION_STOP_EVENTS.BOOK_SYNCED:
            return {
                ...state,
                endPage: String(event.currentPage ?? ''),
            };

        case READING_SESSION_STOP_EVENTS.STOP_REQUESTED:
            return {
                ...state,
                isOpen: true,
                resumeOnCancel: !event.wasPaused,
            };

        case READING_SESSION_STOP_EVENTS.END_PAGE_CHANGED:
            return {
                ...state,
                endPage: event.value,
            };

        case READING_SESSION_STOP_EVENTS.STOP_CANCELLED:
        case READING_SESSION_STOP_EVENTS.STOP_FAILED:
            return {
                ...state,
                isOpen: false,
                resumeOnCancel: false,
            };

        default:
            return state;
    }
};
