export const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

export const parseLocalDate = (value: string): Date => {
    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return new Date(value);
    }

    return new Date(year, month - 1, day);
};

export const getStartOfLocalWeek = (date: Date): Date => {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayOfWeek = start.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    start.setDate(start.getDate() + mondayOffset);
    start.setHours(0, 0, 0, 0);
    return start;
};
