-- Add character_appearance column to books for consistent character descriptions across illustrations
alter table books add column character_appearance text;
