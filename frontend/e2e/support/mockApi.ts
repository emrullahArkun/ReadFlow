import type { Page, Route } from '@playwright/test';

const mockUser = {
    id: 1,
    email: 'reader@example.com',
    role: 'USER',
};

const mockBooks = [
    {
        id: 101,
        isbn: '9781234567890',
        title: 'Deep Work',
        authorName: 'Cal Newport',
        publishYear: 2016,
        coverUrl: null,
        pageCount: 304,
        currentPage: 120,
        startDate: '2026-03-25',
        completed: false,
        readingGoalType: 'WEEKLY',
        readingGoalPages: 70,
        readingGoalProgress: 28,
        categories: ['Productivity'],
    },
    {
        id: 102,
        isbn: '9789876543210',
        title: 'Atomic Habits',
        authorName: 'James Clear',
        publishYear: 2018,
        coverUrl: null,
        pageCount: 320,
        currentPage: 0,
        startDate: null,
        completed: false,
        readingGoalType: null,
        readingGoalPages: null,
        readingGoalProgress: null,
        categories: ['Self-Improvement'],
    },
];

const mockFocus = {
    currentBook: mockBooks[0],
    queuedBooks: [mockBooks[1]],
    activeBooksCount: 1,
    completedBooksCount: 0,
};

const mockStatsOverview = {
    totalBooks: 2,
    completedBooks: 0,
    totalPagesRead: 188,
    totalReadingMinutes: 240,
    currentStreak: 4,
    longestStreak: 9,
    genreDistribution: [
        { genre: 'Productivity', count: 1 },
        { genre: 'Self-Improvement', count: 1 },
    ],
    dailyActivity: [
        { date: '2026-03-24', pagesRead: 24 },
        { date: '2026-03-26', pagesRead: 36 },
        { date: '2026-03-28', pagesRead: 28 },
        { date: '2026-03-30', pagesRead: 40 },
    ],
    readingRhythm: {
        enoughData: true,
        preferredTimeOfDay: 'EVENING',
        preferredSessionLength: 'MEDIUM',
        activeDaysLast14: 4,
        sessionsLast14: 5,
        averagePagesPerSession: 26,
        averageMinutesPerSession: 48,
    },
};

const mockStreak = {
    currentStreak: 4,
    longestStreak: 9,
};

type MockApiOptions = {
    authenticated?: boolean;
};

const json = async (route: Route, data: unknown, status = 200): Promise<void> => {
    await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(data),
    });
};

export const useEnglishLocale = async (page: Page): Promise<void> => {
    await page.addInitScript(() => {
        window.localStorage.setItem('i18nextLng', 'en');
    });
};

export const seedAuthenticatedUser = async (page: Page): Promise<void> => {
    await page.addInitScript((user) => {
        window.localStorage.setItem('user', JSON.stringify(user));
    }, mockUser);
};

export const installApiMocks = async (
    page: Page,
    { authenticated = false }: MockApiOptions = {},
): Promise<void> => {
    await page.route(
        (url) => new URL(url).pathname.startsWith('/api/'),
        async (route) => {
        const request = route.request();
        const method = request.method();
        const url = new URL(request.url());
        const { pathname } = url;

        if (pathname === '/api/auth/session' && method === 'GET') {
            if (!authenticated) {
                await json(route, { message: 'Unauthorized' }, 401);
                return;
            }

            await json(route, { user: mockUser });
            return;
        }

        if (pathname === '/api/auth/login' && method === 'POST') {
            await json(route, { user: mockUser });
            return;
        }

        if (pathname === '/api/auth/register' && method === 'POST') {
            await json(route, { message: 'Registered', user: mockUser }, 201);
            return;
        }

        if (pathname === '/api/auth/logout' && method === 'POST') {
            await route.fulfill({ status: 204, body: '' });
            return;
        }

        if (pathname === '/api/sessions/active' && method === 'GET') {
            await route.fulfill({ status: 204, body: '' });
            return;
        }

        if (pathname === '/api/books/focus' && method === 'GET') {
            await json(route, mockFocus);
            return;
        }

        if (pathname === '/api/books' && method === 'GET') {
            await json(route, {
                content: mockBooks,
                totalPages: 1,
                totalElements: mockBooks.length,
                size: 24,
                number: 0,
            });
            return;
        }

        if (pathname === '/api/books/with-goals' && method === 'GET') {
            await json(route, [mockBooks[0]]);
            return;
        }

        if (pathname === '/api/stats/streak' && method === 'GET') {
            await json(route, mockStreak);
            return;
        }

        if (pathname === '/api/stats/overview' && method === 'GET') {
            await json(route, mockStatsOverview);
            return;
        }

        await json(route, { message: `Unhandled mock route: ${method} ${pathname}` }, 404);
        },
    );
};
