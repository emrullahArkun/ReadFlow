import { describe, expect, it } from 'vitest';
import {
    createInitialReadingSessionState,
    isBusyReadingSessionPhase,
    READING_SESSION_EVENTS,
    READING_SESSION_PHASES,
    readingSessionReducer,
} from './readingSessionMachine';

describe('readingSessionMachine', () => {
    it('starts in booting phase', () => {
        expect(createInitialReadingSessionState()).toEqual({
            activeSession: null,
            phase: READING_SESSION_PHASES.BOOTING,
        });
    });

    it('moves to idle when boot refresh fails', () => {
        const nextState = readingSessionReducer(createInitialReadingSessionState(), {
            type: READING_SESSION_EVENTS.REFRESH_FAILED,
        });

        expect(nextState.phase).toBe(READING_SESSION_PHASES.IDLE);
        expect(nextState.activeSession).toBeNull();
    });

    it('keeps the current session when a later refresh fails', () => {
        const activeSession = { id: 1, status: 'ACTIVE' };

        const nextState = readingSessionReducer({
            activeSession,
            phase: READING_SESSION_PHASES.ACTIVE,
        }, {
            type: READING_SESSION_EVENTS.REFRESH_FAILED,
        });

        expect(nextState.phase).toBe(READING_SESSION_PHASES.ACTIVE);
        expect(nextState.activeSession).toEqual(activeSession);
    });

    it('maps paused sessions to the paused phase', () => {
        const pausedSession = { id: 2, status: 'PAUSED' };

        const nextState = readingSessionReducer(createInitialReadingSessionState(), {
            type: READING_SESSION_EVENTS.REFRESH_SUCCEEDED,
            session: pausedSession,
        });

        expect(nextState.phase).toBe(READING_SESSION_PHASES.PAUSED);
        expect(nextState.activeSession).toEqual(pausedSession);
    });

    it('moves through start and stop transitions explicitly', () => {
        const requestedState = readingSessionReducer({
            activeSession: null,
            phase: READING_SESSION_PHASES.IDLE,
        }, {
            type: READING_SESSION_EVENTS.START_REQUESTED,
        });

        expect(requestedState.phase).toBe(READING_SESSION_PHASES.STARTING);

        const activeSession = { id: 3, status: 'ACTIVE' };
        const startedState = readingSessionReducer(requestedState, {
            type: READING_SESSION_EVENTS.START_SUCCEEDED,
            session: activeSession,
        });
        expect(startedState.phase).toBe(READING_SESSION_PHASES.ACTIVE);
        expect(startedState.activeSession).toEqual(activeSession);

        const stoppingState = readingSessionReducer(startedState, {
            type: READING_SESSION_EVENTS.STOP_REQUESTED,
        });
        expect(stoppingState.phase).toBe(READING_SESSION_PHASES.STOPPING);

        const stoppedState = readingSessionReducer(stoppingState, {
            type: READING_SESSION_EVENTS.STOP_SUCCEEDED,
        });
        expect(stoppedState).toEqual({
            activeSession: null,
            phase: READING_SESSION_PHASES.IDLE,
        });
    });

    it('restores the settled phase when a pause or resume fails', () => {
        const activeSession = { id: 4, status: 'ACTIVE' };
        const pausedSession = { id: 4, status: 'PAUSED' };

        const pauseFailureState = readingSessionReducer({
            activeSession,
            phase: READING_SESSION_PHASES.PAUSING,
        }, {
            type: READING_SESSION_EVENTS.PAUSE_FAILED,
        });
        expect(pauseFailureState.phase).toBe(READING_SESSION_PHASES.ACTIVE);

        const resumeFailureState = readingSessionReducer({
            activeSession: pausedSession,
            phase: READING_SESSION_PHASES.RESUMING,
        }, {
            type: READING_SESSION_EVENTS.RESUME_FAILED,
        });
        expect(resumeFailureState.phase).toBe(READING_SESSION_PHASES.PAUSED);
    });

    it('marks only transition phases as busy', () => {
        expect(isBusyReadingSessionPhase(READING_SESSION_PHASES.STARTING)).toBe(true);
        expect(isBusyReadingSessionPhase(READING_SESSION_PHASES.PAUSING)).toBe(true);
        expect(isBusyReadingSessionPhase(READING_SESSION_PHASES.RESUMING)).toBe(true);
        expect(isBusyReadingSessionPhase(READING_SESSION_PHASES.STOPPING)).toBe(true);
        expect(isBusyReadingSessionPhase(READING_SESSION_PHASES.ACTIVE)).toBe(false);
        expect(isBusyReadingSessionPhase(READING_SESSION_PHASES.PAUSED)).toBe(false);
    });
});
