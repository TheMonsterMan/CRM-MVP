-- Enable extension (idempotent)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Contacts
CREATE INDEX IF NOT EXISTS contact_first_trgm  ON "Contact" USING GIN (lower("firstName") gin_trgm_ops);
CREATE INDEX IF NOT EXISTS contact_last_trgm   ON "Contact" USING GIN (lower("lastName") gin_trgm_ops);
CREATE INDEX IF NOT EXISTS contact_email_trgm  ON "Contact" USING GIN (lower("email") gin_trgm_ops);
CREATE INDEX IF NOT EXISTS contact_phone_trgm  ON "Contact" USING GIN (lower("phone") gin_trgm_ops);

-- Accounts
CREATE INDEX IF NOT EXISTS account_name_trgm   ON "Account" USING GIN (lower("name") gin_trgm_ops);
CREATE INDEX IF NOT EXISTS account_domain_trgm ON "Account" USING GIN (lower("domain") gin_trgm_ops);

-- Deals
CREATE INDEX IF NOT EXISTS deal_name_trgm      ON "Deal" USING GIN (lower("name") gin_trgm_ops);
