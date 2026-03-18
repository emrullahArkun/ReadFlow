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

export const mapGoogleBookToNewBook = (volumeInfo, isbnInfo, id) => {
    const uniqueId = isbnInfo ? isbnInfo.identifier : `ID:${id}`;
    const googleHasImage = volumeInfo.readingModes?.image !== false;
    const googleUrl = googleHasImage ? getHighResImage(volumeInfo.imageLinks?.thumbnail) : '';
    const coverUrl = googleUrl || getOpenLibraryCoverUrl(uniqueId);

    return {
        title: volumeInfo.title,
        isbn: uniqueId,
        authorName: volumeInfo.authors ? volumeInfo.authors[0] : 'Unknown Author',
        publishDate: volumeInfo.publishedDate || 'Unknown Date',
        coverUrl: coverUrl,
        pageCount: volumeInfo.pageCount || 0
    };
};
