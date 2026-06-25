-- Add deletion_status to track async background deletion of drive accounts.
-- Values: 'active' (normal) | 'deleting' (background workflow purging data).
ALTER TABLE "google_drive_accounts"
  ADD COLUMN "deletion_status" VARCHAR(32) NOT NULL DEFAULT 'active';

ALTER TABLE "one_drive_accounts"
  ADD COLUMN "deletion_status" VARCHAR(32) NOT NULL DEFAULT 'active';
