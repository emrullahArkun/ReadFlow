type OpenLibraryCoverSize = 'S' | 'M' | 'L';

export const getOpenLibraryCoverUrl = (isbn?: string | null, size: OpenLibraryCoverSize = 'M'): string => {
    if (!isbn || isbn.startsWith('ID:')) return '';

    const clean = isbn.replace(/-/g, '');
    return clean.length >= 10 ? `https://covers.openlibrary.org/b/isbn/${clean}-${size}.jpg?default=false` : '';
};
