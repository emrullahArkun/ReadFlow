-- Convert publish_date (VARCHAR) to publish_year (INTEGER)

-- Add new integer column
ALTER TABLE books ADD COLUMN publish_year INTEGER;

-- Migrate existing data: extract first 4-digit year from any format (e.g. "2023", "1999-05-01", "June 1999")
UPDATE books
SET publish_year = substring(trim(publish_date) from '([0-9]{4})')::INTEGER;

-- Drop old column
ALTER TABLE books DROP COLUMN publish_date;
