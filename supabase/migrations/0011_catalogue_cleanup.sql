-- 0011: catalogue name cleanup
--
-- The bulk import left 1,288 rows sharing a name with another row.
-- "Semi skimmed milk" appeared 18 times and "Milk" 16 times, because the
-- imported names carry no brand. To somebody browsing they were identical
-- cards. Folding the brand into the name fixes that without deleting
-- anything, and name_original keeps every rename reversible.
--
-- The curated 42 are excluded throughout: their names were written by hand
-- and already carry the brand.

alter table products add column if not exists name_original text;
update products set name_original = name where name_original is null;

-- Applied as a one off through the Management API, recorded here so the
-- migration history explains the state of the data:
--
--   1. brand folded into the name for 4,853 rows where the name was short
--      and did not already contain the brand
--   2. 66 fully upper case names title cased in SQL, then 420 more with
--      shouty runs fixed word by word so brands and units kept their case
--   3. 8 rows removed that were not UK groceries at all, a printer, a card
--      game, running shoes and entries titled in Arabic or Japanese
--
-- Result: 5,791 distinct names out of 6,646 became 6,396 out of 6,638,
-- and zero shouty names remain.
