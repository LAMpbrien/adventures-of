-- Add image_quality column to books (defaults to 'standard' for existing books)
alter table books add column image_quality text not null default 'standard';
