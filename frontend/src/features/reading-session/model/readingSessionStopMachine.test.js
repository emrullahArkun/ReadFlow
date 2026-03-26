import { describe, expect, it } from 'vitest';
import {
    createInitialStopFlowState,
    READING_SESSION_STOP_EVENTS,
    readingSessionStopReducer,
} from './readingSessionStopMachine';

describe('readingSessionStopMachine', () => {
    it('starts with a closed dialog and empty end page', () => {
        expect(createInitialStopFlowState()).toEqual({
            endPage: '',
            isOpen: false,
            resumeOnCancel: false,
        });
    });

    it('syncs the end page from the loaded book', () => {
        const nextState = readingSessionStopReducer(createInitialStopFlowState(), {
            type: READING_SESSION_STOP_EVENTS.BOOK_SYNCED,
            currentPage: 42,
        });

        expect(nextState.endPage).toBe('42');
    });

    it('opens the confirm flow and tracks whether cancel should resume', () => {
        const runningState = readingSessionStopReducer(createInitialStopFlowState(), {
            type: READING_SESSION_STOP_EVENTS.STOP_REQUESTED,
            wasPaused: false,
        });
        const pausedState = readingSessionStopReducer(createInitialStopFlowState(), {
            type: READING_SESSION_STOP_EVENTS.STOP_REQUESTED,
            wasPaused: true,
        });

        expect(runningState).toEqual({
            endPage: '',
            isOpen: true,
            resumeOnCancel: true,
        });
        expect(pausedState).toEqual({
            endPage: '',
            isOpen: true,
            resumeOnCancel: false,
        });
    });

    it('updates the end page and clears the dialog on cancel or failure', () => {
        const openState = {
            endPage: '12',
            isOpen: true,
            resumeOnCancel: true,
        };

        const changedState = readingSessionStopReducer(openState, {
            type: READING_SESSION_STOP_EVENTS.END_PAGE_CHANGED,
            value: '88',
        });
        const cancelledState = readingSessionStopReducer(changedState, {
            type: READING_SESSION_STOP_EVENTS.STOP_CANCELLED,
        });
        const failedState = readingSessionStopReducer(changedState, {
            type: READING_SESSION_STOP_EVENTS.STOP_FAILED,
        });

        expect(changedState.endPage).toBe('88');
        expect(cancelledState).toEqual({
            endPage: '88',
            isOpen: false,
            resumeOnCancel: false,
        });
        expect(failedState).toEqual({
            endPage: '88',
            isOpen: false,
            resumeOnCancel: false,
        });
    });
});
