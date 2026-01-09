-- AlterTable
-- Add description column as nullable first
ALTER TABLE "Expense" ADD COLUMN IF NOT EXISTS "description" TEXT;

-- Update existing records with empty description
UPDATE "Expense" SET "description" = '' WHERE "description" IS NULL;

-- Now make it NOT NULL
ALTER TABLE "Expense" ALTER COLUMN "description" SET NOT NULL;
ALTER TABLE "Expense" ALTER COLUMN "description" SET DEFAULT '';
