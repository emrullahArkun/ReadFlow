export const READING_SESSION_PHASES = {
    BOOTING: 'booting',
    IDLE: 'idle',
    STARTING: 'starting',
    ACTIVE: 'active',
    PAUSED: 'paused',
    PAUSING: 'pausing',
    RESUMING: 'resuming',
    STOPPING: 'stopping',
};

const PHASE_BY_PENDING_ACTION = {
    starting: READING_SESSION_PHASES.STARTING,
    pausing: READING_SESSION_PHASES.PAUSING,
    resuming: READING_SESSION_PHASES.RESUMING,
    stopping: READING_SESSION_PHASES.STOPPING,
};

export const deriveReadingSessionPhase = ({ loading, activeSession, pendingAction }) => {
    if (loading) {
        return READING_SESSION_PHASES.BOOTING;
    }

    if (pendingAction) {
        return PHASE_BY_PENDING_ACTION[pendingAction] || READING_SESSION_PHASES.ACTIVE;
    }

    if (!activeSession) {
        return READING_SESSION_PHASES.IDLE;
    }

    return activeSession.status === 'PAUSED'
        ? READING_SESSION_PHASES.PAUSED
        : READING_SESSION_PHASES.ACTIVE;
};

export const isBusyReadingSessionPhase = (phase) => (
    phase === READING_SESSION_PHASES.STARTING
    || phase === READING_SESSION_PHASES.PAUSING
    || phase === READING_SESSION_PHASES.RESUMING
    || phase === READING_SESSION_PHASES.STOPPING
);
