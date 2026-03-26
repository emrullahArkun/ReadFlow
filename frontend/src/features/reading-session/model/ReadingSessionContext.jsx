import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../auth/model';
import { useQueryClient } from '@tanstack/react-query';
import { sessionsApi } from '../api';
import { useControllerLock } from './useControllerLock';
import {
    createInitialReadingSessionState,
    isBusyReadingSessionPhase,
    READING_SESSION_EVENTS,
    READING_SESSION_PHASES,
    readingSessionReducer,
} from './readingSessionMachine';
import { useSessionTimer } from './useSessionTimer';
import { useSessionBroadcast } from './useSessionBroadcast';

const ReadingSessionContext = createContext(null);

export const ReadingSessionProvider = ({ children }) => {
    const { token } = useAuth();
    const queryClient = useQueryClient();
    const [state, dispatch] = useReducer(readingSessionReducer, undefined, createInitialReadingSessionState);

    const { activeSession, phase: sessionPhase } = state;
    const loading = sessionPhase === READING_SESSION_PHASES.BOOTING;
    const isPaused = sessionPhase === READING_SESSION_PHASES.PAUSED;
    const isBusy = isBusyReadingSessionPhase(sessionPhase);

    const refreshSession = useCallback(async () => {
        if (!token) {
            return;
        }

        try {
            const session = await sessionsApi.getActive();
            dispatch({ type: READING_SESSION_EVENTS.REFRESH_SUCCEEDED, session });
        } catch {
            dispatch({ type: READING_SESSION_EVENTS.REFRESH_FAILED });
            // Session refresh failed silently — will retry on next trigger
        }
    }, [token]);

    // Cross-tab broadcast
    const { broadcastUpdate } = useSessionBroadcast(token, refreshSession);

    // Timer
    const { elapsedSeconds, formattedTime } = useSessionTimer(activeSession);

    // Fetch active session on mount/token change
    useEffect(() => {
        if (!token) {
            dispatch({ type: READING_SESSION_EVENTS.SESSION_CLEARED });
            return;
        }

        refreshSession();
    }, [token, refreshSession]);

    // Controller Lock
    const { isController, takeControl } = useControllerLock(activeSession);

    const startSession = useCallback(async (bookId) => {
        dispatch({ type: READING_SESSION_EVENTS.START_REQUESTED });
        try {
            const session = await sessionsApi.start(bookId);
            dispatch({ type: READING_SESSION_EVENTS.START_SUCCEEDED, session });
            takeControl();
            broadcastUpdate();
            return true;
        } catch {
            dispatch({ type: READING_SESSION_EVENTS.START_FAILED });
            return false;
        }
    }, [takeControl, broadcastUpdate]);

    const stopSession = useCallback(async (endTime, endPage) => {
        dispatch({ type: READING_SESSION_EVENTS.STOP_REQUESTED });
        try {
            await sessionsApi.stop(endTime, endPage);
            dispatch({ type: READING_SESSION_EVENTS.STOP_SUCCEEDED });
            broadcastUpdate();

            // Invalidate caches to reflect the newly read pages immediately
            queryClient.invalidateQueries({ queryKey: ['myBooks'] });
            queryClient.invalidateQueries({ queryKey: ['book'] });
            queryClient.invalidateQueries({ queryKey: ['stats'] });
            queryClient.invalidateQueries({ queryKey: ['goals'] });
            return true;
        } catch {
            dispatch({ type: READING_SESSION_EVENTS.STOP_FAILED });
            return false;
        }
    }, [broadcastUpdate, queryClient]);

    const pauseSession = useCallback(async () => {
        if (!isController || isBusy) return;
        dispatch({ type: READING_SESSION_EVENTS.PAUSE_REQUESTED });
        try {
            const session = await sessionsApi.pause();
            dispatch({ type: READING_SESSION_EVENTS.PAUSE_SUCCEEDED, session });
            broadcastUpdate();
        } catch {
            dispatch({ type: READING_SESSION_EVENTS.PAUSE_FAILED });
            // Pause failed — session state unchanged
        }
    }, [isController, isBusy, broadcastUpdate]);

    const resumeSession = useCallback(async () => {
        if (!isController || isBusy) return;
        dispatch({ type: READING_SESSION_EVENTS.RESUME_REQUESTED });
        try {
            const session = await sessionsApi.resume();
            dispatch({ type: READING_SESSION_EVENTS.RESUME_SUCCEEDED, session });
            broadcastUpdate();
        } catch {
            dispatch({ type: READING_SESSION_EVENTS.RESUME_FAILED });
            // Resume failed — session state unchanged
        }
    }, [isController, isBusy, broadcastUpdate]);

    const value = useMemo(() => ({
        activeSession,
        loading,
        sessionPhase,
        isBusy,
        elapsedSeconds,
        formattedTime,
        isPaused,
        startSession,
        stopSession,
        pauseSession,
        resumeSession,
        isController,
        takeControl
    }), [activeSession, loading, sessionPhase, isBusy, elapsedSeconds, formattedTime, isPaused, startSession, stopSession, pauseSession, resumeSession, isController, takeControl]);

    return (
        <ReadingSessionContext.Provider value={value}>
            {children}
        </ReadingSessionContext.Provider>
    );
};

export const useReadingSessionContext = () => {
    const context = useContext(ReadingSessionContext);
    if (!context) {
        throw new Error('useReadingSessionContext must be used within a ReadingSessionProvider');
    }
    return context;
};
