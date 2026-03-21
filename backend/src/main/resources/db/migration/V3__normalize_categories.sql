-- Normalize categories from CSV column to a proper join table

CREATE TABLE book_categories (
    book_id     BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    category    VARCHAR(255) NOT NULL
);

CREATE INDEX idx_book_categories_book ON book_categories(book_id);

-- Migrate existing CSV data into the new table (filter empty strings from trailing commas)
INSERT INTO book_categories (book_id, category)
SELECT id, cat
FROM (
    SELECT id, TRIM(unnest(string_to_array(categories, ','))) AS cat
    FROM books
    WHERE categories IS NOT NULL AND categories != ''
) sub
WHERE cat != '';

-- Drop the old CSV column
ALTER TABLE books DROP COLUMN categories;
