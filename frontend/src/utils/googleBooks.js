export const getHighResImage = (url) => {
    if (!url) return '';
    let newUrl = url.replace('http:', 'https:');
    newUrl = newUrl.replace('&zoom=1', '&zoom=0');
    // Remove edge=curl if present for cleaner flat images
    newUrl = newUrl.replace('&edge=curl', '');
    return newUrl;
};

export const getOpenLibraryCoverUrl = (isbn) => {
    if (!isbn || isbn.startsWith('ID:')) return '';
    const clean = isbn.replace(/-/g, '');
    return clean.length >= 10 ? `https://covers.openlibrary.org/b/isbn/${clean}-L.jpg` : '';
};
